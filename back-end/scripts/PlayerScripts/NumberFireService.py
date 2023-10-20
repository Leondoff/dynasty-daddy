import os
from BeautifulSoupService import setUpSoup
from PlayerService import cleanPlayerIdString

# scrape ros rankings from number fire
def scrapeNFROS(position):
    # URL to scrape data uses requests import
    rosURL = f'https://www.numberfire.com/nfl/fantasy/remaining-projections/{position}'

    # Set up scraper
    rosSoup = setUpSoup(rosURL)

    players = {}

    # fetch ADP rankings from page
    rank = 1
    for tr in rosSoup.find_all('tr'):
        tds = tr.find_all('td', {'class': 'player'})
        if len(tds) == 1:
            nameId = cleanPlayerIdString(tds[0].find('span', {'class': 'full'}).text.strip() + position)
            players[nameId] = rank  
            rank = rank + 1
    return players
