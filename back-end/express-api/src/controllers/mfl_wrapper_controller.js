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

export const GetMFLLeagueEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'league', res);
};

export const GetMFLScheduleEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'schedule', res);
};

export const GetMFLRostersEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'rosters', res);
};

export const GetMFLTransactionsEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'transactions', res);
};

export const GetMFLLeagueStandingsEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'leagueStandings', res);
};

export const GetMFLFutureDraftPicksEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'futureDraftPicks', res);
};

export const GetMFLPlayoffBracketsEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'playoffBrackets', res);
};

export const GetMFLPlayersEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, null, 'players', res);
};

export const GetMFLLeagueRulesEndpoint = async (req, res) => {
  const {
    year, leagueId
  } = req.query;
  const {
    user, url
  } = req.body;
  return sendMFLRequest(year, leagueId, url, user, 'rules', res);
};

export const GetMFLDraftResultsEndpoint = async (req, res) => {
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

export const PostMFLWaiverEndpoint = async (req, res) => {
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
