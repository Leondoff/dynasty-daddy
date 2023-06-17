import express from 'express';
import {
  indexPage,
  GetCurrentPlayerValuesEndpoint,
  GetPlayerValueForMarketEndpoint,
  GetPrevPlayerValuesByDaysEndpoint,
  GetHistoricalPlayerValueByIdEndpoint,
  GetMFlDraftResultsEndpoint,
  GetMFlFutureDraftPicksEndpoint,
  GetMFlLeagueEndpoint,
  GetMFlLeagueStandingsEndpoint,
  GetMFlPlayersEndpoint,
  GetMFlPlayoffBracketsEndpoint,
  GetMFlRostersEndpoint,
  GetMFlScheduleEndpoint,
  GetMFlTransactionsEndpoint,
  GetFFDraftEndpoint,
  GetFFLeagueEndpoint,
  GetFFLeagueTransactionsEndpoint,
  GetFFRostersEndpoint,
  GetFFScheduleEndpoint,
  GetFFStandingsEndpoint,
  GetFFTeamDraftPicksEndpoint,
  GetFFTradesEndpoint,
  GetUserLeaguesEndpoint,
  GetConfigValuesEndpoint,
  GetPlayerDetailsEndpoint,
  GetPlayerPortfolioEndpoint,
  GetMFLLeaguesForUserEndpoint,
  PostMFlWaiverEndpoint,
} from '../controllers';

const indexRouter = express.Router();
indexRouter.get('/', indexPage);

// Dynasty Daddy Endpoints
indexRouter.get('/player/all/today', GetCurrentPlayerValuesEndpoint);
indexRouter.get('/player/all/market/:market', GetPlayerValueForMarketEndpoint);
indexRouter.get('/player/all/prev/:intervalDays', GetPrevPlayerValuesByDaysEndpoint);
indexRouter.get('/player/:id', GetHistoricalPlayerValueByIdEndpoint);
indexRouter.get('/player/details/:id', GetPlayerDetailsEndpoint);
indexRouter.post('/portfolio', GetPlayerPortfolioEndpoint);
indexRouter.get('/config/all', GetConfigValuesEndpoint);

// MFL Wrapper Endpoints
indexRouter.post('/mfl/league', GetMFlLeagueEndpoint);
indexRouter.post('/mfl/players', GetMFlPlayersEndpoint);
indexRouter.post('/mfl/transactions', GetMFlTransactionsEndpoint);
indexRouter.post('/mfl/futureDraftPicks', GetMFlFutureDraftPicksEndpoint);
indexRouter.post('/mfl/leagueStandings', GetMFlLeagueStandingsEndpoint);
indexRouter.post('/mfl/rosters', GetMFlRostersEndpoint);
indexRouter.post('/mfl/draftResults', GetMFlDraftResultsEndpoint);
indexRouter.post('/mfl/playoffBrackets', GetMFlPlayoffBracketsEndpoint);
indexRouter.post('/mfl/schedule', GetMFlScheduleEndpoint);
indexRouter.post('/mfl/leagues', GetMFLLeaguesForUserEndpoint);
indexRouter.post('/mfl/waiver', PostMFlWaiverEndpoint);

// Fleaflicker Wrapper Endpoints
indexRouter.get('/ff/league', GetFFLeagueEndpoint);
indexRouter.get('/ff/rosters', GetFFRostersEndpoint);
indexRouter.get('/ff/transactions', GetFFLeagueTransactionsEndpoint);
indexRouter.get('/ff/schedule', GetFFScheduleEndpoint);
indexRouter.get('/ff/leagueStandings', GetFFStandingsEndpoint);
indexRouter.get('/ff/draftResults', GetFFDraftEndpoint);
indexRouter.get('/ff/futureDraftPicks', GetFFTeamDraftPicksEndpoint);
indexRouter.get('/ff/trades', GetFFTradesEndpoint);
indexRouter.get('/ff/user', GetUserLeaguesEndpoint);

export default indexRouter;
