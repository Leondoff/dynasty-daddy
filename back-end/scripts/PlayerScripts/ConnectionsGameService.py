
from datetime import date
import random
import json
import os
from Constants import TeamACCException
import psycopg2

teamCategory = ['sameTeam', 'sameTeamColor', 'sameTeamDivision', 'sameTeamCategory']

playerCategory = ['position', 'position', 'age', 'experience']

statCategory = ['rushYd100',
                  'recYd100',
                  'passYd300',
                  'rushTd',
                  'recTd',
                  'passingTds3',
                  'int',
                  'rec10',
                  'specialTd',
                  'defTkl10',
                  'defFF',
                  'defSack',
                  'defInt',
                  'defTd',
                  'rush20']

statYears = [2020, 2021, 2022, 2023]

TeamColorMap = {
    'ARI': ['red', 'yellow', 'black'],
    'CAR': ['silver', 'blue', 'black'],
    'BUF': ['blue', 'red'],
    'CLE': ['brown', 'orange'],
    'DAL': ['navy', 'silver', 'blue'],
    'GB': ['green', 'gold', 'yellow'],
    'HOU': ['blue', 'red'],
    'KC': ['red', 'gold', 'yellow'],
    'LAC': ['blue', 'gold', 'yellow'],
    'MIN': ['purple', 'gold'],
    'NEP': ['blue', 'red', 'silver'],
    'NYJ': ['green', 'black'],
    'LV': ['black', 'silver'],
    'SF': ['red', 'gold'],
    'SEA': ['blue', 'navy', 'green', 'gray'],
    'WAS': ['red', 'gold', 'yellow'],
    'ATL': ['red', 'black', 'silver'],
    'BAL': ['purple', 'black', 'gold', 'red'],
    'CHI': ['navy', 'blue', 'orange'],
    'CIN': ['orange', 'black'],
    'DEN': ['orange', 'navy', 'blue'],
    'DET': ['blue', 'silver', 'black'],
    'IND': ['blue', 'gray'],
    'JAX': ['gold', 'black', 'teal'],
    'LA': ['blue', 'gold', 'yellow'],
    'MIA': ['blue', 'orange', 'blue'],
    'NO': ['black', 'gold'],
    'NYG': ['blue', 'red', 'gray'],
    'PHI': ['silver', 'green', 'black'],
    'PIT': ['gold', 'black', 'yellow', 'silver'],
    'TB': ['red', 'orange', 'black', 'gray'],
    'TEN': ['navy', 'blue', 'red', 'silver', 'gray'],
    'NE': ['blue', 'red', 'silver']
}

TeamDivisionMap = {
    'NFC_South': ['NO', 'CAR', 'ATL', 'TB'],
    'NFC_North': ['CHI', 'GB', 'DET', 'MIN'],
    'NFC_East': ['NYG', 'DA:', 'WAS', 'PHI'],
    'NFC_West': ['SEA', 'SF', 'ARI', 'LA'],
    'AFC_East': ['NE', 'MIA', 'NYJ', 'BUF'],
    'AFC_South': ['HOU', 'JAX', 'TEN', 'IND'],
    'AFC_West': ['DEN', 'KC', 'LAC', 'LV'],
    'AFC_North': ['BAL', 'PIT', 'CLE', 'CIN']
}

TeamFunCategoryMap = {
    'Birds': ['ARI', 'BAL', 'SEA', 'PHI', 'ATL'],
    'Cats': ['JAX', 'DET', 'CAR', 'CIN'],
    'No_Super_Bowl_Appearance': ['CLE', 'DET', 'JAX', 'HOU'],
}

SupportedTeams = ['CAR', 'NO', 'TB', 'ATL', 'LA', 'SEA', 'SF', 'ARI', 'DAL', 'NYG', 'PHI', 'WAS', 'GB', 'MIN', 'DET',
                  'CHI', 'KC', 'LV', 'LAC', 'DEN', 'HOU', 'TEN', 'IND', 'JAX', 'CLE', 'PIT', 'BAL', 'CIN', 'BUF', 'MIA', 'NYJ', 'NE']

SupportedColors = ['red', 'blue', 'navy', 'silver', 'black', 'gold', 'yellow', 'green', 'orange', 'gray', 'purple', 'teal']

SupportedDivision = ['NFC_South', 'NFC_North', 'NFC_West', 'NFC_East', 'AFC_North', 'AFC_South', 'AFC_West', 'AFC_East']

SupportedTeamCategories = ['Birds', 'Cats', 'No_Super_Bowl_Appearance']

SupportedPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'LB', 'DL', 'DB']

SupportedExperiences = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

SupportedAges = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37]

def SetNewConnectionsGame():

    # Connect to local test database
    # conn = psycopg2.connect(
    #     database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
    # )

    conn = psycopg2.connect(
        database=os.environ['DO_DATABASE'], user=os.environ['DO_DB_USER'], password=os.environ[
            'DO_DB_PASSWORD'], host=os.environ['DO_DB_HOST'], port=os.environ['DO_DB_PORT']
    )

    # Setting auto commit false
    conn.autocommit = True

    # Creating a cursor object using the cursor() method
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM mat_vw_players;')
    rows = cursor.fetchall()
    # defensive players from database
    cursor.execute('SELECT * FROM mat_vw_def_players;')
    defRows = cursor.fetchall()
    
    # important values
    categories = []
    connectionPlayers = []
    
    cursor.execute(
            'SELECT config_value FROM config WHERE config_key = \'daily_connection\';')
    yesterdaysGridStr = cursor.fetchall()
    yesterdaysConnection = json.loads(yesterdaysGridStr[0][0])
    yesterdaysCategories = yesterdaysConnection['categories']

    # generate first category for player grouping
    players = [person for person in (rows + defRows) if person[11] != 'PI' and person[11] != 'DF' and person[10] != None and person[10] != 'FA']
    while True:
        catOne = random.choice(playerCategory if yesterdaysCategories[0]['type'] == 'position' else [player for player in playerCategory if player != yesterdaysCategories[0]['type']])
        valueInd = getPlayerIndForField(catOne)
        filterValue = getValueForPlayerCategory(catOne, yesterdaysCategories)
        catOnePlayers = [person for person in players if person[valueInd] == filterValue]
        if len(catOnePlayers) >= 4:
            playerNames = [{'category': 1, 'name': player[7]} for player in catOnePlayers]
            connectionPlayers = connectionPlayers + random.sample(playerNames, 4)
            categories.append({'type': catOne, 'value': filterValue})
            players = [person for person in players if person[valueInd] != filterValue]
            break
       
    # generate second category for team grouping 
    while True:
        catTwo = random.choice(teamCategory)
        filterValue = getValueForTeamCategory(catTwo, yesterdaysCategories)
        catTwoPlayers = [person for person in players if isInTeamCategory(person, catTwo, filterValue)]
        if len(catTwoPlayers) >= 4:
            playerNames = [{'category': 2, 'name': player[7]} for player in catTwoPlayers]
            connectionPlayers = connectionPlayers + random.sample(playerNames, 4)
            categories.append({'type': catTwo, 'value': filterValue})
            players = [person for person in players if isInTeamCategory(person, catTwo, filterValue) == False]
            break
    
    # Get stats for third group
    statYear = random.choice(statYears)
    cursor.execute('SELECT * FROM player_gamelogs WHERE season = %s;', (statYear,))
    seasonStats = cursor.fetchall()
    
    while True:
        statCat = random.choice([player for player in statCategory if player != yesterdaysCategories[2]['value'] and player != yesterdaysCategories[3]['value']])
        catStatPlayers = [person for person in players if hasMetStatCategory(person, statCat, seasonStats)]
        if len(catStatPlayers) >= 4:
            playerNames = [{'category': 3, 'name': player[7]} for player in catStatPlayers]
            connectionPlayers = connectionPlayers + random.sample(playerNames, 4)
            categories.append({'type': 'stat', 'value': statCat})
            players = [person for person in players if hasMetStatCategory(person, statCat, seasonStats) == False]
            break
        
    # Get stats for fourth group
    statYear = random.choice(statYears)
    cursor.execute('SELECT * FROM player_gamelogs WHERE season = %s;', (statYear,))
    seasonStats = cursor.fetchall()
    
    while True:
        statCat = random.choice([player for player in statCategory if player != yesterdaysCategories[2]['value'] and player != yesterdaysCategories[3]['value']])
        catStatPlayers = [person for person in players if hasMetStatCategory(person, statCat, seasonStats)]
        if len(catStatPlayers) >= 4:
            playerNames = [{'category': 4, 'name': player[7]} for player in catStatPlayers]
            connectionPlayers = connectionPlayers + random.sample(playerNames, 4)
            categories.append({'type': 'stat', 'value': statCat})
            break
        
    # print(categories, connectionPlayers)
    
    current_date = date.today()
    target_date = date(2023, 11, 24)

    connectionNumber = (current_date - target_date).days + 1

    output_dict = {
        'categories': categories,
        'players': connectionPlayers,
        'id': connectionNumber,
        'date': str(current_date)
    }

    jsonConnection = json.dumps(output_dict)

    setTodaysConnectionStatement = '''UPDATE config
        SET
        config_value = %s WHERE config_key = \'daily_connection\';'''
    cursor.execute(setTodaysConnectionStatement, (str(jsonConnection),))

    # add historical nflconnections
    archiveConnectionsStatement = '''INSERT INTO historical_connections (daily_connections)
                    VALUES (%s)'''
    cursor.execute(archiveConnectionsStatement, (str(jsonConnection),))
    
    
# get random value for player category
def getValueForPlayerCategory(cat, yesterdaysCategories):
    if cat is 'position':
        return random.choice([pos for pos in SupportedPositions if pos != yesterdaysCategories[0]['value']])
    elif cat is 'experience':
        return random.choice(SupportedExperiences)
    else:
        return random.choice(SupportedAges)
    
# get random team category
def getValueForTeamCategory(cat, yesterdaysCategories):
    if cat is 'sameTeam':
        return random.choice([tm for tm in SupportedTeams if tm != yesterdaysCategories[1]['value']])
    elif cat is 'sameTeamColor':
        return random.choice([cl for cl in SupportedColors if cl != yesterdaysCategories[1]['value']])
    elif cat is 'sameTeamCategory':
        return random.choice([cat for cat in SupportedTeamCategories if cat != yesterdaysCategories[1]['value']])
    else:
        return random.choice([div for div in SupportedDivision if div != yesterdaysCategories[1]['value']])

# get player array index for field
def getPlayerIndForField(field):
    if field is 'position':
        return 11
    elif field is 'age':
        return 12
    elif field is 'experience':
        return 13
    else:
        return 10

# is the player in the team category
def isInTeamCategory(player, cat, value):
    team = TeamACCException[player[10]] if player[10] in TeamACCException else player[10]
    if cat == 'sameTeam':
        return team == value
    elif cat == 'sameTeamColor':
        teamColors = TeamColorMap[team]
        return value in teamColors
    elif cat == 'sameTeamCategory':
        teamCategory = TeamFunCategoryMap[value]
        return team in teamCategory
    else:
        divisionTeams = TeamDivisionMap[value]
        return team in divisionTeams
    
# did the player meet the stat category
def hasMetStatCategory(player, statCat, seasonStats):
    for weekStat in seasonStats:
        if player[1] in weekStat[2]:
            stats = weekStat[2][player[1]]

            if statCat == 'rushYd100' and stats.get('rush_yd', 0) >= 100 or \
                statCat == 'recYd100' and stats.get('rec_yd', 0) >= 100 or \
                statCat == 'passYd300' and stats.get('pass_yd', 0) >= 300 or \
                statCat == 'rushTd' and stats.get('rush_td', 0) >= 1 or \
                statCat == 'recTd' and stats.get('rec_td', 0) >= 1 or \
                statCat == 'passTd300' and stats.get('pass_td', 0) >= 3 or \
                statCat == 'int' and stats.get('int', 0) >= 1 or \
                statCat == 'rec10' and stats.get('rec', 0) >= 10 or \
                statCat == 'rush20' and stats.get('rush_att', 0) >= 10 or \
                statCat == 'defTkl10' and stats.get('idp_tkl', 0) >= 10 or \
                statCat == 'defFF' and stats.get('idp_ff', 0) >= 1 or \
                statCat == 'defSack' and stats.get('idp_sack', 0) >= 1 or \
                statCat == 'defInt' and stats.get('idp_int', 0) >= 1 or \
                statCat == 'defTd' and stats.get('idp_def_td', 0) >= 1:
                    return True

    return False

SetNewConnectionsGame()