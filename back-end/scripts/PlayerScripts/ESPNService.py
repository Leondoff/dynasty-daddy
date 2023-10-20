import os
from BeautifulSoupService import setUpSoup
from PlayerService import cleanPlayerIdString
from Constants import ESPN_ROS_URL

# scrape ros rankings from espn
def scrapeESPNROS():
    # URL to scrape data uses requests import
    rosURL = ESPN_ROS_URL

    # Set up scraper
    rosSoup = setUpSoup(rosURL)

    players = {}
    
    tablePos = ['qb', 'rb', 'wr', 'te']

    # fetch ADP rankings from page
    ind = 0
    for table in rosSoup.find_all('table'):
        rank = 1
        if ind > 3:
            break
        for row in table.find_all('tr', {'class': 'last'}):
            prow = row.find_all('a')
            if len(prow) == 1:
                nameId = cleanPlayerIdString(prow[0].text.strip() + tablePos[ind])
                players[nameId] = rank
                rank = rank + 1   
        ind = ind + 1
    return players
