
import random
import json
import os
import psycopg2

SupportedTypes = ['team']

SupportedTeams = ['CAR', 'NO', 'TB', 'ATL', 'LA', 'SEA', 'SF', 'ARI', 'DAL', 'NYG', 'PHI', 'WAS', 'GB', 'MIN', 'DET', 'CHI', 'KC', 'LV', 'LAC', 'DEN', 'HOU', 'TEN', 'IND', 'JAX', 'CLE', 'PIT', 'BLT', 'CIN', 'BUF', 'MIA', 'NYJ', 'NE', 'SD', 'STL']

def SetNewPlayerGrid():
    
    # Connect to local test database
    # conn = psycopg2.connect(
    #     database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
    # )
    
    conn = psycopg2.connect(
        database=os.environ['DO_DATABASE'], user=os.environ['DO_DB_USER'], password=os.environ['DO_DB_PASSWORD'], host=os.environ['DO_DB_HOST'], port=os.environ['DO_DB_PORT']
    )

    # Setting auto commit false
    conn.autocommit = True

    # Creating a cursor object using the cursor() method
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM player_grid;')
    rows = cursor.fetchall()
    
    while True:
        selectedTeams = random.sample(SupportedTeams, 6)
        formattedGrid = [{"type": "team", "value": value} for value in selectedTeams]
        xAxis = formattedGrid[0:3]
        yAxis = formattedGrid[3:6]
        if ValidateActualSolutionExists(rows, xAxis, yAxis):
            break
    
    output_dict = {
        'xAxis': xAxis,
        'yAxis': yAxis
    }
    
    jsonGrid = json.dumps(output_dict)
            
    setTodaysGridStatement = '''UPDATE config
        SET
        config_value = %s WHERE config_key = \'daily_grid\';'''
    cursor.execute(setTodaysGridStatement, (str(jsonGrid),))
    


def ValidateActualSolutionExists(rows, xAxis, yAxis):
    for x in xAxis:
        for y in yAxis:
            isComboValid = False
            for row in rows:
                if y['value'] in row[3] and x['value'] in row[3]:
                    isComboValid = True
                    break
        if isComboValid is False:
            return False
    return True
