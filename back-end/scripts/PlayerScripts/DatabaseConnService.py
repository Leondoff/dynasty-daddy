import os
import psycopg2

def GetDatabaseConn():
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
    return conn.cursor()
