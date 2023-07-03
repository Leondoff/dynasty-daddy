
import random
import json
import os
import psycopg2

SupportedTypes = ['college', 'jersey_number']

SupportedTeams = ['CAR', 'NO', 'TB', 'ATL', 'LA', 'SEA', 'SF', 'ARI', 'DAL', 'NYG', 'PHI', 'WAS', 'GB', 'MIN', 'DET', 'CHI', 'KC', 'LV', 'LAC', 'DEN', 'HOU', 'TEN', 'IND', 'JAX', 'CLE', 'PIT', 'BAL', 'CIN', 'BUF', 'MIA', 'NYJ', 'NE']

SupportedColleges = ['Michigan', 'Texas Christian', 'Georgia', 'Ohio State', 'Florida', 'Alabama', 'Southern California', 'Louisiana State', 'Clemson', 'South Carolina', 'North Carolina State', 'North Carolina', 'Wisconsin', 'Oregon', 'Florida State', 'Texas', 'Oklahoma', 'Notre Dame']

SupportedJerseyNumbers = ['12', '18', '89', '85', '26', '22', '27', '95', '97', '98', '91', '90', '23', '25', '2']

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
    iter = 0
    while True and iter < 100:
        selectedTeams = random.sample(SupportedTeams, 6)
        formattedGrid = [{"type": "team", "value": value} for value in selectedTeams]
        # Y axis wild card
        if (random.choice([True])):
            selectedWildcard = random.choice(SupportedTypes)
            if selectedWildcard is 'college':
                selectedCollege = random.choice(SupportedColleges)
                formattedGrid[5] = {"type": "college", "value": selectedCollege}
            if selectedWildcard is 'jersey_number':
                selectedNumber = random.choice(SupportedJerseyNumbers)
                formattedGrid[5] = {"type": "jersey_number", "value": selectedNumber}
        xAxis = formattedGrid[0:3]
        yAxis = formattedGrid[3:6]
        iter = iter + 1
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
    isComboValid = 0
    for x in xAxis:
        for y in yAxis:
            for row in rows:
                yValue = getValueToValidate(row, y['type'])
                xValue = getValueToValidate(row, x['type'])
                if y['value'] in yValue and x['value'] in xValue:
                    isComboValid = isComboValid + 1
                    break
    if isComboValid < 9:
        return False
    return True

def getValueToValidate(row, type):
    if type is 'jersey_number':
        return row[2]
    elif type is 'college':
        return [row[6]]
    else:
        return row[3]
