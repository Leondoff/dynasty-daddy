/* eslint-disable max-len */
import { HttpStatusCode } from 'axios';
import { WriteArticle } from '../middleware';

/**
 * Create a article post
 */
export const WriteArticleEnpoint = async (req, res) => {
  try {
    const {
      id,
      title,
      titleImg,
      postContent,
      keywords,
      linkedPlayers,
      category,
      status
    } = req.body;
    const { userId } = req.params;
    // Check if userId is not set
    if (!userId) {
      return res.status(HttpStatusCode.BadRequest).json('User ID is required.');
    }
    await WriteArticle(id, title, titleImg, postContent, keywords, linkedPlayers, userId, category, status);
    return res.status(HttpStatusCode.Ok).json('okay');
  } catch (err) {
    return res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};
