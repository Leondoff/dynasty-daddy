import requests
import PlayerService
from Constants import DDPlayerPosMap, MFL_URL

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
            if player['position'] in DDPlayerPosMap:
                playerNames = player['name'].split(',')
                playerNameId = PlayerService.cleanPlayerIdString(playerNames[1] + playerNames[0] + DDPlayerPosMap[player['position']])
                mflPlayerDict[playerNameId] = player['id']
    return mflPlayerDict