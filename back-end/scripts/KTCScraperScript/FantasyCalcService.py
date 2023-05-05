import requests
import PlayerService
from Constants import playerExceptionsMap

# format pick to be a string
# this is needed to align with name id format
# TODO verify if the format change is permanent
def formatFantasyCalcCurrentYearPick(pick):
    if '.03' in pick['player']['name']:
        return [pick['player']['name'][0 : 4] + 'early' + PlayerService.formatPickNumber(pick['player']['name'][10]) + 'pi']
    elif '.06' in pick['player']['name']:
        return [pick['player']['name'][0 : 4] + 'mid' + PlayerService.formatPickNumber(pick['player']['name'][10]) + 'pi']
    elif '.10' in pick['player']['name']:
        return [pick['player']['name'][0 : 4] + 'late' + PlayerService.formatPickNumber(pick['player']['name'][10]) + 'pi']
    else:
        return ['none']
        
# format pick to be name id for future draft capital
def formatFantasyCalcFutureYearPick(pick):
    pickNameIds = []
    pickRound = PlayerService.formatPickNumber(pick['player']['name'][-1])
    for pickType in ['early', 'mid', 'late']:
        pickNameIds.append(pick['player']['name'][0 : 4] + pickType + pickRound + 'pi')
    return pickNameIds


# format api response to dict
# Dict format will be {value: number, rank: number}
def formatFantasyCalcDict(response):
    fantasyCalcDict = {}
    for player in response.json():
        # special formatting for picks
        if player['player']['position'] == 'PICK':
            pickNameIds = formatFantasyCalcCurrentYearPick(player) if 'Pick' in player['player']['name'] else formatFantasyCalcFutureYearPick(player)
            if pickNameIds[0] != 'none':
                for pick in pickNameIds:
                    if len(pickNameIds) > 1 and pick not in fantasyCalcDict or len(pickNameIds) == 1:
                        fantasyCalcDict[pick] =  {'value': player['value'], 'rank': player['positionRank'], 'id': player['player']['id']}
        else:
            playerNameId = PlayerService.cleanPlayerIdString(player['player']['name'] + player['player']['position'])
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
