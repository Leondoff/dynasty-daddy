import {
  ValidateGridSelection,
  SearchGridPlayers,
  FetchAllGridPlayers,
  FetchAllHistoricalGrids,
  UpdateGridResultsWithAnswer,
  FetchAllGridResults
} from '../middleware/gridService';

export const ValidateGridSelectionEndpoint = async (req, res) => {
  try {
    const { playerId, categories } = req.body;
    const isValid = await ValidateGridSelection(playerId, categories);
    res.status(200).json(isValid);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};

export const FetchSearchedPlayersEndpoint = async (req, res) => {
  try {
    const searchValue = req.query.search;
    const allPlayers = await SearchGridPlayers(searchValue);
    res.status(200).json(allPlayers);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};

export const FetchAllGridPlayersEndpoint = async (req, res) => {
  try {
    const allPlayers = await FetchAllGridPlayers();
    res.status(200).json(allPlayers);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};

export const FetchAllHistoricalGridsEndpoint = async (req, res) => {
  try {
    const allPlayers = await FetchAllHistoricalGrids();
    res.status(200).json(allPlayers);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};

export const FetchAllGridResultsEndpoint = async (req, res) => {
  try {
    const allPlayers = await FetchAllGridResults();
    res.status(200).json(allPlayers);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};

export const UpdateGridResultsEndpoint = async (req, res) => {
  try {
    const { playerList, id = -1 } = req.body;
    await UpdateGridResultsWithAnswer(playerList, id);
    res.sendStatus(200);
  } catch (err) {
    if (err.message === 'ERROR - INVALID ID') {
      res.sendStatus(400);
    } else {
      res.status(500).json(err.stack);
    }
  }
};
