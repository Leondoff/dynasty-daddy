import os
from BeautifulSoupService import setUpSoup
from PlayerService import cleanPlayerIdString

# scrape ros rankings from fantasyguys
def scrapeFantasyGuysROS(position):
    # URL to scrape data uses requests import
    rosURL = f'https://footballguys.com/rankings/duration/restofseason?pos={position}'

    # Set up scraper
    rosSoup = setUpSoup(rosURL)

    players = {}

    # fetch ADP rankings from page
    for tr in rosSoup.find_all('tr')[1:-5]:
        tds = tr.find_all('td')
        if len(tds) > 1:
            rank = tds[0].text.strip()
            nameId = cleanPlayerIdString(tds[1].find('b').text.strip() + position)
            players[nameId] = rank        
    return players
