import requests
import PlayerService

MFL_URL = "https://api.myfantasyleague.com/2023/export?TYPE=players&L=&APIKEY=&DETAILS=&SINCE=&PLAYERS=&JSON=1"

DDPlayerMap = {
    'S': 'DB',
    'CB': 'DB',
    'NT': 'DL',
    'DT': 'DL',
    'DE': 'DL',
    'PK': 'K',
    'K': 'K',
    'DL': 'DL',
    'DB': 'DB',
    'LB': 'LB',
    'ILB': 'LB',
    'OLB': 'LB',
    'Def': 'DF',
    'DEF': 'DF',
    'SS': 'DB',
    'FS': 'DB',
    'DL/LB': 'DL'
}


# fetch players and ids from mfl
def fetchMFLPlayerDict():
    response = requests.get(MFL_URL)

    mflPlayerDict = {}
    if response.json() is not None:
        for player in response.json()['players']['player']:
            playerNames = player['name'].split(',')
            playerNameId = PlayerService.cleanPlayerIdString(playerNames[1] + playerNames[0] + player['position'])
            mflPlayerDict[playerNameId] = player['id']
    return mflPlayerDict

# fetch players and ids from mfl
def fetchMFLPlayerDictNonOffense():
    response = requests.get(MFL_URL)
    
    mflPlayerDict = {}
    if response.json() is not None:
        for player in response.json()['players']['player']:
            if player['position'] in DDPlayerMap:
                playerNames = player['name'].split(',')
                playerNameId = PlayerService.cleanPlayerIdString(playerNames[1] + playerNames[0] + DDPlayerMap[player['position']])
                mflPlayerDict[playerNameId] = player['id']
    return mflPlayerDict