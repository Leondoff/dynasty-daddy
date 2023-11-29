/* eslint-disable no-plusplus */
import axios from 'axios';
import { GetUserById, PersistNewUser, UpdateUserLFPresets, UpdateUserLeagues, UpdateUserPRPresets } from '../repository';
import { DB_HOST, PATREON_CLIENT_ID, PATREON_CLIENT_SECRET, PATREON_REDIRECT_URL, PATREON_TIER_ID } from '../settings';

const AdminIds = ['53401676', '71505590'];

/**
 * Removes any non alpha-numeric, whitespace, or () in string
 * @param {*} inputString string to format
 */
const escapeString = async (inputString) =>
  inputString.replace(/[^a-zA-Z0-9() ]/g, '');

/**
 * Create and Fetch user data when logging in
 * @param {*} code Oauth2 Code for user
 */
export const HandleUserRequest = async (code) => {
  // local debugging log into Jeremy without auth
  if (DB_HOST == 'localhost') {
    return await GetUserById('53401676');
  }

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

  // Step 2: Use the access token to fetch user identity
  const identityResponse = await axios.get(
    'https://www.patreon.com/api/oauth2/v2/identity?include=memberships.campaign&fields%5Buser%5D=email,first_name,full_name,image_url,last_name,thumb_url,url,vanity,is_email_verified&fields%5Bmember%5D=currently_entitled_amount_cents,lifetime_support_cents,campaign_lifetime_support_cents,last_charge_status,patron_status,last_charge_date,pledge_relationship_start,pledge_cadence&fields%5Bcampaign%5D=pledge_url',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const userObj = identityResponse.data.data;
  const memberships = identityResponse.data.included;
  const userId = userObj.id;
  const ddMembership = memberships?.find(p =>
    p.relationships?.campaign?.data?.id === PATREON_TIER_ID);
  if ((!ddMembership || !ddMembership?.attributes?.currently_entitled_amount_cents
    || (ddMembership?.attributes?.patron_status !== 'active_patron'
      && ddMembership?.attributes?.currently_entitled_amount_cents === 0))
    && !AdminIds.includes(userId)) {
    throw Error('Didn\'t find Dynasty Daddy Tier.');
  }

  let userData = await GetUserById(userId);
  if (userData === undefined) {
    userData = await PersistNewUser(
      userId,
      userObj?.attributes?.first_name,
      userObj?.attributes?.last_name,
      userObj?.attributes?.image_url
    );
  }

  return userData;
}

/**
 * Set leagues for user
 * @param {*} id user id to update
 * @param {*} leagues league array to set
 */
export const AddLeaguesToUser = async (id, leagues) => {
  for (let i = 0; i < leagues.length; i++) {
    const league = leagues[i];
    const updatedName = await escapeString(league.name);
    league.name = updatedName;
  }
  await UpdateUserLeagues(id, leagues);
};

/**
 * Sets PR presets to user
 * @param {*} id user id
 * @param {*} presets power rankings presets
 */
export const AddPRPresetsToUser = async (id, presets) => {
  await UpdateUserPRPresets(id, presets); 
}

/**
 * Sets League Format to user
 * @param {*} id user id
 * @param {*} presets league format presets
 */
export const AddLFPresetsToUser = async (id, presets) => {
  await UpdateUserLFPresets(id, presets);
}
