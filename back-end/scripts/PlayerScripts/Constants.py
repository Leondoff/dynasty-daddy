
# hard coded name id exceptions.
# if they don't align or have different names
# on either site then we override it
playerExceptionsMap = {
    'gabedaviswr': 'gabrieldaviswr',
    'joshuapalmerwr': 'joshpalmerwr',
    'jeffwilsonrb': 'jefferywilsonrb',
    'camerunpeoplesrb': 'campeoplesrb',
    'nathanieldellwr': 'tankdellwr',
    "kenwalkerrb": "kennethwalkerrb",
    "mitchtrubiskyqb": "mitchelltrubiskyqb",
    "scottymillerwr": "scottmillerwr",
    "andreosivaswr": "andreiiosivaswr",
    "isaiahsimmonslb": "isaiahsimmonsdb",
    "jacobharriste": "jacobharriswr",
    "daxtonhilldb": "daxhilldb"
}

# hardcoded postion map exceptions
# mainly used to consolidate all def positions
# into 3 types DL, LB, DB
DDPlayerPosMap = {
    'S': 'DB',
    'CB': 'DB',
    'NT': 'DL',
    'DT': 'DL',
    'DE': 'DL',
    'PK': 'K',
    'K': 'K',
    'DL': 'DL',
    'EDR': 'DL',
    'DB': 'DB',
    'LB': 'LB',
    'ILB': 'LB',
    'IL': 'DL',
    'OLB': 'LB',
    'Def': 'DF',
    'DEF': 'DF',
    'SS': 'DB',
    'FS': 'DB',
    'DL/LB': 'DL'
}

# Team acryomn exception map
TeamACCException = {
    'SFO': 'SF',
    'TBB': 'TB',
    'GBP': 'GB',
    'NOS': 'NO',
    'LAR': 'LA',
    'SD': 'LAC',
    'KCC': 'KC',
    'NEP': 'NE',
    'OAK': 'LV',
    'HST': 'HOU',
    'BLT': 'BAL',
    'JAC': 'JAX',
    'ARZ': 'ARI',
    'CLV': 'CLE',
    'STL': 'LA',
    'SL': 'LA',
    'LVR': 'LV',
    'PHX': 'ARI'
}

# supported played with players for trivia
SupportedPlayedWith = [
    '00-0026498',
    '00-0019596',
    '00-0010346',
    '00-0022803',
    '00-0023459',
    '00-0020531',
    '00-0022942', 
    '00-0022924',
    '00-0033873',
    '00-0027939',
    '00-0022921',
    '00-0027793',
    '00-0027944',
    '00-0011754',
    '00-0033280',
    '00-0032764',
    '00-0025394',
    '00-0025399',
    '00-0020536',
    '00-0012478',
    '00-0027656',
    '00-0027949',
    '00-0021140',
    '00-0033055',
    '00-0025401',
    '00-0027940',
    '00-0031388',
    '00-0021377',
    '00-0020337'
]

# supported colleges for trivia
SupportedColleges = ['Michigan', 'Texas Christian', 'Georgia', 'Ohio State', 'Florida', 'Alabama', 'Southern California', 'Louisiana State', 'Miami',
                     'Clemson', 'South Carolina', 'North Carolina State', 'North Carolina', 'Wisconsin', 'Oregon', 'Florida State', 'Texas', 'Oklahoma', 'Notre Dame']

# supported teams for trivia
SupportedTeams = ['CAR', 'NO', 'TB', 'ATL', 'LA', 'SEA', 'SF', 'ARI', 'DAL', 'NYG', 'PHI', 'WAS', 'GB', 'MIN', 'DET',
                  'CHI', 'KC', 'LV', 'LAC', 'DEN', 'HOU', 'TEN', 'IND', 'JAX', 'CLE', 'PIT', 'BAL', 'CIN', 'BUF', 'MIA', 'NYJ', 'NE']

# MFL Player API
MFL_URL = "https://api.myfantasyleague.com/2023/export?TYPE=players&L=&APIKEY=&DETAILS=&SINCE=&PLAYERS=&JSON=1"

# Dynasty Process csv link
DYNASTY_PROCESS_URL = "https://raw.githubusercontent.com/dynastyprocess/data/master/files/values.csv"

# dynasty superflex api
DYNASTY_SUPERFLEX_URL = "https://www.dynastysuperflex.com/superflex/rankings/"

# KeepTradeCut Apis
KEEP_TRADE_CUT_SF_REDRAFT_URL = "https://keeptradecut.com/fantasy-rankings?format=2"

KEEP_TRADE_CUT_STD_REDRAFT_URL = "https://keeptradecut.com/fantasy-rankings?format=1"

# fantasy calc apis
FANTASY_CALC_SF_URL = "https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=2"

FANTASY_CALC_STD_URL = "https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=1"

FANTASY_CALC_SF_REDRAFT_URL = "https://api.fantasycalc.com/values/current?isDynasty=false&numQbs=2&numTeams=12&ppr=1&includeAdp=false"

FANTASY_CALC_STD_REDRAFT_URL = "https://api.fantasycalc.com/values/current?isDynasty=false&numQbs=1&numTeams=12&ppr=1&includeAdp=false"

# Sleeper apis
SLEEPER_BASE_URL = "https://api.sleeper.app/v1/league/"

# TODO update URL with new season
ESPN_ROS_URL = "https://www.espn.com/fantasy/football/story/_/id/38386367/fantasy-football-2023-updated-rest-season-rankings"
