const axios = require('axios');

const sendMFLRequest = async (year, leagueId, callType, res) => {
  await axios.get(`https://www46.myfantasyleague.com/${year}/export?TYPE=${callType}&L=${leagueId}&APIKEY=&JSON=1`)
    .then((response) => {
      res.status(response.status).json(response.data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
}

export const getMFlLeague = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'league', res);
};

export const getMFlSchedule = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'schedule', res);
};

export const getMFlRosters = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'rosters', res);
};

export const getMFlTransactions = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'transactions', res);
};

export const getMFlLeagueStandings = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'leagueStandings', res);
};

export const getMFlFutureDraftPicks = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'futureDraftPicks', res);
};

export const getMFlPlayoffBrackets = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'playoffBrackets', res);
};

export const getMFlPlayers = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'players', res);
};

export const getMFlDraftResults = async (req, res) => {
  const { year, leagueId } = req.query;
  return sendMFLRequest(year, leagueId, 'draftResults', res);
};
