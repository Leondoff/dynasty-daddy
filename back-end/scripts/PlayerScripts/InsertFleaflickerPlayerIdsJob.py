from datetime import datetime
from Constants import DDPlayerPosMap
from DatabaseConnService import GetDatabaseConn
import requests
import PlayerService

def GetRostersFromLeague(leagueId, season):
    rosters = requests.get('https://www.fleaflicker.com/api/FetchLeagueRosters?league_id='+ str(leagueId) +'&sport=NFL&season=' + str(season)).json()
    playerDict = {}
    for team in rosters['rosters']:
        for player in team["players"]:
            pro_player = player["proPlayer"]
            player_id = pro_player["id"]
            player_name = pro_player["nameFull"]
            player_position = pro_player["position"]
            if player_position in DDPlayerPosMap:
                player_position = DDPlayerPosMap[player_position]
            nameId = PlayerService.cleanPlayerIdString(player_name + player_position)
            playerDict[nameId] = player_id
    print(str(len(playerDict)) + ' Players found in ' + str(leagueId))
    return playerDict

def PersistPlayerIds(conn, playerDict):
    # Creating a cursor object using the cursor() method
    cursor = conn.cursor()
    iter = 0
    for key, value in playerDict.items():
        playerIdsStatement = ''' UPDATE player_ids
                    SET
                    ff_id = %s,
                    updated_at = now() where name_id = %s'''
        cursor.execute(playerIdsStatement, (value, key))
        print('(' + str(iter) + ') ' + key + ' processed ')
        iter = iter + 1    
    conn.commit()

# Get the current year
current_year = datetime.now().year

fleaflickerLeagueIds = [192396, 324160, 315649, 324160]

conn = GetDatabaseConn()
 
for leagueId in fleaflickerLeagueIds:
    playerDict = GetRostersFromLeague(leagueId, current_year)
    PersistPlayerIds(conn, playerDict)
