import Model from '../models/model';

const playersModel = new Model('player_grid');

export const GetPlayerForGrid = async (playerId) => {
  const data = await playersModel.selectQuery(`
  SELECT
    *
  from player_grid WHERE id = ${playerId};
`);
  return data.rows[0];
};

export const GetSearchPlayersInGrid = async (search) => {
  const searchEscaped = search.replace('\'', '\'\'');
  const data = await playersModel.selectQuery(`
  SELECT
    id,
    name,
    pos,
    start_year,
    end_year
  from player_grid WHERE name ILIKE '%${searchEscaped}%' LIMIT 10;
`);
  return data.rows;
};

export const GetAllPlayersInGrid = async () => {
  const data = await playersModel.selectQuery(`
  SELECT
    id,
    name,
    pos,
    start_year,
    end_year
  from player_grid;
`);
  return data.rows;
};
