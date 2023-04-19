import requests
import PlayerService

# fetch players and ids from mfl
def fetchMFLPlayerDict():
    response = requests.get(
            "https://api.myfantasyleague.com/2023/export?TYPE=players&L=&APIKEY=&DETAILS=&SINCE=&PLAYERS=&JSON=1")

    mflPlayerDict = {}
    for player in response.json()['players']['player']:
        playerNames = player['name'].split(',')
        playerNameId = PlayerService.cleanPlayerIdString(playerNames[1] + playerNames[0] + player['position'])
        mflPlayerDict[playerNameId] = player['id']
    return mflPlayerDict
