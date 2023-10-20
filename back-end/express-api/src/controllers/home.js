import { HttpStatusCode } from 'axios';
import { testEnvironmentVariable } from '../settings';

export const indexPage = (req, res) =>
  res.status(HttpStatusCode.Ok).json({ message: testEnvironmentVariable });
