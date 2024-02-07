
import datetime
import json
import os
import time
from sleeper_wrapper import Players
import requests
from datetime import datetime
from Constants import SLEEPER_BASE_URL
from DatabaseConnService import GetDatabaseConn
import psycopg2

def PersistLeagueDrafts(conn, bulk_data):
    cursor = conn.cursor()
    if len(bulk_data) > 0:
        # SQL query for bulk insert/update
        insert_query = """
            INSERT INTO league_drafts (draft_id, status, season, player_type, draft_type, rounds, round_reversal, started_at, ended_at, league_id, is_idp, auction_budget)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (draft_id, season, platform) DO UPDATE
            SET status = excluded.status,
                player_type = excluded.player_type,
                draft_type = excluded.draft_type,
                rounds = excluded.rounds,
                started_at = excluded.started_at,
                ended_at = excluded.ended_at,
                round_reversal = excluded.round_reversal,
                is_idp = excluded.is_idp,
                auction_budget = excluded.auction_budget;
        """

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

def FormatDraftResponse(draft):
    draftId = draft.get('draft_id')
    status = draft.get('status')
    season = draft.get('season')
    start_time = datetime.utcfromtimestamp(draft.get('start_time') / 1000.0) if draft.get('start_time') != None else None 
    end_time = datetime.utcfromtimestamp(draft.get('last_picked') / 1000.0) if draft.get('last_picked') != None else None
    type = draft.get('type')
    league_id = draft.get('league_id')
    is_idp = draft.get('metadata').get('scoring_type') == 'idp' if draft.get('metadata').get('scoring_type') != None else None
    settings = draft.get('settings')
    if settings:
        round_reversal = settings.get('reversal_round')
        player_type = settings.get('player_type') if settings.get('player_type') != None else 0
        rounds = settings.get('rounds')
        budget = settings.get('budget') if settings.get('budget') != None else None
        return (draftId, status, season, player_type, type, rounds, round_reversal, start_time, end_time, league_id, is_idp, budget)
    else:
        print("Skipping draft due to missing data: ", draftId)
        return None

def FormatDraftPick(pick, draftId, budget):
    playerId = pick.get('player_id')
    pickNo = pick.get('pick_no')
    round = pick.get('round')
    amount = pick.get('metadata').get('amount') if budget != None else None
    ratio = int(amount) / int(budget) if budget != None else None
    return (playerId, pickNo, round, draftId, amount, ratio)

    
def ScrapeLeaguesForDrafts(conn, leagues):
    bulk_data = []
    iter = 0
    interval = round(len(leagues) / 100)
    print("Start Processing League Drafts")
    for league in leagues:
        try:
            league_data = requests.get(SLEEPER_BASE_URL + league[0] + '/drafts').json()
            if league_data != None:
                for draft in league_data:
                    draft = FormatDraftResponse(draft)
                    if draft != None:
                        bulk_data.append(draft)
            iter += 1
            if iter % interval == 0:
                print(f"{round((iter/len(leagues))*100)}% Processed")
        except Exception as e:
            print(f"error for league - {league[0]}: {e}")
    PersistLeagueDrafts(conn, bulk_data)


    
def ScrapeDraftPicks(conn):
    cursor = conn.cursor()
    
    query = """
        SELECT *
        FROM league_drafts
        WHERE status != 'complete';
    """
    cursor.execute(query, ())
    drafts = cursor.fetchall()
    
    # update non-complete drafts
    bulk_drafts = []
    iter = 0
    interval = round(len(drafts) / 100) if round(len(drafts) / 100) > 0 else 1
    for dbDraft in drafts:
        try:
            draft_data = requests.get('https://api.sleeper.app/v1/draft/' + dbDraft[0]).json()
            if draft_data != None:
                draft = FormatDraftResponse(draft_data)
                if draft != None:
                    bulk_drafts.append(draft)
            iter += 1
            if iter % interval == 0:
                print(f"{round((iter/len(drafts))*100)}% Processed")
        except Exception as e:
            print(f"error for draft - {dbDraft[0]}: {e}")

    PersistLeagueDrafts(conn, bulk_drafts)
    print('Drafts Updated! Now Processing Picks...')
    
    query = """
        SELECT draft_id, season, draft_type, player_type, auction_budget
        FROM league_drafts
        WHERE status = 'complete' AND is_scraped IS FALSE;
    """
    cursor.execute(query, ())
    drafts = cursor.fetchall()
    
    # API calls to sleeper
    sleeperData = Players().get_all_players()
    iter = 0
    interval = round(len(drafts) / 100) if round(len(drafts) / 100) > 0 else 1
    for dbDraft in drafts:
        player_type = dbDraft[3]
        season = dbDraft[1]
        draftType = dbDraft[2]
        draftId = dbDraft[0]
        auctionBudget = dbDraft[4]
        draftPick = 1
        try:
            picks_data = requests.get('https://api.sleeper.app/v1/draft/' + draftId + '/picks').json()
            picks_bulk = []
            print(dbDraft)
            if picks_data is not None:  # Corrected variable name
                for pick_data in picks_data:
                    pick = FormatDraftPick(pick_data, draftId, auctionBudget if draftType == 'auction' else None)
                    if player_type == 2 and sleeperData[pick[0]]['position'] == 'K':
                        pick = list(pick)
                        pick[0] = str(season) + '.' + str(draftPick)
                        pick = tuple(pick)
                        draftPick += 1
                    picks_bulk.append(pick)

                if picks_bulk:  # Check if picks_bulk is not empty
                    insert_query = """
                        INSERT INTO league_draft_picks (player_id, pick_no, round, draft_id, auction_amount, budget_ratio)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """
                    cursor.executemany(insert_query, picks_bulk)

            update_query = """
                UPDATE league_drafts
                SET is_scraped = True
                WHERE draft_id = %s
            """
            cursor.execute(update_query, (dbDraft[0],))
            iter += 1
            if iter % interval == 0:
                print(f"{round((iter/len(drafts))*100)}% Processed")
        except Exception as e:
            print(f"error for draft - {dbDraft[0]}: {e}")

    # update table count metrics in config table
    updateTradeCount = '''UPDATE config
        SET config_value = (SELECT COUNT(*) FROM league_drafts WHERE is_scraped = true)
        WHERE config_key = 'draft_count';
        '''

    cursor.execute(updateTradeCount)

conn = GetDatabaseConn()
cursor = conn.cursor()
query = """
        SELECT *
        FROM league_info
        WHERE
        DATE_PART('day', CURRENT_DATE - created_at) <= 1;
    """
cursor.execute(query, ())
 
leagues = cursor.fetchall()
ScrapeLeaguesForDrafts(conn, leagues)

ScrapeDraftPicks(conn)
