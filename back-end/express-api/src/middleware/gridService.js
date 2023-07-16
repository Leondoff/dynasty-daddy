/* eslint-disable consistent-return */
import { GetCurrentResults, PersistGridResult } from '../repository/GridResultRepository';
import { GetAllHistoricalGridirons } from '../repository/HistoricalGridironsRepository';
import { GetSearchPlayersInGrid, GetAllPlayersInGrid } from '../repository/PlayerGridRepository';

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
  return id;
};
