/* eslint-disable prefer-destructuring */
import { FormatMFLLeagues } from '../models/mfl';

const axios = require('axios');

const sendMFLRequest = async (year, leagueId, baseUrl, mflUserId, callType, res) => {
  const headers = { 'User-Agent': 'DYNASTYDADDY' };
  if (mflUserId != null) {
    // eslint-disable-next-line dot-notation
    headers['Cookie'] = `MFL_USER_ID=${mflUserId};`;
  }
  await axios.get(
    `${baseUrl}/${year}/export?TYPE=${callType}&L=${leagueId}&APIKEY=&JSON=1`,
    { headers }
  )
    .then((response) => {
      res.status(response.status).json(response.data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

const sendMFLImportRequest = async (
  year, leagueId, baseUrl, mflUserId, callType, additionalParams, res
) => {
  const headers = { 'User-Agent': 'DYNASTYDADDY' };
  if (mflUserId != null) {
    // eslint-disable-next-line dot-notation
    headers['Cookie'] = `MFL_USER_ID=${mflUserId};`;
  }
  await axios.get(
    `${baseUrl}/${year}/import?TYPE=${callType}&L=${leagueId}${additionalParams}&APIKEY=&JSON=1`,
    { headers }
  )
    .then((response) => {
      res.status(response.status).json(response.data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

export const GetMFlLeagueEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'league', res);
};

export const GetMFlScheduleEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'schedule', res);
};

export const GetMFlRostersEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'rosters', res);
};

export const GetMFlTransactionsEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'transactions', res);
};

export const GetMFlLeagueStandingsEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'leagueStandings', res);
};

export const GetMFlFutureDraftPicksEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'futureDraftPicks', res);
};

export const GetMFlPlayoffBracketsEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'playoffBrackets', res);
};

export const GetMFlPlayersEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, null, 'players', res);
};

export const GetMFlDraftResultsEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'draftResults', res);
};

export const GetMFLLeaguesForUserEndpoint = async (req, res) => {
  try {
    let mflUserId = null;
    const headers = { 'User-Agent': 'DYNASTYDADDY' };
    const username = req.body.username;
    const password = req.body.password;
    const season = req.body.season;

    const response = await axios.post(`https://api.myfantasyleague.com/${season}/login?USERNAME=${username}&PASSWORD=${password}&XML=1`, { headers });
    const regex = /MFL_USER_ID="([^"]*)"/;
    const match = response.data.match(regex);

    if (!match || !match[1]) {
      return res.status(500).json('Unable to find MFL_USER_ID. Make sure your username & password are correct.');
    }

    mflUserId = match[1];
    headers.Cookie = `MFL_USER_ID=${mflUserId}}`;
    const leaguesResponse = await axios.get(`https://api.myfantasyleague.com/${season}/export?TYPE=myleagues&YEAR=${season}&FRANCHISE_NAMES=1&JSON=1`, {
      headers
    });

    const formattedLeagues = await FormatMFLLeagues(leaguesResponse.data.leagues);
    res.status(leaguesResponse.status).json({ leagues: formattedLeagues, mfl_user_id: mflUserId });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const PostMFlWaiverEndpoint = async (req, res) => {
  const {
    year, leagueId, url
  } = req.query;
  const dropPlayerId = req.body.DROP;
  const mflUserId = req.body.mflUserId;
  if (!mflUserId) {
    return res.status(400).json('MFL User Id not set. Try logging in again.');
  }
  return sendMFLImportRequest(year, leagueId, url, mflUserId, 'fcfsWaiver', `&DROP=${dropPlayerId}`, res);
};
