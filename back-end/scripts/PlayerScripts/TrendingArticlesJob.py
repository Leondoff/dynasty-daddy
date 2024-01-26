from DatabaseConnService import GetDatabaseConn

conn = GetDatabaseConn()
cursor = conn.cursor()

cursor.execute(
    '''REFRESH MATERIALIZED VIEW CONCURRENTLY mat_vw_article_total_likes;''')

cursor.execute(
    '''REFRESH MATERIALIZED VIEW CONCURRENTLY mat_vw_articles_trending;''')

conn.commit()
