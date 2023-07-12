/* eslint-disable consistent-return */
import { GetCurrentResults, PersistGridResult } from '../repository/GridResultRepository';
import { GetAllHistoricalGridirons } from '../repository/HistoricalGridironsRepository';
import { GetPlayerForGrid, GetSearchPlayersInGrid, GetAllPlayersInGrid } from '../repository/PlayerGridRepository';

export const ValidateGridSelection = async (playerId, categories) => {
  const player = await GetPlayerForGrid(playerId);
  let isValid = true;
  categories.forEach(category => {
    switch (category.type) {
      case 'jersey_number': {
        isValid = player.jersey_numbers.includes(category.value) && isValid;
        break;
      }
      case 'college': {
        isValid = player.college === category.value && isValid;
        break;
      }
      case 'award': {
        isValid = JSON.stringify(player.awards_json) !== JSON.stringify({}) && player.awards_json[category.value] !== '' && isValid;
        break;
      }
      case 'stat': {
        isValid = player.stats_json[category.value] && isValid;
        break;
      }
      default: {
        isValid = player.teams.includes(category.value) && isValid;
      }
    }
  });
  if (!isValid) {
    return { isValid };
  }
  return { isValid, img: player.headshot_url };
};

export const SearchGridPlayers = async (search) =>
  GetSearchPlayersInGrid(search);

export const FetchAllGridPlayers = async () =>
  GetAllPlayersInGrid();

export const FetchAllHistoricalGrids = async () =>
  GetAllHistoricalGridirons();

export const FetchAllGridResults = async () =>
  GetCurrentResults();

export const UpdateGridResultsWithAnswer = async (playerList, id) => {
  const currentDate = new Date();
  const targetDate = new Date('2023-07-01');

  // Calculate the difference in milliseconds
  const timeDiff = currentDate - targetDate;

  // Convert milliseconds to days
  const daysSinceJuly1st = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
  if (daysSinceJuly1st === id) {
    await PersistGridResult(playerList);
  }
  return [];
};
