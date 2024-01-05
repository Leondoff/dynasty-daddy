import { HttpStatusCode } from 'axios';

const leagueView = '?view=mDraftDetail&view=mLiveScoring&view=mMatchupScore&view=mPendingTransactions&view=mPositionalRatings&view=mRoster&view=mSettings&view=mTeam&view=modular&view=mNav'

const transactionsView = '?scoringPeriodId=${week}&view=mTransactions2';

const axios = require('axios');

const sendESPNRequest = async (season, leagueId, espnS2, swid, views, res) => {
  const headers = {};
  if (espnS2 && swid) {
    // eslint-disable-next-line dot-notation
    headers['Cookie'] = `SWID=${swid}; espn_s2=${espnS2};`;
  }
  await axios.get(
    `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}${views}`,
    { headers }
  )
    .then((response) => {
      res.status(response.status).json(response.data);
    })
    .catch((err) => {
      res.status(err?.status || HttpStatusCode.InternalServerError).json(err);
    });
}

export const GetESPNLeagueEndpoint = async (req, res) => {
  const {
    season, leagueId, espnS2, swid
  } = req.body;
  return await sendESPNRequest(season, leagueId, espnS2, swid, leagueView, res); 
};

export const GetESPNTransactionsEndpoint = async (req, res) => {
  const {
    season, leagueId, espnS2, swid, week
  } = req.body;
  return await sendESPNRequest(season, leagueId, espnS2, swid, transactionsView.replace('${week}', week.toString()), res); 
}