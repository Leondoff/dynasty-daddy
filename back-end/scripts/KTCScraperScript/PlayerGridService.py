
import random
import json
import os
import psycopg2

SupportedYTypes = ['college', 'jersey_number']

SupportedXTypes = ['award', 'stat']

SupportedTeams = ['CAR', 'NO', 'TB', 'ATL', 'LA', 'SEA', 'SF', 'ARI', 'DAL', 'NYG', 'PHI', 'WAS', 'GB', 'MIN', 'DET', 'CHI', 'KC', 'LV', 'LAC', 'DEN', 'HOU', 'TEN', 'IND', 'JAX', 'CLE', 'PIT', 'BAL', 'CIN', 'BUF', 'MIA', 'NYJ', 'NE']

SupportedColleges = ['Michigan', 'Texas Christian', 'Georgia', 'Ohio State', 'Florida', 'Alabama', 'Southern California', 'Louisiana State', 'Clemson', 'South Carolina', 'North Carolina State', 'North Carolina', 'Wisconsin', 'Oregon', 'Florida State', 'Texas', 'Oklahoma', 'Notre Dame']

SupportedJerseyNumbers = ['12', '18', '89', '85', '26', '22', '27', '95', '97', '98', '91', '90', '23', '25', '2', '35', '30', '38', '59', '69']

SupportedAwards = ['roty', 'mvp', 's_mvp']

SupportedStats = ['rushYd1000', 'recYd1000', 'passYd4000', 'rushTds10', 'recTds10', 'passingTds40', 'ints10']

EightyPercentArray = [False, True, True, True, True]

AnswerGrid = []

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
        if (random.choice(EightyPercentArray)):
            selectedWildcard = random.choice(SupportedYTypes)
            if selectedWildcard is 'college':
                selectedCollege = random.choice(SupportedColleges)
                formattedGrid[5] = {"type": "college", "value": selectedCollege}
            if selectedWildcard is 'jersey_number':
                selectedNumber = random.choice(SupportedJerseyNumbers)
                formattedGrid[5] = {"type": "jersey_number", "value": selectedNumber}
        if (random.choice(EightyPercentArray)):
            selectedWildcard = random.choice(SupportedXTypes)
            if selectedWildcard is 'stat':
                selectedStat = random.choice(SupportedStats)
                formattedGrid[2] = {"type": "stat", "value": selectedStat}
            if selectedWildcard is 'award':
                selectedAward = random.choice(SupportedAwards)
                formattedGrid[2] = {"type": "award", "value": selectedAward}
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
    
    setTodaysGridAnswerStatement = '''UPDATE config
        SET
        config_value = %s WHERE config_key = \'daily_grid_answer\';'''
    cursor.execute(setTodaysGridAnswerStatement, (str(AnswerGrid),))
    

def ValidateActualSolutionExists(rows, xAxis, yAxis):
    global AnswerGrid
    playerIds = []
    playerNames = []
    for x in xAxis:
        for y in yAxis:
            for row in rows:
                yValue = getValueToValidate(row, y['type'])
                xValue = getValueToValidate(row, x['type'])
                if y['value'] in yValue and x['value'] in xValue and row[0] not in playerIds:
                    playerIds.append(row[0])
                    playerNames.append(row[1])
                    break
    if len(playerIds) < 9:
        return False
    AnswerGrid = playerNames
    return True

def getValueToValidate(row, type):
    if type is 'jersey_number':
        return row[2]
    elif type is 'college':
        return [row[6]]
    elif type is 'award':
        awards = []
        awards_json = row[8]
        for key, value in awards_json.items():
            if value is not '':
                awards.append(key)
        return awards
    elif type is 'stat':
        stats = []
        stats_json = row[11]
        for key, value in stats_json.items():
            if value:
                stats.append(key)
        return stats
    else:
        return row[3]
