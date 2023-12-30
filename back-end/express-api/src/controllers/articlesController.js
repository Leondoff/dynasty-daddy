/* eslint-disable max-len */
import { HttpStatusCode } from 'axios';
import {
  WriteArticle, GetArticles, LikeArticle, GetFullArticle, GetArticlesByUser, DeleteArticleAsUser
} from '../middleware';

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
    const post = await WriteArticle(id, title, titleImg, postContent, keywords, linkedPlayers, userId, category, status);
    return res.status(HttpStatusCode.Ok).json(post);
  } catch (err) {
    return res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};

/**
 * Get Articles
 */
export const GetArticlesEndpoints = async (req, res) => {
  try {
    const {
      category,
      search,
      userId,
      page,
      pageLength
    } = req.body;
    const articles = await GetArticles(category, search, userId || '', page, pageLength);
    return res.status(HttpStatusCode.Ok).json(articles);
  } catch (err) {
    return res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};

/**
 * Get Articles for user
 */
export const GetArticlesForUserEndpoints = async (req, res) => {
  try {
    const { userId } = req.params;
    const articles = await GetArticlesByUser(userId);
    return res.status(HttpStatusCode.Ok).json(articles);
  } catch (err) {
    return res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};

export const LikeArticleEndpoint = async (req, res) => {
  try {
    const {
      articleId,
      userId,
      isActive
    } = req.body;
    const result = await LikeArticle(articleId, userId, isActive);
    return res.status(HttpStatusCode.Ok).json(result);
  } catch (err) {
    return res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};

export const GetFullArticleEndpoint = async (req, res) => {
  try {
    const { articleId } = req.params;
    const result = await GetFullArticle(articleId);
    return res.status(HttpStatusCode.Ok).json(result);
  } catch (err) {
    return res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};

export const DeleteArticleEndpoint = async (req, res) => {
  try {
    const {
      userId,
      articleId
    } = req.body;
    await DeleteArticleAsUser(userId, articleId);
    return res.status(HttpStatusCode.Ok).json(articleId);
  } catch (err) {
    return res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};
