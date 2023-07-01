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

export const GetFFLeagueEndpoint = async (req, res) => {
  const { leagueId } = req.query;
  return sendFleaFlickerRequest(leagueId, '', 'FetchLeagueRules', res);
};

export const GetFFRostersEndpoint = async (req, res) => {
  const { leagueId, year } = req.query;
  return sendFleaFlickerRequest(leagueId, `&season=${year}`, 'FetchLeagueRosters', res);
};

export const GetFFStandingsEndpoint = async (req, res) => {
  const { leagueId, year } = req.query;
  return sendFleaFlickerRequest(leagueId, `&season=${year}`, 'FetchLeagueStandings', res);
};

export const GetFFScheduleEndpoint = async (req, res) => {
  const { leagueId, year, week } = req.query;
  return sendFleaFlickerRequest(leagueId, `&season=${year}&scoring_period=${week}`, 'FetchLeagueScoreboard', res);
};

export const GetFFLeagueTransactionsEndpoint = async (req, res) => {
  const { leagueId, offset } = req.query;
  return sendFleaFlickerRequest(leagueId, `&result_offset=${offset}`, 'FetchLeagueTransactions', res);
};

export const GetFFTeamDraftPicksEndpoint = async (req, res) => {
  const { leagueId, teamId } = req.query;
  return sendFleaFlickerRequest(leagueId, `&team_id=${teamId}`, 'FetchTeamPicks', res);
};

export const GetFFTradesEndpoint = async (req, res) => {
  const { leagueId, offset } = req.query;
  return sendFleaFlickerRequest(leagueId, `&result_offset=${offset}&filter=TRADES_COMPLETED`, 'FetchTrades', res);
};

export const GetFFDraftEndpoint = async (req, res) => {
  const { leagueId } = req.query;
  return sendFleaFlickerRequest(leagueId, '', 'FetchLeagueDraftBoard', res);
};

export const GetUserLeaguesEndpoint = async (req, res) => {
  const { email, year } = req.query;
  await axios.get(`https://www.fleaflicker.com/api/FetchUserLeagues?sport=NFL&email=${email}&season=${year}`)
    .then((response) => {
      res.status(response.status).json(response.data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};
