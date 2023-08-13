import psycopg2
from sleeper_wrapper import Players
from PlayerService import cleanPlayerIdString
from MFLPlayerService import fetchMFLPlayerDictNonOffense
from Constants import DDPlayerPosMap


def getSleeperData():

    # API calls to sleeper
    players = Players()
    sleeperData = players.get_all_players()

    temp = {}
    for playerId, value in sleeperData.items():
        if value['position'] not in ['QB', 'RB', 'WR', 'TE', 'FB', 'OT', 'RG', 'G', 'OL', 'T', 'LS', 'OT', 'C', 'OG', 'P'] and value['fantasy_positions'] is not None:
            pos = 'DL' if 'DL' in value['fantasy_positions'] else value['position']
            if pos in DDPlayerPosMap:
                pos = DDPlayerPosMap[pos]
                value['position'] = pos
            playerNameId = cleanPlayerIdString(str(
                value['first_name'] + value['last_name'] + pos))
            temp[playerNameId] = {"sleeper_id": playerId, "player": value, pos: pos}
    return temp


def InsertNonOffensePlayers(cursor):

    sleeperDict = getSleeperData()
    mflDict = fetchMFLPlayerDictNonOffense()

    for nameId, sleeperPlayer in sleeperDict.items():
        player = sleeperPlayer["player"]
        name = player['full_name'] if 'full_name' in player else player['first_name'] + ' ' + player['last_name']
        if player['active']:
            if player['position'] != 'DF':
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
                    nameId, name, player['first_name'], player['last_name'], player['team'], player['position'],
                    player['age'], player['years_exp'], player['college'], player['injury_status'], player['weight'], player['height'],
                    player['number'], player['active'], nameId, name, player['first_name'], player['last_name'], player['team'], player['position'],
                    player['age'], player['years_exp'], player['college'], player['injury_status'], player['weight'], player['height'],
                    player['number'], player['active']))
            else:
                # player info table insert
                playerInfoStatement = '''INSERT INTO player_info (name_id, full_name, first_name, last_name, position) VALUES (%s, %s, %s, %s, %s)
                                ON CONFLICT (name_id) DO UPDATE
                                SET
                                name_id = %s,
                                full_name = %s,
                                first_name = %s,
                                last_name = %s,
                                position = %s,
                                updated_at = now(); '''
                cursor.execute(playerInfoStatement, (
                    nameId, name, player['first_name'], player['last_name'], player['position'],
                    nameId, name, player['first_name'], player['last_name'], player['position']))
            if sleeperDict[nameId] is not None:    
                # player id linking table insert
                playerIdsStatement = '''INSERT INTO player_ids (name_id, sleeper_id) VALUES (%s, %s)
                                ON CONFLICT (name_id) DO UPDATE
                                SET
                                name_id = %s,
                                sleeper_id = COALESCE(player_ids.sleeper_id, %s),
                                updated_at = now(); '''
                cursor.execute(playerIdsStatement, (nameId, sleeperPlayer['sleeper_id'], nameId, sleeperPlayer['sleeper_id']))
            if nameId in mflDict and mflDict[nameId] is not None:
                # player id linking table insert
                playerIdsStatement = '''INSERT INTO player_ids (name_id, mfl_id) VALUES (%s, %s)
                            ON CONFLICT (name_id) DO UPDATE
                            SET
                            name_id = %s,
                            mfl_id = COALESCE(player_ids.mfl_id, %s),
                            updated_at = now(); '''
                cursor.execute(playerIdsStatement, (nameId, mflDict[nameId], nameId, mflDict[nameId]))
    
    # update mat view for non-offense players
    cursor.execute('REFRESH MATERIALIZED VIEW CONCURRENTLY mat_vw_def_players;')


# # Connect to local test database
# conn = psycopg2.connect(
#     database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
# )

# # Setting auto commit false
# conn.autocommit = True

# # Creating a cursor object using the cursor() method
# cursor = conn.cursor()

# InsertNonOffensePlayers(cursor)