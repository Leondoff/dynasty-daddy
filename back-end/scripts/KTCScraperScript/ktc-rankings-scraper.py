import psycopg2
import os
from sleeper_wrapper import Players
from MFLPlayerService import fetchMFLPlayerDict
from FantasyProsADPScraper import scrapeADP
from BeautifulSoupService import setUpSoup
from PlayerService import cleanPlayerIdString
from FantasyCalcService import fetchSuperFlexPlayerDict, fetchStandardPlayerDict
from DynastyProcessService import fetchDynastyProcessPlayerValues
from DynastySuperflexService import fetchDynastySuperflexPlayerValues

# API calls to sleeper
players = Players()
sleeperData = players.get_all_players()

# creates a dict of sleeper ids mapped to name ids
def getSleeperData():
    temp = {}
    for playerId, value in sleeperData.items():
        if value['active']:
            playerNameId = cleanPlayerIdString(str(value['first_name'] + value['last_name'] + str(value['position'])))
            temp[playerNameId] = playerId     
    return temp


# Player class that is inserted into table
class Player:
    def __init__(self, id, name, first_name, last_name, team, position, sfPositionRank, positionRank, age, experience,
                 sf_value, value, sleeperId=None, college=None, injury_status=None, weight=None, height=None,
                 jersey_number=-1, active=None, mflId=None, fc_sf_value=None, fc_value=None, fc_position_rank=None,
                 fc_sf_position_rank=None, dp_sf_value=None, dp_value=None, dp_sf_position_rank=None, dp_position_rank=None,
                 ds_sf_value=None, ds_value=None, ds_sf_position_rank=None, ds_position_rank=None):
        self.id = id
        self.name = name
        self.first_name = first_name
        self.last_name = last_name
        self.team = team
        self.position = position
        self.sfPositionRank = sfPositionRank
        self.positionRank = positionRank
        self.age = age
        self.experience = experience
        self.sf_value = sf_value
        self.value = value
        self.sleeperId = sleeperId
        self.college = college
        self.injury_status = injury_status
        self.weight = weight
        self.height = height
        self.jersey_number = jersey_number
        self.active = active
        self.mflId = mflId
        self.fc_sf_value = fc_sf_value
        self.fc_value = fc_value
        self.fc_sf_position_rank = fc_sf_position_rank
        self.fc_position_rank = fc_position_rank
        self.dp_sf_value = dp_sf_value
        self.dp_value = dp_value
        self.dp_sf_position_rank = dp_sf_position_rank
        self.dp_position_rank = dp_position_rank
        self.ds_sf_value = ds_sf_value
        self.ds_value = ds_value
        self.ds_sf_position_rank = ds_sf_position_rank
        self.ds_position_rank = ds_position_rank

    def toString(self):
        print(self.id, self.name, self.first_name, self.last_name, self.team, self.position, self.sfPositionRank,
              self.positionRank, self.age, self.experience, self.sf_value, self.value, self.sleeperId, self.college,
              self.injury_status, self.weight, self.height, self.jersey_number, self.active, self.mflId, self.fc_sf_value,
              self.fc_value, self.fc_sf_position_rank, self.fc_position_rank, self.dp_sf_value, self.dp_value,
              self.dp_sf_position_rank, self.dp_position_rank, self.ds_sf_value, self.ds_value, self.ds_sf_position_rank, self.ds_position_rank)


#################################
#       Scraping KTC data       #
#  written by: Jeremy Timperio  #
#################################

# URL to scrape data uses requests import
sf_URL = 'https://keeptradecut.com/dynasty-rankings?format=2'

# Set up scraper
sf_soup = setUpSoup(sf_URL)

# fetch each ranking div
sf_rankings = sf_soup.find_all("div", {"class": "onePlayer"})

# URL to scrape data uses requests import
URL = 'https://keeptradecut.com/dynasty-rankings?format=1'

# Set up scraper
soup = setUpSoup(URL)

# fetch each ranking div
rankings = soup.find_all("div", {"class": "onePlayer"})

# players class array of scraped data
players = []

# create dict of sleeper ids and name ids
sleeperIdMapper = getSleeperData()

# create dict of mfl ids and name ids
mflPlayerIdMap = fetchMFLPlayerDict()

# fetch fantasy calc dictionary for standard & superflex
fantasyCalcSFDict = fetchSuperFlexPlayerDict()
fantasyCalcSTDDict = fetchStandardPlayerDict()

# fetch dynasty process dictionary with both standard & superflex values
dynastyProcessDict = fetchDynastyProcessPlayerValues()

# fetch dynasty superflex dict with std & sf values
dynastySuperflexDict = fetchDynastySuperflexPlayerValues()

# loop through ranking divs and create player classes
for player in sf_rankings:
    playerName = (player.find('div', 'player-name')).find('a')
    splitName = playerName.text.strip().split(" ", 1)
    playerFirstName = splitName[0]
    playerLastName = splitName[1]
    playerTeam = player.find('span', 'player-team')
    playerPosition = player.find('p', 'position')
    playerAge = player.find('p', 'position hidden-xs')
    sfTradeValue = (player.find('div', 'value')).find('p')
    playerId = cleanPlayerIdString(str(playerName.text.strip() + str(playerPosition.text.strip())[:2]))
    for oneQbPlayer in rankings:
        tempName = (oneQbPlayer.find('div', 'player-name')).find('a')
        tempPos = oneQbPlayer.find('p', 'position')
        tempId = cleanPlayerIdString(str(tempName.text.strip() + str(tempPos.text.strip())[:2]))
        if playerId == tempId:
            tradeValue = (oneQbPlayer.find('div', 'value')).find('p')
            oneQBPostion = oneQbPlayer.find('p', 'position')
    sleeperId = None
    if str(playerPosition.text.strip().lower()) != 'pick':
        for nameId, value in sleeperIdMapper.items():
            if playerId == nameId:
                sleeperId = value
                break
            # handles double positions
            if playerId[:-2] == nameId[:-2] and (
                    playerPosition.text.strip()[:2] == 'WR' or playerPosition.text.strip()[:2] == 'RB'):
                if nameId[-2:] == 'wr' and playerPosition.text.strip()[:2] == 'RB':
                    print('Double Position: ' + nameId)
                    sleeperId = value
                    break
                if nameId[-2:] == 'rb' and playerPosition.text.strip()[:2] == 'WR':
                    print('Double Position: ' + nameId)
                    sleeperId = value
                    break
            if playerId[:-2] == nameId[:-2] and (
                    playerPosition.text.strip()[:2] == 'TE' or playerPosition.text.strip()[:2] == 'WR'):
                if nameId[-2:] == 'te' and playerPosition.text.strip()[:2] == 'WR':
                    sleeperId = value
                    print('Double Position: ' + nameId)
                    break
    mflId = mflPlayerIdMap.get(playerId)
    fcSfValue = fantasyCalcSFDict.get(playerId)['value'] if fantasyCalcSFDict.get(playerId) != None else 0
    fcStdValue = fantasyCalcSTDDict.get(playerId)['value'] if fantasyCalcSTDDict.get(playerId) != None else 0
    fcSfRank = fantasyCalcSFDict.get(playerId)['rank'] if fantasyCalcSFDict.get(playerId) != None else None
    fcRank = fantasyCalcSTDDict.get(playerId)['rank'] if fantasyCalcSTDDict.get(playerId) != None else None
    dpSfValue = dynastyProcessDict.get(playerId)['sf_value'] if dynastyProcessDict.get(playerId) != None else 0
    dpStdValue = dynastyProcessDict.get(playerId)['std_value'] if dynastyProcessDict.get(playerId) != None else 0
    dpSfRank = dynastyProcessDict.get(playerId)['sf_rank'] if dynastyProcessDict.get(playerId) != None else None
    dpRank = dynastyProcessDict.get(playerId)['std_rank'] if dynastyProcessDict.get(playerId) != None else None
    dsSfValue = dynastySuperflexDict.get(playerId)['sf_value'] if dynastySuperflexDict.get(playerId) != None else 0
    dsStdValue = dynastySuperflexDict.get(playerId)['std_value'] if dynastySuperflexDict.get(playerId) != None else 0
    dsSfRank = dynastySuperflexDict.get(playerId)['sf_rank'] if dynastySuperflexDict.get(playerId) != None else None
    dsRank = dynastySuperflexDict.get(playerId)['std_rank'] if dynastySuperflexDict.get(playerId) != None else None
    playerExp, jerseyNum = 0, 0
    college, injuryStatus, active, weight, height = None, None, None, None, None
    if sleeperId is not None:
        try:
            sleeperPlayer = sleeperData.get(sleeperId)
            playerExp = sleeperPlayer['years_exp']
            college = sleeperPlayer['college']
            injuryStatus = sleeperPlayer['injury_status']
            weight = sleeperPlayer['weight']
            height = sleeperPlayer['height']
            jerseyNum = sleeperPlayer['number']
            active = sleeperPlayer['active']
        except:
            print('Error getting playerExp for: ' + sleeperId)
    players.append(
        Player(playerId, playerName.text.strip(), playerFirstName, playerLastName, playerTeam.text.strip(),
               str(playerPosition.text.strip())[:2],
               None if str(playerPosition.text.strip())[2:] == 'CK' else str(playerPosition.text.strip())[2:],
               None if str(oneQBPostion.text.strip())[2:] == 'CK' else str(oneQBPostion.text.strip())[2:],
               None if playerAge is None else str(playerAge.text.strip())[:2], playerExp,
               sfTradeValue.text.strip(), tradeValue.text.strip(), sleeperId, college, injuryStatus, weight, height,
               jerseyNum, active, mflId, fcSfValue, fcStdValue, fcSfRank, fcRank, dpSfValue, dpStdValue, dpSfRank, dpRank,
               dsSfValue, dsStdValue, dsSfRank, dsRank))

# for player in players:
#      player.toString()

# invoke ADP scraper for all position groups
print('Start scrape ADP rankings')
playerADPs = scrapeADP('qb') + scrapeADP('rb') + scrapeADP('wr') + scrapeADP('te')
print('Successfully scraped adp rankings')

#################################
#    Insert data into tables    #
#  written by: Jeremy Timperio  #
#################################

try:
    # Establishing the connection
    conn = psycopg2.connect(
        database=os.environ['DO_DATABASE'], user=os.environ['DO_DB_USER'], password=os.environ['DO_DB_PASSWORD'], host=os.environ['DO_DB_HOST'], port=os.environ['DO_DB_PORT']
    )

    # Connect to local test database
    # conn = psycopg2.connect(
    #     database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
    # )

    # Setting auto commit false
    conn.autocommit = True

    # Creating a cursor object using the cursor() method
    cursor = conn.cursor()
    try:
        # Preparing SQL queries to INSERT a record into the database.
        for player in players:
            if player.sleeperId is None and player.position != 'PI': print(player.name + ': Error finding Sleeper Id')
            if player.sleeperId is not None or player.position == 'PI':
                # player info table insert
                playerInfoStatement = '''INSERT INTO player_info (name_id, full_name, first_name, last_name, team, position, age, experience, college, injury_status, weight, height, jersey_number, active) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (name_id) DO UPDATE
                    SET
                    name_id = %s,
                    full_name = %s,
                    first_name = %s,
                    last_name = %s,
                    team = %s,
                    position = %s,
                    age = %s,
                    experience = %s,
                    college = %s,
                    injury_status = %s,
                    weight = %s,
                    height = %s,
                    jersey_number = %s,
                    active = %s,
                    updated_at = now(); '''
                cursor.execute(playerInfoStatement, (
                    player.id, player.name, player.first_name, player.last_name, player.team, player.position,
                    player.age, player.experience, player.college, player.injury_status, player.weight, player.height,
                    player.jersey_number, player.active, player.id, player.name, player.first_name, player.last_name,
                    player.team, player.position, player.age, player.experience, player.college, player.injury_status,
                    player.weight, player.height, player.jersey_number, player.active))

                # player id linking table insert
                playerIdsStatement = '''INSERT INTO player_ids (name_id, sleeper_id) VALUES (%s, %s)
                    ON CONFLICT (name_id) DO UPDATE
                    SET
                    name_id = %s,
                    sleeper_id = %s,
                    updated_at = now(); '''
                cursor.execute(playerIdsStatement, (player.id, player.sleeperId, player.id, player.sleeperId))
            if player.mflId is not None:
                # player id linking table insert
                playerIdsStatement = '''INSERT INTO player_ids (name_id, mfl_id) VALUES (%s, %s)
                    ON CONFLICT (name_id) DO UPDATE
                    SET
                    name_id = %s,
                    mfl_id = %s,
                    updated_at = now(); '''
                cursor.execute(playerIdsStatement, (player.id, player.mflId, player.id, player.mflId))

            # player values insert daily values
            cursor.execute('''INSERT into player_values(name_id, sf_position_rank, position_rank, sf_trade_value, trade_value, fc_sf_trade_value, fc_trade_value, fc_sf_position_rank, fc_position_rank, dp_sf_trade_value, dp_trade_value, dp_sf_position_rank, dp_position_rank, ds_sf_trade_value, ds_sf_position_rank, ds_trade_value, ds_position_rank)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)''', (
                player.id, player.sfPositionRank, player.positionRank, player.sf_value, player.value, player.fc_sf_value, player.fc_value, player.fc_sf_position_rank, player.fc_position_rank, player.dp_sf_value, player.dp_value, player.dp_sf_position_rank, player.dp_position_rank, player.ds_sf_value, player.ds_sf_position_rank, player.ds_value, player.ds_position_rank))

        # player adp rankings updated
        for adp in playerADPs:
            playerADPStatement = '''INSERT INTO player_adp (name_id, fantasypro_adp, bb10_adp, rtsports_adp, underdog_adp, drafters_adp, avg_adp) VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (name_id) DO UPDATE
                SET
                name_id = %s,
                fantasypro_adp = %s,
                bb10_adp = %s,
                rtsports_adp = %s,
                underdog_adp = %s,
                drafters_adp = %s,
                avg_adp = %s; '''
            cursor.execute(playerADPStatement, (adp.nameId, adp.fantasyProADP, adp.bb10ADP, adp.rtsportsADP, adp.underdogADP, adp.draftersADP, adp.avgADP, adp.nameId, adp.fantasyProADP, adp.bb10ADP, adp.rtsportsADP, adp.underdogADP, adp.draftersADP, adp.avgADP))

        # update mat view for players
        cursor.execute('''REFRESH MATERIALIZED VIEW CONCURRENTLY mat_vw_players;''')
        
        # update mat view for dynasty superflex values
        cursor.execute('''REFRESH MATERIALIZED VIEW CONCURRENTLY mat_vw_ktc_player_values;''')
        
        # update mat view for fantasy calc values
        cursor.execute('''REFRESH MATERIALIZED VIEW CONCURRENTLY mat_vw_fc_player_values;''')

        # update mat view for dynasty process values
        cursor.execute('''REFRESH MATERIALIZED VIEW CONCURRENTLY mat_vw_dp_player_values;''')

        # update mat view for dynasty superflex values
        cursor.execute('''REFRESH MATERIALIZED VIEW CONCURRENTLY mat_vw_ds_player_values;''')

        # Commit your changes in the database
        conn.commit()
        print(str(len(players)) + " Records inserted........")
    except (Exception, psycopg2.DatabaseError) as error:
        print("Error inserting data", error)
    # Closing the connection
    conn.close()
except Exception as error:
    print("ERROR IN CONNECTION", error)
