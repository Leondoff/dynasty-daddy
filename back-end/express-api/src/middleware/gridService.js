/* eslint-disable consistent-return */
import { GetPlayerForGrid, GetAllPlayersInGrid } from '../repository/PlayerGridRepository';

export const ValidateGridSelection = async (playerId, categories) => {
  const player = await GetPlayerForGrid(playerId);
  let isValid = true;
  categories.forEach(category => {
    switch (category.type) {
      case 'college': {
        isValid = player.college === category.value;
        break;
      }
      default: {
        isValid = player.teams.includes(category.value);
      }
    }
    if (!isValid) {
      return { isValid };
    }
  });
  return { isValid, img: player.headshot_url };
};

export const FetchAllGridPlayers = async (search) =>
  GetAllPlayersInGrid(search);
