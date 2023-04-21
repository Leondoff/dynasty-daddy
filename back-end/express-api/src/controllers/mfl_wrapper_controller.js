const axios = require('axios');

const sendMFLRequest = async (year, leagueId, mflUserId, callType, res) => {
  const headers = { 'User-Agent': 'DYNASTYDADDY' };
  if (mflUserId != null) {
    // eslint-disable-next-line dot-notation
    headers['Cookie'] = `MFL_USER_ID=${mflUserId};`;
  }
  await axios.get(`https://www46.myfantasyleague.com/${year}/export?TYPE=${callType}&L=${leagueId}&APIKEY=&JSON=1`,
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
  const { year, leagueId, user } = req.query;
  return sendMFLRequest(year, leagueId, user, 'league', res);
};

export const GetMFlScheduleEndpoint = async (req, res) => {
  const { year, leagueId, user } = req.query;
  return sendMFLRequest(year, leagueId, user, 'schedule', res);
};

export const GetMFlRostersEndpoint = async (req, res) => {
  const { year, leagueId, user } = req.query;
  return sendMFLRequest(year, leagueId, user, 'rosters', res);
};

export const GetMFlTransactionsEndpoint = async (req, res) => {
  const { year, leagueId, user } = req.query;
  return sendMFLRequest(year, leagueId, user, 'transactions', res);
};

export const GetMFlLeagueStandingsEndpoint = async (req, res) => {
  const { year, leagueId, user } = req.query;
  return sendMFLRequest(year, leagueId, user, 'leagueStandings', res);
};

export const GetMFlFutureDraftPicksEndpoint = async (req, res) => {
  const { year, leagueId, user } = req.query;
  return sendMFLRequest(year, leagueId, user, 'futureDraftPicks', res);
};

export const GetMFlPlayoffBracketsEndpoint = async (req, res) => {
  const { year, leagueId, user } = req.query;
  return sendMFLRequest(year, leagueId, user, 'playoffBrackets', res);
};

export const GetMFlPlayersEndpoint = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, null, 'players', res);
};

export const GetMFlDraftResultsEndpoint = async (req, res) => {
  const { year, leagueId, user } = req.query;
  return sendMFLRequest(year, leagueId, user, 'draftResults', res);
};

export const GetMFLLeaguesForUserEndpoint = async (req, res) => {
  let mflUserId = null;
  await axios.post('https://www.dynastyplanet.com/api/mfl/login', req.body)
    .then((response) => {
      const cookie = response.headers['set-cookie'];
      // eslint-disable-next-line prefer-destructuring
      mflUserId = cookie[0].split(';')[0].split('=')[1];
      return axios.get('https://www.dynastyplanet.com/api/mfl/leagues', {
        headers: {
          Cookie: cookie
        }
      });
    })
    .then((response) => {
      res.status(response.status).json({ leagues: response.data, mfl_user_id: mflUserId });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
