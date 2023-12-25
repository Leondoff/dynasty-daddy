import { HttpStatusCode } from 'axios';
import {
  AddLFPresetsToUser, AddLeaguesToUser, AddPRPresetsToUser, HandleUserRequest, UpdateUserProfile
} from '../middleware';

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

/**
 * Update leagues for user
 */
export const AddPRPresetsToUserEndpoint = async (req, res) => {
  const { presets, id } = req.body;
  try {
    await AddPRPresetsToUser(id, presets);
    res.status(HttpStatusCode.Ok).json('success');
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};

/**
 * Update leagues for user
 */
export const AddLFPresetsToUserEndpoint = async (req, res) => {
  const { presets, id } = req.body;
  try {
    await AddLFPresetsToUser(id, presets);
    res.status(HttpStatusCode.Ok).json('success');
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};

/**
 * Update leagues for user
 */
export const UpdateUserProfileEndpoint = async (req, res) => {
  const {
    id, firstName, lastName, description, imageUrl, twitterHandle
  } = req.body;
  try {
    await UpdateUserProfile(id, firstName, lastName, description, imageUrl, twitterHandle);
    res.status(HttpStatusCode.Ok).json('success');
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};
