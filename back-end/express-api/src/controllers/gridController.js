import { HttpStatusCode } from 'axios';
import {
  SearchGridPlayers,
  FetchAllHistoricalGrids,
  UpdateGridResultsWithAnswer,
  FetchAllGridResults,
  FetchEventLeaderboard,
  PersistEventGame
} from '../middleware';
import {
  GetSingleConfigValue
} from '../repository';

export const FetchSearchedPlayersEndpoint = async (req, res) => {
  try {
    const searchValue = req.query.search;
    const allPlayers = await SearchGridPlayers(searchValue);
    res.status(HttpStatusCode.Ok).json(allPlayers);
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};

export const FetchAllHistoricalGridsEndpoint = async (req, res) => {
  try {
    const allPlayers = await FetchAllHistoricalGrids();
    res.status(HttpStatusCode.Ok).json(allPlayers);
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};

export const FetchAllGridResultsEndpoint = async (req, res) => {
  try {
    const { gridId } = req.query;
    const allPlayers = await FetchAllGridResults(gridId);
    res.status(HttpStatusCode.Ok).json(allPlayers);
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};

export const UpdateGridResultsEndpoint = async (req, res) => {
  try {
    const { playerList, id = -1 } = req.body;
    await UpdateGridResultsWithAnswer(playerList, id);
    res.status(HttpStatusCode.Ok).json({ status: 'OK' });
  } catch (err) {
    if (err.message === 'ERROR - INVALID ID') {
      res.status(HttpStatusCode.BadRequest).json(
        { status: 'Error', message: 'Invalid Grid ID' }
      );
    } else {
      res.status(HttpStatusCode.Ok).json(err.stack);
    }
  }
};

export const GetEventLeaderboardEndpoint = async (req, res) => {
  try {
    const { eventId } = req.query;
    const leaderboard = await FetchEventLeaderboard(eventId);
    res.status(HttpStatusCode.Ok).json(leaderboard);
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};

export const SaveEventGameEndpoint = async (req, res) => {
  try {
    const {
      eventId, name, gameJson, eventCode
    } = req.body;
    const actualCode = await GetSingleConfigValue('event_code');
    if (eventCode !== actualCode) throw Error('Wrong event password');
    await PersistEventGame(eventId, name, gameJson);
    res.status(HttpStatusCode.Ok).json({ status: 'OK' });
  } catch (err) {
    if (err.message === 'Wrong event password') {
      res.status(HttpStatusCode.BadRequest).json(
        { status: 'Error', message: 'Wrong event password' }
      );
    } else {
      res.status(HttpStatusCode.InternalServerError).json(err.stack);
    }
  }
};
