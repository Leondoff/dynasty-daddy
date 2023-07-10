import Model from '../models/model';

const playersModel = new Model('player_grid');

export const GetPlayerForGrid = async (playerId) => {
  const data = await playersModel.selectQuery(`
  SELECT
    id,
    name,
    pos,
    start_year,
    end_year,
    teams,
    jersey_numbers,
    college,
    stats_json,
    awards_json,
    headshot_url
  from player_grid WHERE id = ${playerId};
`);
  return data.rows[0];
};

export const GetSearchPlayersInGrid = async (search) => {
  const query = `
    SELECT
      id,
      name,
      pos,
      start_year,
      end_year,
      teams,
      jersey_numbers,
      college,
      stats_json,
      awards_json,
      headshot_url
    FROM player_grid
    WHERE name ILIKE $1
    LIMIT 10;
  `;
  const formattedSearch = search.replace(/\u2018|\u2019/g, '\'');
  const searchString = `%${formattedSearch}%`;
  const values = [ searchString ];

  const { rows } = await playersModel.pool.query(query, values);
  return rows;
};

export const GetAllPlayersInGrid = async () => {
  const data = await playersModel.selectQuery(`
  SELECT
    id,
    name,
    pos,
    start_year,
    end_year,
    teams,
    jersey_numbers,
    college,
    stats_json,
    awards_json,
    headshot_url
  from player_grid;
`);
  return data.rows;
};
