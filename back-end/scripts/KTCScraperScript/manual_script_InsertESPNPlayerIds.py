import PlayerService
import psycopg2
import requests

espnPosMap = {1: 'QB', 2: 'RB', 3: 'WR', 4: 'TE'}

def updateESPNPlayerIds():
    
    # fetch espn players
    players = requests.get(
        "https://fantasy.espn.com/apis/v3/games/ffl/seasons/2023/segments/0/leaguedefaults/?view=kona_player_info")
    
    # Connect to local test database
    conn = psycopg2.connect(
        database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
    )

    # Setting auto commit false
    conn.autocommit = True

    # Creating a cursor object using the cursor() method
    cursor = conn.cursor()
    
    for player in players.json()[0]['players']:
        if player['player']['defaultPositionId'] in espnPosMap.keys():
            playerId = PlayerService.cleanPlayerIdString(player['player']['fullName'] + espnPosMap[player['player']['defaultPositionId']])
            espn_id = player['player']['id']
            playerIdsStatement = ''' UPDATE player_ids
                    SET
                    espn_id = %s,
                    updated_at = now() where name_id = %s'''
            cursor.execute(playerIdsStatement, (espn_id, playerId))
    conn.commit()

updateESPNPlayerIds()
