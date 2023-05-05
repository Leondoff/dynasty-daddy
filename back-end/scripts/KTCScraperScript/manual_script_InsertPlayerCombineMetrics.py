import csv
import PlayerService
import psycopg2
from Constants import playerExceptionsMap
from BeautifulSoupService import setUpSoup
import json

QB_CONTRACT_LINK = "https://overthecap.com/position/quarterback"
RB_CONTRACT_LINK = "https://overthecap.com/position/running-back"
WR_CONTRACT_LINK = "https://overthecap.com/position/wide-receiver"
TE_CONTRACT_LINK = "https://overthecap.com/position/tight-end"

PLAYER_PROFILER_EXCEPTIONS = {
    "kennethwalkerrb": "kenneth-walker-2",
    "tankdellwr": "nathaniel-dell",
    "robbieandersonwr": "robby-anderson",
    "kennethgainwellrb": "kenny-gainwell",
    "jaelondardenwr": "jaedon-darden",
    "campeoplesrb": "camerun-peoples",
    "chigoziemokonkwote": "chig-okonkwo",
    "trestanebnerrb": "treston-ebner",
    "nickwestbrookikhinewr": "nick-westbrook",
    "mattlacossete":"matt-lacrosse"
}

# reads ras scores from csv and creates name_id dictionary
def fetchRASScoreDict():
    with open('C:\\Users\\Jeremy\\Documents\\Development\\dynasty-daddy\\back-end\\scripts\\resources\\ras_scores.csv', 'r') as file:
        csvreader = csv.reader(file)

        rasDict = {}
        for row in csvreader:
            if row[2] in ["QB", "RB", "WR", "TE"]:
                playerNameId = PlayerService.cleanPlayerIdString(row[1] + row[2])
                rasDict[playerNameId] = {
                    "ras": float(row[5]) if row[5] != '' else 0,
                    "alltime_ras": float(row[6]) if row[6] != '' else 0
                }
        return rasDict
    
# fetch player contract data from overthecap.com
def fetchPlayerContractData(url, pos):
    soup = setUpSoup(url)
    contractDict = {}
    
    for tr in soup.find_all('tr')[1:]:
        tds = tr.find_all('td')
        name = tds[0].text.strip()
        playerNameId = PlayerService.cleanPlayerIdString(name + pos)
        total = tds[3].text.strip()
        per_year = tds[4].text.strip()
        guaranteed_fully = tds[5].text.strip()
        guaranteed_free = tds[6].text.strip()
        free_agent = tds[7].text.strip()
        contractDict[playerNameId] = {
            "total": total,
            "per_year": per_year,
            "guaranteed_fully": guaranteed_fully,
            "guaranteed_free": guaranteed_free,
            "free_agent": free_agent
        }
    return contractDict

# fetch player metrics from player profiler
def fetchPlayerProfilerData(player):
    baseUrl = 'https://www.playerprofiler.com/nfl/' + player.replace(".", "").replace(" ", "-").lower().replace("-jr", "")
    
    # Scrape basic metrics from player profiler
    soup = setUpSoup(baseUrl)
    playerDict = {}
    for dl in soup.find_all('dl'):
        metricName = dl.find('dt').text.strip()
        if metricName is not None:
            metricValue = dl.find('dd').text.strip()
            playerDict[metricName] = metricValue.split("\n")[0]
    
    # scrape workout metrics from player profiler
    workoutMetrics = soup.find('div', {'class': 'cube-face cube-face--workout-metrics'})
    if workoutMetrics is not None:
        metrics = workoutMetrics.find_all('div')[1]
        metricTitles = []
        for div in workoutMetrics.find_all('div'):
            if len(div) is 1 and 'Pro Day' not in div.text.strip():
                metricTitles.append(div.text.strip())
        workoutMetrics = []
        ind = 0
        for value in metrics.find_all('div', {'class': 'pt-1 text-center space-y-2'}):
            valueList = value.text.strip().split("\n")
            while len(valueList) > 2:
                valueList = valueList[:len(valueList) - 2]
            workoutMetrics.append({
                "display": metricTitles[ind],
                "value": valueList[0],
                "percentile": valueList[1].replace("(", "").replace(")", "") if len(valueList) > 1 else '-'
            })
            ind = ind + 1
        playerDict["workout_metrics"] = workoutMetrics
        
    # scrape college metrics from player profiler
    collegeMetrics = soup.find('ul', {"class", "md:flex items-center -mx-4 lg:mx-0"})
    if collegeMetrics is not None:
        ind = 0
        collegeDisplay = []
        for value in collegeMetrics.find_all('div'):
            if len(value) is 1:
                collegeDisplay.append(value.text.strip())
        collegeMetList = []
        for value in collegeMetrics.find_all('div'):
            if len(value) is not 1:
                valueList = value.text.strip().split("\n")
                collegeMetList.append({
                    "display": collegeDisplay[ind],
                    "value": valueList[0],
                    "percentile": valueList[1].replace("(", "").replace(")", "") if len(valueList) > 1 else '-'
                })        
                ind = ind + 1
        playerDict["college_metrics"] = collegeMetList
    return playerDict

# fetch all name ids to load metadata for
def fetchPlayersInDynastyDaddy(conn):
    # Creating a cursor object using the cursor() method
    cursor = conn.cursor()
    nameIdDict = {}
    playerIdsStatement = '''select name_id, full_name
                from mat_vw_players mvp
                where mvp."position" != 'PI';'''
    cursor.execute(playerIdsStatement)
    result_set = cursor.fetchall()
    for row in result_set:
        nameIdDict[row[0]] = row[1]
    return nameIdDict

# persist metadata dict
def persistJsonToDB(conn, metadataDict, query):
    print('Persisting player metadata...')
    
    # Creating a cursor object using the cursor() method
    cursor = conn.cursor()
    for nameId, profile in metadataDict.items():
        profileJson = json.dumps(profile, indent = 4) 
        cursor.execute(query, (nameId, profileJson, nameId, profileJson))
    
    conn.commit()
    print('Finished persisting player metadata')

# get connection to database
def getConnectionToDB():
    # Connect to local test database
    conn = psycopg2.connect(
        database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
    )

    # Setting auto commit false
    conn.autocommit = True
    return conn

# helper function that handles all logic for player metadata
def processProfileData(conn, nameIdDict):
    
    # result dict
    playerMetadataDict = {}

    print('Set up complete! Processing ' + str(len(nameIdDict)) + ' players...')

    ind = 0
    for nameId, fullName in nameIdDict.items():
        playerName = fullName
        if nameId in PLAYER_PROFILER_EXCEPTIONS:
            playerName = PLAYER_PROFILER_EXCEPTIONS[nameId]
        playerMetadataDict[nameId] = fetchPlayerProfilerData(playerName)
        
        ind = ind + 1
        print('(' + str(ind) + '/' + str(len(nameIdDict)) + ') ' + fullName + ' profile processed')
    
    query = '''INSERT INTO player_metadata (name_id, profile_json) VALUES (%s, %s)
        ON CONFLICT (name_id) DO UPDATE
        SET
        name_id = %s,
        profile_json = %s; '''

    persistJsonToDB(conn, playerMetadataDict, query)
    
def processContractData(conn, nameIdDict):
    
    # result dict
    playerMetadataDict = {}
    
    # get contract dictionary
    qbContractsDict = fetchPlayerContractData(QB_CONTRACT_LINK, 'QB')
    rbContractsDict = fetchPlayerContractData(RB_CONTRACT_LINK, 'RB')
    wrContractsDict = fetchPlayerContractData(WR_CONTRACT_LINK, 'WR')
    teContractsDict = fetchPlayerContractData(TE_CONTRACT_LINK, 'TE')
    contractDict = {**qbContractsDict, **rbContractsDict, **wrContractsDict, **teContractsDict}
    
    ind = 0
    for nameId, fullName in nameIdDict.items():
        playerMetadataDict[nameId] = contractDict[nameId] if nameId in contractDict else None
        ind = ind + 1
        print('(' + str(ind) + '/' + str(len(nameIdDict)) + ') ' + fullName + ' contract processed')
    
    query = '''INSERT INTO player_metadata (name_id, contract_json) VALUES (%s, %s)
            ON CONFLICT (name_id) DO UPDATE
            SET
            name_id = %s,
            contract_json = %s; '''
    persistJsonToDB(conn, playerMetadataDict, query)
    
def processRasData(conn, nameIdDict):
    
    # result dict
    playerMetadataDict = {}
    
    # get ras scores dictionary
    rasScoresDict = fetchRASScoreDict()

    ind = 0
    for nameId, fullName in nameIdDict.items():
        playerMetadataDict[nameId] = rasScoresDict[nameId] if nameId in rasScoresDict else None
        ind = ind + 1
        print('(' + str(ind) + '/' + str(len(nameIdDict)) + ') ' + fullName + ' ras processed')
    
    query = '''INSERT INTO player_metadata (name_id, ras_json) VALUES (%s, %s)
            ON CONFLICT (name_id) DO UPDATE
            SET
            name_id = %s,
            ras_json = %s; '''
    persistJsonToDB(conn, playerMetadataDict, query)

# Route what metadata to update
def routeMetadataToUpdate(conn, metadataCol, nameIdDict):
    if metadataCol is 'contract':
        processContractData(conn, nameIdDict)
    elif metadataCol is 'ras':
        processRasData(conn, nameIdDict)
    elif metadataCol is 'profile':
        processProfileData(conn, nameIdDict)
    else:
        processContractData(conn, nameIdDict)
        processRasData(conn, nameIdDict)
        processProfileData(conn, nameIdDict)

# Persist All Metadata records for players
def UpdatePlayerMetadata(metadataCol):
    conn = getConnectionToDB()

    nameIdDict = fetchPlayersInDynastyDaddy(conn)
    
    routeMetadataToUpdate(conn, metadataCol, nameIdDict)  

# persist metadata record for custon nameIdDict
def UpdatePlayerMetadataByDict(metadataCol, nameIdDict):
    conn = getConnectionToDB()
    
    processProfileData(conn, nameIdDict)
    
    routeMetadataToUpdate(conn, metadataCol, nameIdDict)

# UpdatePlayerMetadata('contract')
# # Individual player example
# UpdatePlayerMetadataByDict('profile', {'djmoorewr': 'dj moore'})
