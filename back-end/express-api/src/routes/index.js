import express from 'express';
import {getCurrentPlayerValues, getHistoricalPlayerValueById, getPrevPlayerValues, indexPage, getPlayerValueForMarket} from '../controllers';
import {getConfigValues} from '../controllers/config';
import {
  getMFlDraftResults,
  getMFlFutureDraftPicks,
  getMFlLeague,
  getMFlLeagueStandings,
  getMFlPlayers, getMFlPlayoffBrackets, getMFlRosters, getMFlSchedule,
  getMFlTransactions
} from '../controllers/mfl_wrapper';

const indexRouter = express.Router();
indexRouter.get('/', indexPage);
indexRouter.get('/player/all/today', getCurrentPlayerValues);
indexRouter.get('/player/all/market/:market', getPlayerValueForMarket)
indexRouter.get('/player/all/prev/:intervalDays', getPrevPlayerValues);
indexRouter.get('/player/:id', getHistoricalPlayerValueById);
indexRouter.get('/config/all', getConfigValues);

// MFL wrapper
indexRouter.get('/mfl/league', getMFlLeague);
indexRouter.get('/mfl/players', getMFlPlayers);
indexRouter.get('/mfl/transactions', getMFlTransactions);
indexRouter.get('/mfl/futureDraftPicks', getMFlFutureDraftPicks);
indexRouter.get('/mfl/leagueStandings', getMFlLeagueStandings);
indexRouter.get('/mfl/rosters', getMFlRosters);
indexRouter.get('/mfl/draftResults', getMFlDraftResults);
indexRouter.get('/mfl/playoffBrackets', getMFlPlayoffBrackets);
indexRouter.get('/mfl/schedule', getMFlSchedule);

export default indexRouter;
