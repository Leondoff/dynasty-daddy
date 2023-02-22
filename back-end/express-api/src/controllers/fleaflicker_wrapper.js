/* eslint-disable linebreak-style */
const axios = require('axios');

const sendFleaFlickerRequest = async (leagueId, metadata, callType, res) => {
  await axios.get(`https://www.fleaflicker.com/api/${callType}?sport=NFL&league_id=${leagueId}${metadata}`)
    .then((response) => {
      res.status(response.status).json(response.data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

export const getFFLeague = async (req, res) => {
  const { leagueId } = req.query;
  return sendFleaFlickerRequest(leagueId, '', 'FetchLeagueRules', res);
};

export const getFFRosters = async (req, res) => {
  const { leagueId, year } = req.query;
  return sendFleaFlickerRequest(leagueId, `&season=${year}`, 'FetchLeagueRosters', res);
};

export const getFFStandings = async (req, res) => {
  const { leagueId, year } = req.query;
  return sendFleaFlickerRequest(leagueId, `&season=${year}`, 'FetchLeagueStandings', res);
};

export const getFFSchedule = async (req, res) => {
  const { leagueId, year, week } = req.query;
  return sendFleaFlickerRequest(leagueId, `&season=${year}&scoring_period=${week}`, 'FetchLeagueScoreboard', res);
};

export const getFFLeagueTransactions = async (req, res) => {
  const { leagueId } = req.query;
  return sendFleaFlickerRequest(leagueId, '', 'FetchLeagueTransactions', res);
};

export const getFFTeamDraftPicks = async (req, res) => {
  const { leagueId, teamId } = req.query;
  return sendFleaFlickerRequest(leagueId, `&team_id=${teamId}`, 'FetchTeamPicks', res);
};

export const getFFTrades = async (req, res) => {
  const { leagueId } = req.query;
  return sendFleaFlickerRequest(leagueId, '&filter=TRADES_COMPLETED', 'FetchTrades', res);
};

export const getFFDraft = async (req, res) => {
  const { leagueId } = req.query;
  return sendFleaFlickerRequest(leagueId, '', 'FetchLeagueDraftBoard', res);
};

export const getUserLeagues = async (req, res) => {
  const { email, year } = req.query;
  await axios.get(`https://www.fleaflicker.com/api/FetchUserLeagues?sport=NFL&email=${email}&season=${year}`)
    .then((response) => {
      res.status(response.status).json(response.data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
