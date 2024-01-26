import PlayerService
import psycopg2
import requests
import xml.etree.ElementTree as ET
from DatabaseConnService import GetDatabaseConn

def processXMLPlayers(players_xml):
    tree = ET.ElementTree(ET.fromstring(players_xml.content))

    # Get the root element
    root = tree.getroot()

    # Extract the player information
    players = root.findall('.//player')

    player_data = []
    for player in players:
        first_name = player.find('firstName').text
        last_name = player.find('lastName').text
        position_code = player.find('positionCode').text
        bgsid = player.find('bgsPlayerID').text.strip()

        player_data.append({
            'nameId': PlayerService.cleanPlayerIdString(first_name + last_name + position_code),
            'ffpcId': bgsid
        })
    return player_data

def updateFFPCPlayerIds(leagueId = '10471', isLocal = False):
    
    # fetch espn players
    players_xml = requests.get(
        "https://myffpc.com/FFPCLeagueRosters.ashx?leagueid=" + leagueId)
    
    waiver_xml = requests.get(
        "https://myffpc.com/FFPCLeagueFreeAgents.ashx?leagueid=" + leagueId
    )
    
    conn = GetDatabaseConn(isLocal)
    cursor = conn.cursor()
        
    # Parse the XML string into an ElementTree object
    rosteredPlayers = processXMLPlayers(players_xml)
    freeAgentPlayers = processXMLPlayers(waiver_xml)

    player_data = rosteredPlayers + freeAgentPlayers
    iter = 0
    for player in player_data:
        playerIdsStatement = ''' UPDATE player_ids
                    SET
                    ffpc_id = %s,
                    updated_at = now() where name_id = %s'''
        cursor.execute(playerIdsStatement, (player['ffpcId'], player['nameId']))
        iter = iter + 1
        print('(' + str(iter) + '/' + str(len(player_data)) + ') ' + player['nameId'] + ' processed ')
    conn.commit()

for leagueId in ['31223', '10471']:
    updateFFPCPlayerIds(leagueId)
