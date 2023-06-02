import requests
import PlayerService

# format api response to dict
# Dict format will be {value: number, rank: number}
def formatDynastySuperflexDict(response):
    dynastySuperflexDict = {}
    for player in response.json():
        playerNameId = PlayerService.cleanPlayerIdString(player['player_full_name'] + player['position'][0:2])
        dynastySuperflexDict[playerNameId] = {'sf_value': player['superflex_sf_value'], 'sf_rank': player['superflex_sf_pos_rank'], 'nameId': playerNameId, 'std_value': player['superflex_one_qb_value'], 'std_rank': player['superflex_one_qb_pos_rank']}
    return dynastySuperflexDict

# fetch std players from dynasty superflex
def fetchDynastySuperflexPlayerValues():
    dynastySuperflexResponse = requests.get(
            "https://www.dynastysuperflex.com/superflex/rankings/")
    return formatDynastySuperflexDict(dynastySuperflexResponse)
