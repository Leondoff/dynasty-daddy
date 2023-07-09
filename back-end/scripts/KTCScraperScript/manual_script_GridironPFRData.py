import csv
import json
import psycopg2
import requests
import PlayerService
import re


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



# def ScrapePFR():
#     players = FetchAllPlayers()
#     for p in players:
        