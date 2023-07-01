import { ValidateGridSelection, FetchAllGridPlayers } from '../middleware/gridService';
import { GetAllPlayersInGrid } from '../repository/PlayerGridRepository';

export const ValidateGridSelectionEndpoint = async (req, res) => {
  try {
    const { playerId, categories } = req.body;
    const isValid = await ValidateGridSelection(playerId, categories);
    res.status(200).json(isValid);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};

export const FetchAllGridPlayersEndpoint = async (req, res) => {
  try {
    const searchValue = req.query.search;
    const allPlayers = await GetAllPlayersInGrid(searchValue);
    res.status(200).json(allPlayers);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};
