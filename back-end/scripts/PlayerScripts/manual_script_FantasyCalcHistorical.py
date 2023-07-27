import requests
import psycopg2
import datetime
import time
from FantasyCalcService import formatFantasyCalcDict

# Create a map of nameIds to fantasy calc ids
def createNameIdFCMap():
    currentRes = requests.get(
        "https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=2")
    return formatFantasyCalcDict(currentRes)

# fetch historical std and sf values for fantasy calc id and merge maps
def fetchHistoricalValuesFromFC(fcPlayerId):
    stdResponse = requests.get(
        "https://api.fantasycalc.com/trades/implied/" + fcPlayerId + "?isDynasty=true&numQbs=1")
    sfResponse = requests.get(
        "https://api.fantasycalc.com/trades/implied/" + fcPlayerId + "?isDynasty=true&numQbs=2")
    stdData = stdResponse.json()['historicalValues']
    sfData = sfResponse.json()['historicalValues']
    dateMap = {}
    for data in stdData:
        dateMap[data['date']] = data['value']
    mergeMap = {}
    for data in sfData:
        mergeMap[data['date']] = {
            'std_value': dateMap[data['date']], 'sf_value': data['value']}
    return mergeMap

# update historical player values records with fantasy calc values
def insertHistoricalFCData():
    playerMap = createNameIdFCMap()
    conn = psycopg2.connect(
        database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
    )

    # Setting auto commit false
    conn.autocommit = True

    # Creating a cursor object using the cursor() method
    cursor = conn.cursor()
    iter = 1
    for nameId, values in playerMap.items():
        fcId = str(values['id'])
        dateFCMap = fetchHistoricalValuesFromFC(fcId)
        cursor.execute(
            '''SELECT * FROM player_values WHERE created_at::date = '2023-01-09' AND name_id = \'''' + nameId + '\';')
        for e in cursor.fetchall():
            date = datetime.datetime.strftime(e[6], '%m/%d/%Y')
            if date in dateFCMap.keys():
                playerValueUpdateSQL = '''UPDATE player_values
                                SET
                                fc_sf_trade_value = %s,
                                fc_trade_value = %s
                                WHERE created_at = %s AND name_id = %s;'''
                cursor.execute(playerValueUpdateSQL, (dateFCMap[date]['sf_value'],
                                                        dateFCMap[date]['std_value'],
                                                        e[6],
                                                        nameId))
        print('(' + str(iter) + '/' + str(len(playerMap)) + ') ' + nameId + ' processed ')
        time.sleep(2)
        iter = iter + 1
    conn.commit()
    cursor.close()

# run insert
insertHistoricalFCData()
