import { HttpStatusCode } from 'axios';
import { AddLeaguesToUser, HandleUserRequest } from '../middleware';

/**
 * Log in to patreon user
 */
export const GetTokenForPatreonCodeEndpoint = async (req, res) => {
  const { code } = req.query;
  try {
    const userData = await HandleUserRequest(code);
    res.status(HttpStatusCode.Created).json(userData);
  } catch (err) {
    if (err.message === 'Didn\'t find Dynasty Daddy Tier.') {
      res.status(HttpStatusCode.Unauthorized).json(err.message);
    } else {
      res.status(HttpStatusCode.InternalServerError).json(err.stack);
    }
  }
};

/**
 * Update leagues for user
 */
export const AddLeaguesToUserEndpoint = async (req, res) => {
  const { leagues, id } = req.body;
  try {
    await AddLeaguesToUser(id, leagues);
    res.status(HttpStatusCode.Ok).json('success');
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};
