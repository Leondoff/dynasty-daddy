/* eslint-disable import/named */
/* eslint-disable max-len */
import {
  PersistArticle, FetchArticles, PersistLike, FetchFullArticle, FetchArticlesForUser, DeleteArticle
} from '../repository';

export const WriteArticle = async (id, title, titleImg, postContent, keywords, linkedPlayers, authorId, category, status) => 
  PersistArticle(id, title, titleImg, postContent, keywords, linkedPlayers, authorId, category, status);

export const GetArticles = async (category, search, userId, page, pageLength) =>
  FetchArticles(category, search, userId, page, pageLength);

export const LikeArticle = async (articleId, userId, isActive) =>
  PersistLike(articleId, userId, isActive);

export const GetFullArticle = async (articleId) =>
  FetchFullArticle(articleId);

export const GetArticlesByUser = async (userId) =>
  FetchArticlesForUser(userId);

export const DeleteArticleAsUser = async (userId, articleId) =>
  DeleteArticle(userId, articleId);
