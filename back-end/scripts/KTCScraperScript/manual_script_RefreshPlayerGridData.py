import csv
import json
import psycopg2

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

def refreshPlayerGridTable():
    playerMap = {}
    with open('C:\\Users\\Jeremy\\Desktop\\test.csv', 'r') as file:
        csvreader = csv.reader(file)

        for row in csvreader:
            if row[3] not in ['depth_chart_position']:
                if row[13] not in playerMap:
                    playerMap[row[13]] = {}
                playerMap[row[13]]['name'] = row[6]
                if 'jerseyNumbers' not in playerMap[row[13]]:
                    playerMap[row[13]]['jerseyNumbers'] = []
                playerMap[row[13]]['jerseyNumbers'].append(row[4])
                playerMap[row[13]]['jerseyNumbers'] = list(
                    set(playerMap[row[13]]['jerseyNumbers']))
                if 'teams' not in playerMap[row[13]]:
                    playerMap[row[13]]['teams'] = []
                playerMap[row[13]]['teams'].append(
                    row[1] if row[1] not in TeamACCException else TeamACCException[row[1]]
                )
                playerMap[row[13]]['teams'] = list(
                    set(playerMap[row[13]]['teams']))
                playerMap[row[13]]['headshot_url'] = row[23]
                playerMap[row[13]]['pos'] = row[2] if row[3] == 'NA' else row[3]
                playerMap[row[13]
                          ]['college'] = None if row[12] == 'NA' else row[12]
                playerMap[row[13]
                          ]['sleeperId'] = None if row[21] == 'NA' else row[21]
                playerMap[row[13]]['awards'] = None

    with open('C:\\Users\\Jeremy\\Documents\\Development\\dynasty-daddy\\back-end\\scripts\\resources\\nflAwards.csv', 'r') as awards:
        awardsReader = csv.reader(awards)
        for row in awardsReader:
            if row[0] in playerMap:
                playerMap[row[0]]['awards'] = {
                    'roty': row[2],
                    'mvp': row[3],
                    's_mvp': row[4]
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
        for _, value in playerMap.items():
            print('(' + str(iter) + '/' + str(len(playerMap)) + ') ' +
                  value['name'] + ' processed ')
            playerGridStatement = '''INSERT INTO player_grid (name, jersey_numbers, teams, headshot_url, pos, sleeper_id, college, awards_json)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s);'''
            cursor.execute(playerGridStatement, (value['name'], value['jerseyNumbers'],
                                                 value['teams'], value['headshot_url'], value['pos'], value['sleeperId'], value['college'], json.dumps(value['awards'], indent=4)))
            iter = iter + 1

    conn.commit()


refreshPlayerGridTable()
