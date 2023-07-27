import csv
import json
import psycopg2
import requests
import PlayerService
import re
from BeautifulSoupService import setUpSoup

def FetchAllPlayers():
    conn = psycopg2.connect(
        database="dynasty_daddy", user='postgres', password='postgres', host='localhost', port='5432'
    )

    # Setting auto commit false
    conn.autocommit = True

    playerStatement = '''select name, id, pfr_id
                from player_grid'''
    cursor = conn.cursor()
    cursor.execute(playerStatement)
    return cursor.fetchall()



def ScrapePFR():
    players = FetchAllPlayers()
    # for p in players:
    #   pfr_id = p[2]
    pfr_id = 'BradTo00'
    charSelect = pfr_id[:1]
    soup = setUpSoup(f'https://www.pro-football-reference.com/players/{charSelect}/{pfr_id}.htm')
    num = soup.find('div', 'uni_holder')
    print(num)
    if num:
        print(pfr_id)
    bling = soup.find_all("ul", {"id": "bling"})
    # print(bling)

ScrapePFR()
        