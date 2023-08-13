
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
    "scottymillerwr": "scottmillerwr"
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

# MFL Player API
MFL_URL = "https://api.myfantasyleague.com/2023/export?TYPE=players&L=&APIKEY=&DETAILS=&SINCE=&PLAYERS=&JSON=1"

# Dynasty Process csv link
DYNASTY_PROCESS_URL = "https://raw.githubusercontent.com/dynastyprocess/data/master/files/values.csv"

# dynasty superflex api
DYNASTY_SUPERFLEX_URL = "https://www.dynastysuperflex.com/superflex/rankings/"

# fantasy calc apis
FANTASY_CALC_SF_URL = "https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=1"

FANTASY_CALC_STD_URL = "https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=2"
