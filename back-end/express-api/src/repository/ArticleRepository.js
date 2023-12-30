/* eslint-disable max-len */
import Model from '../models/model';

const articlesModel = new Model('articles');
const articleLikesModel = new Model('article_likes');

/**
 * Fetch all rows in the config table
 */
export const PersistArticle = async (id, title, titleImg, postContent, keywords, linkedPlayers, authorId, category, status) => {
  let query;
  let article;

  if (id) {
    query = `
      UPDATE articles
      SET title = $2, title_img = $3, post = $4, keywords = $5, linked_players = $6, author_id = $7, category = $8, status = $9,
          posted_at = CASE WHEN $9::article_status = 'Public' AND posted_at IS NULL THEN NOW() ELSE posted_at END
      WHERE article_id = $1
      RETURNING article_id
    `;

    article = await articlesModel.pool.query(query, [id, title, titleImg, postContent, keywords, linkedPlayers, authorId, category, status]);
  } else {
    query = `
      INSERT INTO articles (title, title_img, post, keywords, linked_players, author_id, category, status, posted_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CASE WHEN $8::article_status = 'Public' THEN NOW() ELSE NULL END)
      RETURNING article_id
    `;

    article = await articlesModel.pool.query(query, [title, titleImg, postContent, keywords, linkedPlayers, authorId, category, status]);
  }

  await articlesModel.pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mat_vw_articles_trending;')

  return article.rows[0]?.article_id;
};

/**
 * Fetch articles with search options
 */
export const FetchArticles = async (category, search, userId, page, pageLength) => {

  // Calculate the offset to paginate results
  const offset = (page - 1) * pageLength;

  const query = `
  SELECT
      a.article_id,
      a.title,
      a.title_img,
      a.post,
      a.word_count,      
      a.keywords,
      a.linked_players,
      a.first_name,
      a.last_name,
      a.category,
      a.posted_at,
      a.total_likes,
      a.is_trending,
      CASE WHEN $5 != '' THEN al.is_active ELSE false END AS has_liked
  FROM
      mat_vw_articles_trending a
  LEFT JOIN
      article_likes al ON a.article_id = al.article_id AND al.user_id = $5
  WHERE
      ($1 = '' OR $1 = 'Trending' OR $1 = 'Latest' OR a.category = $1::article_category)
      AND (
        a.title ILIKE $2
      OR a.first_name ILIKE $2
      OR a.last_name ILIKE $2
      OR EXISTS (
          SELECT 1
          FROM unnest(a.keywords) AS kw
          WHERE kw ILIKE $2
      )
      OR EXISTS (
          SELECT 1
          FROM unnest(a.linked_players) AS lp
          WHERE lp ILIKE $2
      )
    )
  ORDER BY
    CASE WHEN $1 = 'Latest' THEN a.posted_at END DESC
  LIMIT $3
  OFFSET $4;
    `;

  const formattedSearch = search.replace(/[^a-zA-Z0-9\s]/g, '');
  const searchString = `%${formattedSearch}%`;

  const res = await articlesModel.pool.query(query, [category, searchString, pageLength, offset, userId]);
  return res.rows;
}

export const PersistLike = async (articleId, userId, isActive) => {

  const query = `
    INSERT INTO article_likes (article_id, user_id, is_active)
    VALUES ($1, $2, true)
    ON CONFLICT (article_id, user_id)
    DO UPDATE SET is_active = 
    CASE
        WHEN $3::boolean IS NULL THEN NOT article_likes.is_active
        ELSE $3::boolean
    END
    RETURNING is_active;
  `;

  const res = await articleLikesModel.pool.query(query, [articleId, userId, isActive]);
  return res.rows[0]?.is_active;
}

export const FetchFullArticle = async (articleId) => {

  const query = `
    SELECT 
      a.article_id,
      a.title,
      a.title_img,
      a.post,
      a.keywords,
      a.linked_players,
      a.category,
      a.status,
      a.posted_at,
      u.first_name,
      u.last_name,
      u.image_url,
      u.twitter_handle,
      u.description,
      coalesce(ma.word_count, 0) as word_count,
      coalesce(atl.total_likes, 0) as total_likes
    FROM articles a
    INNER JOIN
      users u ON a.author_id = u.user_id
    LEFT JOIN
      mat_vw_articles_trending ma ON ma.article_id = a.article_id 
    LEFT JOIN
      mat_vw_article_total_likes atl ON a.article_id = atl.article_id
    WHERE
      a.article_id = $1
  `;
  const res = await articlesModel.pool.query(query, [articleId]);
  return res.rows[0];
}

/**
 * Fetch articles with search options
 */
export const FetchArticlesForUser = async (userId) => {

  const query = `
  SELECT
      a.article_id,
      a.title,
      a.keywords,
      a.category,
      a.status,
      coalesce(atl.total_likes, 0) as total_likes,
      a.posted_at,
      a.updated_at
  FROM
      articles a
  LEFT JOIN
      mat_vw_article_total_likes atl ON a.article_id = atl.article_id
  WHERE
      a.author_id = $1 and a.status != 'Deleted'
  ORDER BY
    a.updated_at DESC;
  `;

  const res = await articlesModel.pool.query(query, [userId]);
  return res.rows;
}

/**
 * Fetch articles with search options
 */
export const DeleteArticle = async (userId, articleId) => {

  const query = `
    UPDATE articles
    SET status = 'Deleted'
    WHERE article_id = $2 AND author_id = $1;
    `;

  const res = await articlesModel.pool.query(query, [userId, articleId]);
  return res.rows;
}

