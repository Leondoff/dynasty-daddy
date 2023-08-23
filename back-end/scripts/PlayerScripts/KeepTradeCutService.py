from BeautifulSoupService import setUpSoup
from PlayerService import cleanPlayerIdString
from Constants import KEEP_TRADE_CUT_SF_REDRAFT_URL, KEEP_TRADE_CUT_STD_REDRAFT_URL

KTCPosExp = {
    'DS': 'DF',
    'PK': 'K'
}


def formatKeepTradeCutDict(rankings_url):
    # Set up scraper
    soup = setUpSoup(rankings_url)

    # fetch each ranking div
    rankings = soup.find_all("div", {"class": "onePlayer"})
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

# fetchSuperFlexRedraftPlayerDict()