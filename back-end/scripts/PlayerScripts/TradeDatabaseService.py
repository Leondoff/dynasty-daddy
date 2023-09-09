
from datetime import date
import datetime
import json
import os
import time

import requests
from Constants import SLEEPER_BASE_URL
from PlayerService import formatPickNumberTransaction
import psycopg2

def getDBConnection():
    # Connect to local test database
    # conn = psycopg2.connect(
    #     database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
    # )

    conn = psycopg2.connect(
        database=os.environ['DO_DATABASE'], user=os.environ['DO_DB_USER'], password=os.environ[
            'DO_DB_PASSWORD'], host=os.environ['DO_DB_HOST'], port=os.environ['DO_DB_PORT']
    )
    
    # Setting auto commit false
    conn.autocommit = True

    # Creating a cursor object using the cursor() method
    return conn

def GetLeagueType(leagueType):
    if (leagueType == 0):
        return 'Redraft'
    elif (leagueType == 1):
        return 'Keeper'
    else:
        return 'Dynasty'

def FormatPickFromSleeper(pick):
    rd = formatPickNumberTransaction(str(pick.get('round')))
    # 2025late3rdpi
    return pick.get('season') + 'mid' + rd + 'pi'

def ScrapeTrades(leagueType, isAllTime = False):
    state_of_nfl = requests.get('https://api.sleeper.app/v1/state/nfl').json()
    season = state_of_nfl.get("season")
    week = state_of_nfl.get("week") if state_of_nfl.get("season_type") != 'pre' else 1 
    
    conn = getDBConnection()
    cursor = conn.cursor()
    query = """
        SELECT *
        FROM league_info
        WHERE EXTRACT(YEAR FROM created_at) = %s
            AND league_type is NULL;
    """
    cursor.execute(query, (season,))
    leagues = cursor.fetchall()

    bulk_data = []
    iter = 0
    interval = round(len(leagues) / 100)
    print("Start Processing Leagues")
    for league in leagues:
        if league[3] == None:
            try:
                league_data = requests.get(SLEEPER_BASE_URL + league[0]).json()
                if league_data != None:
                    scoring = league_data.get('scoring_settings')
                    setting = league_data.get('settings')
                    roster_positions = league_data.get('roster_positions')
                    # Check if all required fields exist before adding to bulk_data
                    if scoring and setting and roster_positions:
                        teams = league_data.get('total_rosters')
                        ppr = scoring.get('rec', 0)
                        tep = scoring.get('bonus_rec_te', 0)
                        league_type = GetLeagueType(setting.get('type'))

                        # Calculate starters
                        starters = sum(1 for position in roster_positions if position in ['QB', 'RB', 'WR', 'TE', 'FLEX', 'SUPER_FLEX'])
                        
                        # Check for SUPER_FLEX in roster positions or more than one QB
                        is_superflex = 'SUPER_FLEX' in roster_positions or roster_positions.count('QB') > 1
                        
                        bulk_data.append((league[0], league[1], league[2], league_type, teams, starters, ppr, tep, is_superflex))
                    else:
                        print("Skipping league due to missing data:", league)
                iter += 1
                if iter % interval == 0:
                    print(f"{round((iter/len(leagues))*100)}% Processed")
            except Exception as e:
                print(f"error for league - {league[0]}: {e}")
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

        conn = getDBConnection()
        cursor = conn.cursor()

        # Execute bulk insert/update
        try:
            cursor.executemany(insert_query, bulk_data)
        except Exception as e:
            print(f"An error occurred: {e}")
            conn.rollback()

            # Find the specific row that caused the error
            for idx, data in enumerate(bulk_data):
                try:
                    cursor.execute(insert_query, data)
                    conn.commit()
                except Exception as inner_e:
                    print(f"Error on row {idx + 1}: {data} \n Error - {inner_e}")

    leagueQuery = """
        SELECT *
        FROM league_info
        WHERE EXTRACT(YEAR FROM created_at) = %s
            AND league_type = %s;
    """
    cursor.execute(leagueQuery, (season, leagueType))
    leagues = cursor.fetchall()
    
    iter = 0
    interval = round(len(leagues) / 100)
    print("Start Processing Trades")
    tradesToProcess = []; 
    for league in leagues:
        try:
            response = requests.get(SLEEPER_BASE_URL + league[0] + '/transactions/' + str(week))
        
            transaction_data = response.json()
            for transaction in transaction_data:
                if transaction.get ("type") == "trade" and transaction.get("status") == "complete" and transaction.get("adds") is not None:
                    # if not alltime only update trades for the past 30 hours
                    if isAllTime is False:
                        transactionDate = transaction.get("status_updated")
                        transaction_date_seconds = transactionDate / 1000
                        transaction_datetime = datetime.datetime.utcfromtimestamp(transaction_date_seconds)
                        current_time = datetime.datetime.utcnow()
                        time_threshold = current_time - datetime.timedelta(hours=30)
                        if transaction_datetime < time_threshold:
                            continue
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
                    if len(sideA) > 0 and len(sideB) > 0:
                        trade = [
                            transaction.get("transaction_id"),
                            sideA,
                            sideB,
                            transaction.get("status_updated"),
                            'Sleeper',
                            league[0]
                        ]
                        tradesToProcess.append(trade)
            iter += 1
            time.sleep(0.001)
            if interval != 0 and iter % interval == 0:
                print(f"{round((iter/len(leagues))*100)}% Processed")
        except Exception as e:
            print(f"error for trades from league - {league[0]}: {e}")
    # Insert trades into the trade databse
    insert_trades = """
        INSERT INTO trades (transaction_id, sideA, sideB, transaction_date, platform, league_id)
        VALUES (%s, %s, %s, to_timestamp(%s / 1000.0), %s, %s)
        ON CONFLICT (transaction_id, platform) DO NOTHING;
    """
    
    conn = getDBConnection()
    cursor = conn.cursor()
    batch_size = 1000
    iter = 0
    # Split the data into batches
    for i in range(0, len(tradesToProcess), batch_size):
        batch_data = tradesToProcess[i:i + batch_size]

        try:
            cursor.executemany(insert_trades, batch_data)
        except Exception as e:
            print(f"An error occurred: {e}")
            conn.rollback()

            # Find the specific row that caused the error
            for idx, data in enumerate(batch_data):
                try:
                    cursor.execute(insert_trades, data)
                    conn.commit()
                except Exception as inner_e:
                    print(f"Error on row {idx + 1}: {data} \n Error: {inner_e}")
        iter += 1
        print(f"{batch_size * iter}/{len(tradesToProcess)} Trades Persisted")
        
    # update mat view for fantasy calc values
    cursor.execute(
    '''REFRESH MATERIALIZED VIEW CONCURRENTLY mat_vw_trade_agg;''')

ScrapeTrades('Dynasty', False)
    