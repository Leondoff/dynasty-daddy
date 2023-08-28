
from datetime import date
import os

import requests
from Constants import SLEEPER_BASE_URL
from PlayerService import formatPickNumber
import psycopg2

def getDBConnection():
    # Connect to local test database
    conn = psycopg2.connect(
        database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
    )

    # conn = psycopg2.connect(
    #     database=os.environ['DO_DATABASE'], user=os.environ['DO_DB_USER'], password=os.environ[
    #         'DO_DB_PASSWORD'], host=os.environ['DO_DB_HOST'], port=os.environ['DO_DB_PORT']
    # )
    
    # Setting auto commit false
    conn.autocommit = True

    # Creating a cursor object using the cursor() method
    return conn.cursor()

def FormatPickFromSleeper(pick):
    rd = formatPickNumber(pick.get('round'))
    # 2025late3rdpi
    return pick.get('season') + 'mid' + rd + 'pi'

def ScrapeTrades():
    cursor = getDBConnection()
    cursor.execute('''
        SELECT *
        FROM league_info
        WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
    ''')
    leagues = cursor.fetchall()
    
    bulk_data = []
    for league in leagues:
        if league[3] == None:
            league_data = requests.get(SLEEPER_BASE_URL + league[0]).json()
            if league_data != None:
                scoring = league_data.get('scoring_settings')
                setting = league_data.get('settings')
                teams = league_data.get('total_rosters')
                ppr = scoring.get('rec', 0)
                tep = scoring.get('bonus_rec_te', 0)
                league_type = 'Dynasty' if setting.get('type') == 2 else 'Redraft'
                # get starter count
                roster_positions = league_data.get('roster_positions')
                starters = 0
                for position in roster_positions:
                    if position in ['QB', 'RB', 'WR', 'TE', 'FLEX', 'SUPER_FLEX']:
                        starters += 1
                is_superflex = 'SUPER_FLEX' in roster_positions or roster_positions.count('QB') > 1
                bulk_data.append((league[0], league[1], league[2], league_type, teams, starters, ppr, tep, is_superflex))

    if len(bulk_data) > 0:
        # SQL query for bulk insert/update
        insert_query = """
            INSERT INTO league_info (league_id, season, platform, league_type, teams, starters, ppr, tep, is_superflex)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (league_id, season, platform) DO UPDATE
            SET league_type = excluded.league_type,
                teams = excluded.teams,
                starters = excluded.starters,
                ppr = excluded.ppr,
                tep = excluded.tep,
                is_superflex = excluded.is_superflex;
        """

        # Execute bulk insert/update
        cursor.executemany(insert_query, bulk_data)
        
    for league in leagues:
        transaction_data = requests.get(SLEEPER_BASE_URL + league[0] + '/transactions/1').json()
        for transaction in transaction_data:
            if transaction.get("type") == "trade" and transaction.get("status") == "complete":
                sideA = []
                sideB = []
                
                transactionDict = transaction.get("adds") if transaction.get("adds") is not None else {}
                rosterIds = transaction.get("roster_ids") if transaction.get("roster_ids") is not None else []
                for key, value in transactionDict.items():
                    if value == rosterIds[0]:
                        sideA.append(key)
                    elif value == rosterIds[1]:
                        sideB.append(key)
                draft_picks = transaction.get("draft_picks") if transaction.get("draft_picks") is not None else []
                for pick in draft_picks:
                    if pick.get("owner_id") == rosterIds[0]:
                        sideA.append(FormatPickFromSleeper(pick))
                    elif pick.get("owner_id") == rosterIds[1]:
                        sideB.append(FormatPickFromSleeper(pick))
                print(sideA, sideB)

        
ScrapeTrades()
    