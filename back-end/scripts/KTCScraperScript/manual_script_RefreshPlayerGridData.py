import csv
import json
import psycopg2
import requests
import PlayerService
import re

TeamACCException = {
    'SFO': 'SF',
    'TBB': 'TB',
    'GBP': 'GB',
    'NOS': 'NO',
    'LAR': 'LA',
    'SD': 'LAC',
    'KCC': 'KC',
    'NEP': 'NE',
    'OAK': 'LV',
    'HST': 'HOU',
    'BLT': 'BAL',
    'JAX': 'JAC',
    'ARZ': 'ARI',
    'CLV': 'CLE',
    'STL': 'LA',
    'SL': 'LA'
}

posExpMap = {
    'SS': 'DB',
    'CB': 'DB',
    'NT': 'DT',
    'OLB': 'LB',
    'MLB': 'LB',
    'S': 'DB',
    'FS': 'DB',
    'FB': 'RB',
    'C': 'OG',
    'T': 'OG',
    'DT': 'DE',
    'ILB': 'LB',
    'G': 'OG',
    'DE': 'DT'
}


def refreshPlayerGridTable():
    playerMap = {}
    with open('C:\\Users\\Jeremy\\Desktop\\test.csv', 'r') as file:
        csvreader = csv.reader(file)

        for row in csvreader:
            if row[6] not in ['gsis_id']:
                if row[6] not in playerMap:
                    playerMap[row[6]] = {}
                playerMap[row[6]]['name'] = row[2]
                if 'jerseyNumbers' not in playerMap[row[6]]:
                    playerMap[row[6]]['jerseyNumbers'] = []
                playerMap[row[6]]['jerseyNumbers'].append(row[8])
                playerMap[row[6]]['jerseyNumbers'] = list(
                    set(playerMap[row[6]]['jerseyNumbers']))
                if 'teams' not in playerMap[row[6]]:
                    playerMap[row[6]]['teams'] = []
                playerMap[row[6]]['teams'].append(
                    row[3] if row[3] not in TeamACCException else TeamACCException[row[3]]
                )
                playerMap[row[6]]['teams'] = list(
                    set(playerMap[row[6]]['teams']))
                if 'headshot_url' not in playerMap[row[6]] or playerMap[row[6]]['headshot_url'] is None:
                    playerMap[row[6]]['headshot_url'] = row[7] if row[7] != 'NA' else 'https://static.www.nfl.com/image/private/f_auto,q_auto/league/y9boy7grhaidqmrckryz'
                playerMap[row[6]]['pos'] = row[4] if row[5] == 'NA' else row[5]
                if 'college' not in playerMap[row[6]]:
                    playerMap[row[6]]['college'] = None
                if row[11] != 'NA':
                    playerMap[row[6]]['college'] = row[11]
                playerMap[row[6]]['sleeperId'] = None if row[9] == 'NA' else row[9]
                if 'end_year' not in playerMap[row[6]] or playerMap[row[6]]['end_year'] < row[1]:
                    playerMap[row[6]]['end_year'] = row[1]
                if 'start_year' not in playerMap[row[6]] or playerMap[row[6]]['start_year'] > row[1]:
                    playerMap[row[6]]['start_year'] = row[1]
                playerMap[row[6]]['awards'] = {}
                playerMap[row[6]]['stats'] = {
                    'rushYd1000': False,
                    'recYd1000': False,
                    'passYd4000': False,
                    'rushTds10': False,
                    'recTds10': False,
                    'passingTds40': False,
                    'ints10': False
                }

    with open('C:\\Users\\Jeremy\\Documents\\Development\\dynasty-daddy\\back-end\\scripts\\resources\\nflAwards.csv', 'r') as awards:
        awardsReader = csv.reader(awards)
        for row in awardsReader:
            if row[0] in playerMap:
                playerMap[row[0]]['awards'] = {
                    'roty': row[2],
                    'mvp': row[3],
                    's_mvp': row[4]
                }

    with open('C:\\Users\\Jeremy\\Desktop\\stats.csv', 'r') as statsFile:
        stats = csv.reader(statsFile)
        for row in stats:
            if row[0] in playerMap:
                playerMap[row[0]]['stats'] = {
                    'rushYd1000': int(row[2]) > 999 or playerMap[row[0]]['stats']['rushYd1000'] is True,
                    'recYd1000': int(row[4]) > 999 or playerMap[row[0]]['stats']['recYd1000'] is True,
                    'passYd4000': int(row[7]) > 3999 or playerMap[row[0]]['stats']['passYd4000'] is True,
                    'rushTds10': int(row[3]) > 9 or playerMap[row[0]]['stats']['rushTds10'] is True,
                    'recTds10': int(row[5]) > 9 or playerMap[row[0]]['stats']['recTds10'] is True,
                    'passingTds40': int(row[8]) > 39 or playerMap[row[0]]['stats']['passingTds40'] is True,
                    'ints10': int(row[6]) > 9 or playerMap[row[0]]['stats']['ints10'] is True
                }

        # Connect to local test database
        conn = psycopg2.connect(
            database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
        )

        # Setting auto commit false
        conn.autocommit = True

        # Creating a cursor object using the cursor() method
        cursor = conn.cursor()
        cursor.execute('TRUNCATE TABLE player_grid;')

        iter = 1
        for key, value in playerMap.items():
            print('(' + str(iter) + '/' + str(len(playerMap)) + ') ' +
                  value['name'] + ' processed ')
            playerGridStatement = '''INSERT INTO player_grid (name, jersey_numbers, teams, headshot_url, pos, sleeper_id, college, awards_json, start_year, end_year, stats_json, gsis_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);'''
            cursor.execute(playerGridStatement, (value['name'], value['jerseyNumbers'],
                                                 value['teams'], value['headshot_url'], value['pos'], value['sleeperId'], value['college'], json.dumps(value['awards'], indent=4), value['start_year'], value['end_year'], json.dumps(value['stats'], indent=4), key))
            iter = iter + 1

    conn.commit()


# refreshPlayerGridTable()

def ExtraCollegeMappings(disablePos=False):

    conn = psycopg2.connect(
        database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
    )

    # Setting auto commit false
    conn.autocommit = True

    data = requests.get('https://www.crossovergrid.com/fblargecsv.csv')
    # print(data.content)
    csv_data = data.text

    # Create a CSV reader
    csv_reader = csv.reader(csv_data.splitlines())

    csvList = list(csv_reader)
    cursor = conn.cursor()
    playerStatement = '''select name, gsis_id, pos
                from player_grid
                where college is null'''
    cursor.execute(playerStatement)
    result_set = cursor.fetchall()
    for row in result_set:
        print(row[0])
        for player in csvList:
            if row[0].lower().strip() in player[0].lower().strip() and (disablePos or (row[2] in player[1] or (row[2] in posExpMap and posExpMap[row[2]] in player[1]))):
                print('->' + player[2])
                playerGridStatement = '''UPDATE player_grid
                                SET
                                college = %s
                                WHERE gsis_id = %s;'''
                cursor.execute(playerGridStatement, (player[2], row[1]))
    playerStatement = '''select name, gsis_id, pos
                from player_grid
                where college is null'''
    cursor.execute(playerStatement)
    result_set2 = cursor.fetchall()
    print('=====Colleges Added======')
    print(len(result_set) - len(result_set2))
    print('=====Players without colleges======')
    print(len(result_set2))

# ExtraCollegeMappings(False)
# ExtraCollegeMappings(True)


def ExtraTeamsPlayedFor():

    conn = psycopg2.connect(
        database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
    )

    # Setting auto commit false
    conn.autocommit = True

    data = requests.get('https://www.crossovergrid.com/fblargecsv.csv')
    # print(data.content)
    csv_data = data.text

    # Create a CSV reader
    csv_reader = csv.reader(csv_data.splitlines())

    # Read the headers row
    headers = next(csv_reader)

    # Map headers to dictionary
    headers_dict = {index: value for index, value in enumerate(headers)}
    csvList = list(csv_reader)
    playerDict = {}
    for player in csvList:
        teams = []
        for num in range(5, 36):
            try:
                if player[num] == '1':
                    teams.append(headers_dict[num])
            except IndexError:
                print("Index out of range, continuing...")
                continue

        playerDict[PlayerService.cleanPlayerIdString(
            re.sub(r'\s*\(.*?\)', '', player[0].strip()) + player[1])] = teams
    
    playerStatement = '''select name, gsis_id, pos, teams
                from player_grid'''
    cursor = conn.cursor()
    cursor.execute(playerStatement)
    result_set = cursor.fetchall()
    for player in result_set:
        nameId = PlayerService.cleanPlayerIdString(player[0] + (player[2] if player[2] not in posExpMap else posExpMap[player[2]]))
        if nameId in playerDict:
            if len(playerDict[nameId]) != len(player[3]):
                result = list(set(playerDict[nameId]) | set(player[3]))
                playerGridStatement = '''UPDATE player_grid
                    SET
                    teams = %s
                    WHERE gsis_id = %s;'''
                cursor.execute(playerGridStatement, (result, player[1]))

# ExtraTeamsPlayedFor()
