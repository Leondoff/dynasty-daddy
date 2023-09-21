import json
import psycopg2
import requests

def updatePlayerGamelogs(season, week = None):
    
    baseUrl = 'https://api.sleeper.app/v1/stats/nfl/regular/' + str(season) + '/'
    
    conn = psycopg2.connect(
        database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
    )

    # Setting auto commit false
    conn.autocommit = True

    # Creating a cursor object using the cursor() method
    cursor = conn.cursor()
    
    weeks = []
    if week is None:
        for num in range(1, 19):
            weeks.append(num)
    else:
        weeks.append(week)
    
    for num in weeks:
        data = requests.get(baseUrl + str(num))
        gamelog = json.loads(data.content.decode('utf-8'))
        if gamelog != {}:
            gamelog_json = json.dumps(gamelog)
            gamelogInsertSQL = '''
                INSERT INTO player_gamelogs (season, week, gamelog_json)
                VALUES (%s, %s, %s);
            '''
            cursor.execute(gamelogInsertSQL, (season, num, gamelog_json))
            print('Gamelog inserted for the following season: ' + str(season) + ' week ' + str(num))
    conn.commit()

updatePlayerGamelogs(2023, 2)
