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
    with open('C:\\Users\\Jeremy\\Desktop\\roster_all_years.csv', 'r') as file:
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
                    playerMap[row[6]]['headshot_url'] = row[7]
                playerMap[row[6]]['pos'] = row[4] if row[5] == 'NA' else row[5]
                playerMap[row[6]]['college'] = None if row[11] == 'NA' else row[11]
                playerMap[row[6]]['sleeperId'] = None if row[9] == 'NA' else row[9]
                playerMap[row[6]]['awards'] = None

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
# update LeGarrette Blount and add PIT