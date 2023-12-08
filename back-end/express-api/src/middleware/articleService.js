/* eslint-disable max-len */
import { PersistArticle } from '../repository';

export const WriteArticle = async (id, title, titleImg, postContent, keywords, linkedPlayers, authorId, category, status) =>
  PersistArticle(id, title, titleImg, postContent, keywords, linkedPlayers, authorId, category, status);
