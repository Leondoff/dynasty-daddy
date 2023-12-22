from BeautifulSoupService import setUpSoup
from PlayerService import cleanPlayerIdString
from Constants import KEEP_TRADE_CUT_SF_REDRAFT_URL, KEEP_TRADE_CUT_STD_REDRAFT_URL

KTCPosExp = {
    'DS': 'DF',
    'PK': 'K'
}

def loadRankingsFromKTC(rankings_url):
    
    all_rankings = []
    
    for page_number in range(0, 10):
        # Set up scraper
        soup = setUpSoup(f"{rankings_url}&page={page_number}")

        # fetch each ranking div
        rankings = soup.find_all("div", {"class": "onePlayer"})

        # Append the rankings from the current page to the overall list
        all_rankings.extend(rankings)
    
    return all_rankings


def formatKeepTradeCutDict(rankings_url):

    rankings = loadRankingsFromKTC(rankings_url)
    
    valueDict = {}
    for player in rankings:
        tempName = (player.find('div', 'player-name')).find('a')
        tempPos = str(player.find('p', 'position').text.strip())[:2]
        if tempPos in KTCPosExp:
            tempPos = KTCPosExp[tempPos]
        tempId = cleanPlayerIdString(
            str(tempName.text.strip()) + tempPos)
        valueDict[tempId] = {
            "value": (player.find('div', 'value')).find('p').text.strip(),
            "rank": str(player.find('p', 'position').text.strip())[2:]
        }
    return valueDict

# fetch std players from fantast calc
def fetchStandardRedraftKTCPlayerDict():
    return formatKeepTradeCutDict(KEEP_TRADE_CUT_STD_REDRAFT_URL)

# fetch sf players from fantast calc
def fetchSuperFlexRedraftKTCPlayerDict():
    return formatKeepTradeCutDict(KEEP_TRADE_CUT_SF_REDRAFT_URL)
