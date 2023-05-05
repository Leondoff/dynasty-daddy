import requests
import csv
import PlayerService
from Constants import playerExceptionsMap

# format pick to be a string
# this is needed to align with name id format
def formatDynastyProcessCurrentYearPick(pick):
    if (pick[10] == '5'):
        return ['none']
    if '.03' in pick:
        return [pick[0:4] + 'early' + PlayerService.formatPickNumber(pick[10]) + 'pi']
    elif '.06' in pick:
        return [pick[0:4] + 'mid' + PlayerService.formatPickNumber(pick[10]) + 'pi']
    elif '.10' in pick:
        return [pick[0:4] + 'late' + PlayerService.formatPickNumber(pick[10]) + 'pi']
    else:
        return ['none']
        
# format pick to be name id for future draft capital
def formatDynastyProcessFutureYearPick(pick):
    if '5th' in pick:
        return ['none']
    if 'Mid' in pick or 'Early' in pick or 'Late' in pick:
        return [pick.lower().replace(" ", "") + 'pi']
    else:
        return [pick[0:4] + 'early' + pick[-3] + 'pi',
                pick[0:4] + 'mid' + pick[-3] + 'pi',
                pick[0:4] + 'late' + pick[-3] + 'pi']

# format api response to dict
# Dict format will be {value: number, rank: number}
def formatDynastyProcessDict(response):
    dynastyProcessDict = {}
    csvreader = csv.reader(response.splitlines())

    for row in csvreader:
        # special formatting for picks
        if row[1] == 'PICK':
            pickNames = formatDynastyProcessCurrentYearPick(row[0]) if 'Pick' in row[0] else formatDynastyProcessFutureYearPick(row[0])
            if pickNames[0] != 'none':
                for pick in pickNames:
                    if len(pickNames) > 1 and pick not in dynastyProcessDict:
                        dynastyProcessDict[pick] = {'std_value': row[8], 'sf_value': row[9]}
                    else:
                        dynastyProcessDict[pick] = {'std_value': row[8], 'sf_value': row[9]}
        else:
            playerNameId = PlayerService.cleanPlayerIdString(row[0] + row[1])
            dynastyProcessDict[playerNameId] = {'std_value': row[8], 'sf_value': row[9], 'std_rank': None, 'sf_rank': None}  
    
    # assign position rank based on values (this is not found on dynasty process)
    for pos in ['qb', 'rb', 'wr', 'te', 'pi']:
        positionDict = {k: v for k, v in dynastyProcessDict.items() if k[-2:] == pos}
        ind = 1
        for k, _ in sorted(positionDict.items(), key=lambda x: int(x[1]['sf_value']), reverse=True):
            dynastyProcessDict.get(k)['sf_rank'] = ind
            ind = ind + 1
        ind = 1
        for k, _ in sorted(positionDict.items(), key=lambda x: int(x[1]['std_value']), reverse=True):
            dynastyProcessDict.get(k)['std_rank'] = ind
            ind = ind + 1
    return dynastyProcessDict

# fetch std players from dynasty process
def fetchDynastyProcessPlayerValues():
    response = requests.get(
            "https://raw.githubusercontent.com/dynastyprocess/data/master/files/values.csv")
    content = response.content.decode("utf-8")
    return formatDynastyProcessDict(content)
