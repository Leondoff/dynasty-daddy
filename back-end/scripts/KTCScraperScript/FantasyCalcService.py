import requests
import PlayerService

# hard coded fantasy calc name id exceptions.
# if they don't align or have different names
# on either site then we override it
playerExceptionsMap = {
    'gabedaviswr': 'gabrieldaviswr',
    'joshuapalmerwr': 'joshpalmerwr',
    'jeffwilsonrb': 'jefferywilsonrb'
}

# format api response to dict
# Dict format will be {value: number, rank: number}
def formatFantasyCalcDict(response):
    fantasyCalcDict = {}
    for player in response.json():
        # special formatting for picks
        if player['player']['position'] == 'PICK':
            pickNameIds = []
            pickRound = PlayerService.formatPickNumber(player['player']['name'][-1])
            for pickType in ['early', 'mid', 'late']:
                 pickNameIds.append(player['player']['name'][0 : 4] + pickType + pickRound + 'pi')
            for pick in pickNameIds:
                fantasyCalcDict[pick] = {'value': player['value'], 'rank': player['positionRank'], 'id': player['player']['id']}
        else:
            playerNameId = PlayerService.cleanPlayerIdString(player['player']['name'] + player['player']['position'])
            if playerNameId in playerExceptionsMap:
                playerNameId = playerExceptionsMap[playerNameId]
            fantasyCalcDict[playerNameId] = {'value': player['value'], 'rank': player['positionRank'], 'id': player['player']['id']}
    return fantasyCalcDict

# fetch std players from fantast calc
def fetchStandardPlayerDict():
    stdResponse = requests.get(
            "https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=1")
    return formatFantasyCalcDict(stdResponse)

# fetch sf players from fantast calc
def fetchSuperFlexPlayerDict():
    sfResponse = requests.get(
            "https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=2")
    return formatFantasyCalcDict(sfResponse)
