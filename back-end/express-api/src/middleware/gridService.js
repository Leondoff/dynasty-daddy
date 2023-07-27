/* eslint-disable consistent-return */
import {
  GetSearchPlayersInGrid,
  GetAllPlayersInGrid,
  GetAllHistoricalGridirons,
  GetCurrentResults,
  PersistGridResult,
  IncrementGridGamesPlayed
} from '../repository';

export const SearchGridPlayers = async (search) =>
  GetSearchPlayersInGrid(search);

export const FetchAllGridPlayers = async () =>
  GetAllPlayersInGrid();

export const FetchAllHistoricalGrids = async () =>
  GetAllHistoricalGridirons();

export const FetchAllGridResults = async () =>
  GetCurrentResults();

export const UpdateGridResultsWithAnswer = async (playerList, id) => {
  const validPlayerList = playerList.filter(p =>
    p.playerId != null);
  if (validPlayerList.length < 1) return id;
  const currentDate = new Date();
  const targetDate = new Date('2023-07-01');

  // Calculate the difference in milliseconds
  const timeDiff = currentDate - targetDate;

  // Convert milliseconds to days
  const daysSinceJuly1st = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

  if (daysSinceJuly1st !== id) {
    throw new Error('ERROR - INVALID ID');
  }

  await PersistGridResult(validPlayerList);
  await IncrementGridGamesPlayed();
  return id;
};
