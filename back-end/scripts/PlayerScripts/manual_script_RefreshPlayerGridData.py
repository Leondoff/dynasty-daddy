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

def UpdateStatsJson():

    # Connect to local test database
    conn = psycopg2.connect(
        database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
    )

    # Setting auto commit false
    conn.autocommit = True

    # Creating a cursor object using the cursor() method
    cursor = conn.cursor()
    playerStatement = '''select gsis_id
                        from player_grid where gsis_id is not null;'''
    cursor = conn.cursor()
    cursor.execute(playerStatement)
    result_set = cursor.fetchall()

    statsDict = {}
    with open('C:\\Users\\Jeremy\\Desktop\\stats.csv', 'r') as statsFile:
        stats = csv.reader(statsFile)
        for p in result_set:
            statsDict[p[0]] = {
                'rushYd1000': False,
                'recYd1000': False,
                'passYd4000': False,
                'rushTds10': False,
                'recTds10': False,
                'passingTds30': False,
                'ints10': False,
                'rec100': False,
                'specialTds2': False,
                'maxTdPass5': False,
                'maxTdRush3': False,
                'maxTdRec3': False,
                'maxInt4': False,
                'maxYdPass300': False,
                'maxYdRush200': False,
                'maxYdRec200': False,
                'maxRec12': False,
                '70RushRecG': False,
                '50Rush200PassG': False,
                '1Rush1RecG': False,
                '1Pass1RecG': False,
                '3Pass1RushG': False
            }
        for row in stats:
            if row[0] in statsDict:
                statsDict[row[0]] = {
                        'rushYd1000': int(row[2]) > 999 or statsDict[row[0]]['rushYd1000'] is True,
                        'recYd1000': int(row[4]) > 999 or statsDict[row[0]]['recYd1000'] is True,
                        'passYd4000': int(row[7]) > 3999 or statsDict[row[0]]['passYd4000'] is True,
                        'rushTds10': int(row[3]) > 9 or statsDict[row[0]]['rushTds10'] is True,
                        'recTds10': int(row[5]) > 9 or statsDict[row[0]]['recTds10'] is True,
                        'passingTds30': int(row[8]) > 29 or statsDict[row[0]]['passingTds30'] is True,
                        'ints10': int(row[6]) > 9 or statsDict[row[0]]['ints10'] is True,
                        'rec100': int(row[9]) > 100 or statsDict[row[0]]['rec100'] is True,
                        'specialTds2': int(row[10]) >= 2 or statsDict[row[0]]['specialTds2'] is True,
                        'maxTdPass5': int(row[11]) > 4 or statsDict[row[0]]['maxTdPass5'] is True,
                        'maxTdRush3': int(row[12]) > 2 or statsDict[row[0]]['maxTdRush3'] is True,
                        'maxTdRec3': int(row[13]) > 2 or statsDict[row[0]]['maxTdRec3'] is True,
                        'maxInt4': int(row[14]) > 3 or statsDict[row[0]]['maxInt4'] is True,
                        'maxYdPass300': int(row[15]) >= 300 or statsDict[row[0]]['maxYdPass300'] is True,
                        'maxYdRush200': int(row[16]) >= 200 or statsDict[row[0]]['maxYdRush200'] is True,
                        'maxYdRec200': int(row[17]) >= 200 or statsDict[row[0]]['maxYdRec200'] is True,
                        'maxRec12': int(row[18]) >= 12 or statsDict[row[0]]['maxRec12'] is True,
                        '70RushRecG': row[19] == 'TRUE' or statsDict[row[0]]['70RushRecG'] is True,
                        '50Rush200PassG': row[20] == 'TRUE' or statsDict[row[0]]['50Rush200PassG'] is True,
                        '1Rush1RecG': row[21] == 'TRUE' or statsDict[row[0]]['1Rush1RecG'] is True,
                        '1Pass1RecG': row[22] == 'TRUE' or statsDict[row[0]]['1Pass1RecG'] is True,
                        '3Pass1RushG': row[23] == 'TRUE' or statsDict[row[0]]['3Pass1RushG'] is True,
                }
        iter = 1
        for key, value in statsDict.items():
            print('(' + str(iter) + '/' + str(len(statsDict)) + ') ' +
              key + ' processed ')
            playerGridStatement = '''UPDATE player_grid
                        SET
                        stats_json = %s
                        WHERE gsis_id = %s;'''
            cursor.execute(playerGridStatement, (json.dumps(value, indent=4), key))
            iter = iter + 1
    conn.commit()

# UpdateStatsJson()
