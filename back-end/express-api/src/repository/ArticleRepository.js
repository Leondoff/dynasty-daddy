/* eslint-disable max-len */
import Model from '../models/model';

const articlesModel = new Model('articles');

/**
 * Fetch all rows in the config table
 */
export const PersistArticle = async (id, title, titleImg, postContent, keywords, linkedPlayers, authorId, category, status) => {
  let query;

  if (id) {
    // Update existing post
    query = `
        UPDATE articles
        SET title = $2, title_img = $3, post = $4, keywords = $5, linked_players = $6, author_id = $7, category = $8, status = $9
        WHERE id = $1
      `;

    await articlesModel.pool.query(query, [ id, title, titleImg, postContent, keywords, linkedPlayers, authorId, category, status ]);
  } else {
    // Insert new post
    query = `
        INSERT INTO articles (title, title_img, post, keywords, linked_players, author_id, category, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

    await articlesModel.pool.query(query, [ title, titleImg, postContent, keywords, linkedPlayers, authorId, category, status ]);
  }

  return { success: true };
};
