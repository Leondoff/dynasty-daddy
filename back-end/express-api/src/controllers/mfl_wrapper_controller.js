const axios = require('axios');

const sendMFLRequest = async (year, leagueId, callType, res) => {
  await axios.get(`https://www46.myfantasyleague.com/${year}/export?TYPE=${callType}&L=${leagueId}&APIKEY=&JSON=1`,
    { headers: { 'User-Agent': 'DYNASTYDADDY' } }
  )
    .then((response) => {
      res.status(response.status).json(response.data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

export const GetMFlLeagueEndpoint = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'league', res);
};

export const GetMFlScheduleEndpoint = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'schedule', res);
};

export const GetMFlRostersEndpoint = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'rosters', res);
};

export const GetMFlTransactionsEndpoint = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'transactions', res);
};

export const GetMFlLeagueStandingsEndpoint = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'leagueStandings', res);
};

export const GetMFlFutureDraftPicksEndpoint = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'futureDraftPicks', res);
};

export const GetMFlPlayoffBracketsEndpoint = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'playoffBrackets', res);
};

export const GetMFlPlayersEndpoint = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'players', res);
};

export const GetMFlDraftResultsEndpoint = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'draftResults', res);
};

export const GetMFLLeaguesForUserEndpoint = async (req, res) => {
  await axios.post('https://www.dynastyplanet.com/api/mfl/login', req.body)
    .then((response) =>
      axios.get('https://www.dynastyplanet.com/api/mfl/leagues', {
        headers: {
          Cookie: response.headers['set-cookie']
        }
      }))
    .then((response) => {
      res.status(response.status).json(response.data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
