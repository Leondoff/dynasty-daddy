import Model from '../models/model';

const playersModel = new Model('players_ids');

export const GetPlayerForGrid = async (playerId) => {
  const data = await playersModel.selectQuery(`
  SELECT
    *
  from player_grid WHERE id = ${playerId};
`);
  return data.rows[0];
};

export const GetAllPlayersInGrid = async (search) => {
  const data = await playersModel.selectQuery(`
  SELECT
    id,
    name,
    pos
  from player_grid WHERE name ILIKE '%${search}%' LIMIT 10;
`);
  return data.rows;
};
