import Model from '../models/model';

const playersModel = new Model('players_gamelogs');

/**
 * Returns current player values from the database
 */
export const GetGamelogsForSeason = async (season) => {
  const data = await playersModel.selectQuery(`
  SELECT
    *
  from player_gamelogs
  where season = ${season};
`);
  return data;
};
