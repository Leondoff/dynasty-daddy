/* eslint-disable consistent-return */
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
