import csv
import PlayerService
import psycopg2
from Constants import playerExceptionsMap

def fetchFromFleaFlickerCsv():
    with open('C:\\Users\\Jeremy\\Desktop\\People.csv', 'r') as file:
        csvreader = csv.reader(file)

        # Connect to local test database
        conn = psycopg2.connect(
            database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
        )

        # Setting auto commit false
        conn.autocommit = True

        # Creating a cursor object using the cursor() method
        cursor = conn.cursor()

        for row in csvreader:
            playerId = PlayerService.cleanPlayerIdString(row[3] + row[4])
            fleaflicker_id = row[2]
            playerIdsStatement = ''' UPDATE player_ids
                        SET
                        ff_id = %s,
                        updated_at = now() where name_id = %s'''
            cursor.execute(playerIdsStatement, (fleaflicker_id, playerId))
        conn.commit()

fetchFromFleaFlickerCsv()
