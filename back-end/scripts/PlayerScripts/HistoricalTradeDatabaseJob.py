
import requests
from TradeDatabaseService import ScrapeTrades

# weekly historical run that backloads all trades 
state_of_nfl = requests.get('https://api.sleeper.app/v1/state/nfl').json()

endWeek = state_of_nfl.get("week") if state_of_nfl.get("season_type") != 'pre' else 1

print('Start Historical Trade DB run')

ScrapeTrades(['Dynasty', 'Redraft'], True, True, endWeek)
