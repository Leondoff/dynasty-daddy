import os
from sleeper_wrapper import Players
from BeautifulSoupService import setUpSoup
from PlayerService import cleanPlayerIdString
from Constants import playerExceptionsMap

class PlayerADP:
    def __init__(self, nameId, fantasyProADP, bb10ADP, rtsportsADP, underdogADP, draftersADP, avgADP):
        self.nameId = nameId
        self.fantasyProADP = fantasyProADP
        self.bb10ADP = bb10ADP
        self.rtsportsADP = rtsportsADP
        self.underdogADP = underdogADP
        self.draftersADP = draftersADP
        self.avgADP = avgADP

    def toString(self):
        print(self.nameId, self.fantasyProADP, self.bb10ADP, self.rtsportsADP, self.underdogADP, self.draftersADP,
              self.avgADP)

# get average of List
def averageOfList(lst):
    return sum(lst) / len(lst)

# scrape adp from fantasy pros best ball pages
def scrapeADP(position):
    # URL to scrape data uses requests import
    adpURL = f'https://www.fantasypros.com/nfl/adp/best-ball-{position}.php'

    # Set up scraper
    adpSoup = setUpSoup(adpURL)

    players = []

    # fetch ADP rankings from page
    for tr in adpSoup.find_all('tr')[1:-5]:
        tds = tr.find_all('td')
        fantasyPro_adp = tds[0].text.strip()
        nameId = cleanPlayerIdString(tds[2].find('a').text.strip() + position)
        bb10_adp = tds[3].text.strip() or None
        rtsports_adp = tds[4].text.strip() or None
        underdog_adp = tds[5].text.strip() or None
        drafters_adp = tds[6].text.strip() or None
        # determine average based on values
        adp_list = list(filter(None,[fantasyPro_adp, bb10_adp, rtsports_adp, underdog_adp, drafters_adp]))
        avg_adp = round(averageOfList(list(map(int,adp_list))), 1)

        players.append(PlayerADP(nameId, fantasyPro_adp, bb10_adp, rtsports_adp, underdog_adp, drafters_adp, avg_adp))
    return players
