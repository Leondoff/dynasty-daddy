from FantasyProsADPScraper import averageOfList, scrapeADP
from DatabaseConnService import GetDatabaseConn
from ESPNService import scrapeESPNROS
from NumberFireService import scrapeNFROS
from FantasyGuysService import scrapeFantasyGuysROS

def updatePlayerRankings():
    
    playerADPs = scrapeADP('qb') + scrapeADP('rb') + \
        scrapeADP('wr') + scrapeADP('te')
        
    playerESPNROS = scrapeESPNROS()
    
    playerFGROS = {**scrapeFantasyGuysROS('qb'), **scrapeFantasyGuysROS('rb'),
                   **scrapeFantasyGuysROS('wr'), **scrapeFantasyGuysROS('te')}
    
    playerNFROS = {**scrapeNFROS('qb'), **scrapeNFROS('rb'),
                   **scrapeNFROS('wr'), **scrapeNFROS('te')}

    cursor = GetDatabaseConn()

    for adp in playerADPs:
        fgRos = int(playerFGROS[adp.nameId]) if adp.nameId in playerFGROS else None
        nfRos = int(playerNFROS[adp.nameId]) if adp.nameId in playerNFROS else None
        espnRos = int(playerESPNROS[adp.nameId]) if adp.nameId in playerESPNROS else None
        
        totalList = [fgRos, nfRos, espnRos]

        # Filter out None values from the list
        totalList = [value for value in totalList if value is not None]
        avgRos = round(averageOfList(list(map(int, totalList))), 1) if len(totalList) > 0 else None
        
        playerADPStatement = '''INSERT INTO player_adp (name_id, fantasypro_adp, bb10_adp, rtsports_adp, underdog_adp, drafters_adp, avg_adp, numberfire_ros, espn_ros, avg_ros) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (name_id) DO UPDATE
            SET
            name_id = %s,
            fantasypro_adp = %s,
            bb10_adp = %s,
            rtsports_adp = %s,
            underdog_adp = %s,
            drafters_adp = %s,
            avg_adp = %s,
            numberfire_ros = %s,
            espn_ros = %s,
            avg_ros = %s; '''
        
        cursor.execute(playerADPStatement, (adp.nameId, adp.fantasyProADP, adp.bb10ADP, adp.rtsportsADP, adp.underdogADP, adp.draftersADP,
                        adp.avgADP, nfRos, espnRos, avgRos, adp.nameId, adp.fantasyProADP,
                        adp.bb10ADP, adp.rtsportsADP, adp.underdogADP, adp.draftersADP, adp.avgADP, nfRos,
                        espnRos, avgRos))
        
        # only add fg if they exist
        if playerFGROS:
            playerADPStatement = '''INSERT INTO player_adp (fantasyguys_ros) VALUES (%s)
                ON CONFLICT (name_id) DO UPDATE
                SET
                fantasyguys_ros = %s;'''
            
            cursor.execute(playerADPStatement, (fgRos, fgRos))

updatePlayerRankings()
