DROP MATERIALIZED VIEW if EXISTS mat_vw_articles_trending;
DROP MATERIALIZED VIEW if EXISTS mat_vw_article_total_likes;

-- create total likes per article mat view
CREATE MATERIALIZED VIEW mat_vw_article_total_likes AS
SELECT
    a.article_id,
    COUNT(al.article_id) AS total_likes
FROM
    articles a
LEFT JOIN
    article_likes al ON a.article_id = al.article_id AND al.is_active = true
GROUP BY
    a.article_id;

CREATE UNIQUE INDEX mat_vw_article_total_likes_unique_index
    ON mat_vw_article_total_likes (article_id);

REFRESH MATERIALIZED VIEW mat_vw_article_total_likes;

-- create trending articles table
CREATE MATERIALIZED VIEW mat_vw_articles_trending AS
SELECT
    a.article_id,
    a.title,
    a.title_img,
    SUBSTRING(regexp_replace(regexp_replace(a.post, E'<br>', ' ', 'gi'), E'<[^>]+>', '', 'gi'), 1, 170) AS post,
    ARRAY_LENGTH(regexp_split_to_array(a.post, E'\\s+'), 1) AS word_count,
    a.keywords,
    a.linked_players,
    u.first_name,
    u.last_name,
    a.category,
    coalesce(atl.total_likes, 0) as total_likes,
    COALESCE(SUM(CASE WHEN al.is_active AND al.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 ELSE 0 END), 0) as trending_score,
    a.posted_at,
    ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(CASE WHEN al.is_active AND al.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 ELSE 0 END), 0) desc, coalesce(atl.total_likes, 0) desc) <= 3 AS is_trending
FROM
    articles a
INNER JOIN
    users u ON a.author_id = u.user_id
LEFT JOIN
    article_likes al ON a.article_id = al.article_id AND al.is_active = true
LEFT JOIN
    mat_vw_article_total_likes atl ON a.article_id = atl.article_id
where
	a.status = 'Public'
GROUP BY
    a.article_id, u.first_name, u.last_name, a.title, a.title_img, a.post, a.keywords, a.linked_players, a.category, a.status, a.posted_at, atl.total_likes
order by
	trending_score desc, total_likes desc; 

CREATE UNIQUE INDEX mat_vw_trending_unique_index
    ON mat_vw_articles_trending (article_id);

REFRESH MATERIALIZED VIEW mat_vw_articles_trending;
