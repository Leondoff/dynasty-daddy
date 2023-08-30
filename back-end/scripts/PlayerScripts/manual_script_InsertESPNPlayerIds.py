import PlayerService
import psycopg2
import requests

espnPosMap = {
    0: 'QB',
    2: 'RB',
    4: 'WR',
    6: 'TE',
    8: 'DL',
    9: 'DL',
    10: 'LB',
    11: 'DL',
    12: 'DB',
    13: 'DB',
    14: 'DB',
    16: 'DF',
    17: 'K',
    'D/ST': 'DF',
    'DT': 'DL',
    'DE': 'DL',
    'LB': 10,
    'CB': 'DL',
    'S': 'DL',
    'DB': 'DL'
}

nflTeamMap = {
  'Cardinals D/ST': 'arizonacardinals',
  'Falcons D/ST': 'atlantafalcons',
  'Ravens D/ST': 'baltimoreravens',
  'Bills D/ST': 'buffalobills',
  'Panthers D/ST': 'carolinapanthers',
  'Bears D/ST': 'chicagobears',
  'Bengals D/ST': 'cincinnatibengals',
  'Browns D/ST': 'clevelandbrowns',
  'Cowboys D/ST': 'dallascowboys',
  'Broncos D/ST': 'denverbroncos',
  'Lions D/ST': 'detroitlions',
  'Packers D/ST': 'greenbaypackers',
  'Texans D/ST': 'houstontexans',
  'Colts D/ST': 'indianapoliscolts',
  'Jaguars D/ST': 'jacksonvillejaguars',
  'Chiefs D/ST': 'kansascitychiefs',
  'Rams D/ST': 'losangelesrams',
  'Chargers D/ST': 'losangeleschargers',
  'Dolphins D/ST': 'miamidolphins',
  'Vikings D/ST': 'minnesotavikings',
  'Patriots D/ST': 'newenglandpatriots',
  'Saints D/ST': 'neworleanssaints',
  'Giants D/ST': 'newyorkgiants',
  'Jets D/ST': 'newyorkjets',
  'Raiders D/ST': 'lasvegasraiders',
  'Eagles D/ST': 'philadelphiaeagles',
  'Steelers D/ST': 'pittsburghsteelers',
  '49ers D/ST': 'sanfrancisco49ers',
  'Seahawks D/ST': 'seattleseahawks',
  'Buccaneers D/ST': 'tampabaybuccaneers',
  'Titans D/ST': 'tennesseetitans',
  'Washington D/ST': 'washingtonfootballteam'
}

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
    iter = 1
    for player in players.json()[0]['players']:
        if player['player']['defaultPositionId'] in espnPosMap.keys():
            playerName = player['player']['fullName']
            if playerName in nflTeamMap:
                playerName = nflTeamMap[playerName]
            playerId = PlayerService.cleanPlayerIdString(playerName + espnPosMap[player['player']['defaultPositionId']])
            espn_id = player['player']['id']
            playerIdsStatement = ''' UPDATE player_ids
                    SET
                    espn_id = %s,
                    updated_at = now() where name_id = %s'''
            cursor.execute(playerIdsStatement, (espn_id, playerId))
            print('(' + str(iter) + '/' + str(len(players.json()[0]['players'])) + ') ' + playerId + ' processed ')
            iter += 1

    conn.commit()

updateESPNPlayerIds()
