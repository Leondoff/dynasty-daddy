import axios from 'axios';
import { AddLeaguesToUser, CreateNewUser, FindUserById } from '../middleware';
import { PATREON_CLIENT_ID, PATREON_CLIENT_SECRET, PATREON_REDIRECT_URL } from '../settings';

const AdminIds = ['53401676'];

export const GetTokenForPatreonCodeEndpoint = async (req, res) => {
  const { code } = req.query;

  try {
    // Step 1: Get the access token
    const tokenResponse = await axios.post(
      'https://www.patreon.com/api/oauth2/token',
      null,
      {
        params: {
          code,
          grant_type: 'authorization_code',
          client_id: PATREON_CLIENT_ID,
          client_secret: PATREON_CLIENT_SECRET,
          redirect_uri: PATREON_REDIRECT_URL,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Extract the access token from the response
    const accessToken = tokenResponse.data.access_token;
    console.log(tokenResponse.status);

    // Step 2: Use the access token to fetch user identity
    const identityResponse = await axios.get(
      'https://www.patreon.com/api/oauth2/v2/identity?include=memberships&fields%5Buser%5D=email,first_name,full_name,image_url,last_name,thumb_url,url,vanity,is_email_verified',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const userObj = identityResponse.data.data;
    const memberships = userObj.relationships.memberships.data;
    const userId = userObj.id;
    if ((memberships.length === 0 || !memberships.map(i =>
      i.title).includes('Dynasty Daddy Club'))
      && !AdminIds.includes(userId)) {
      throw Error('Didn\'t find Dynasty Daddy Tier.');
    }

    let userData = await FindUserById(userId);
    if (userData === undefined) {
      userData = await CreateNewUser(
        userId,
        userObj.attributes.first_name,
        userObj.attributes.last_name,
        userObj.attributes.image_url
      );
    }

    // Return the identity data as JSON
    res.status(identityResponse.status).json(userData);
  } catch (err) {
    console.log(err);
    if (err.message === 'Didn\'t find Dynasty Daddy Tier.') {
      res.status(409).json(err.message);
    } else {
      res.status(500).json(err.message);
    }
  }
};

export const AddLeaguesToUserEndpoint = async (req, res) => {
  try {
    const { leagues, id } = req.body;
    await AddLeaguesToUser(id, leagues);
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};
