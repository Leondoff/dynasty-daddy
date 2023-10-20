import { HttpStatusCode } from 'axios';
import {
  SearchGridPlayers,
  FetchAllHistoricalGrids,
  UpdateGridResultsWithAnswer,
  FetchAllGridResults
} from '../middleware/gridService';

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
    res.sendStatus(HttpStatusCode.Ok);
  } catch (err) {
    if (err.message === 'ERROR - INVALID ID') {
      res.sendStatus(HttpStatusCode.BadRequest);
    } else {
      res.status(HttpStatusCode.Ok).json(err.stack);
    }
  }
};
