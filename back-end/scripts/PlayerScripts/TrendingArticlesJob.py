from DatabaseConnService import GetDatabaseConn

cursor = GetDatabaseConn()

cursor.execute(
    '''REFRESH MATERIALIZED VIEW CONCURRENTLY mat_vw_article_total_likes;''')

cursor.execute(
    '''REFRESH MATERIALIZED VIEW CONCURRENTLY mat_vw_articles_trending;''')

cursor.commit()
