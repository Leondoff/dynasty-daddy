import Model from '../models/model';

const playersModel = new Model('players_ids');

export const GetPlayerInSystem = async () => {
  const data = await playersModel.selectQuery(`
  SELECT
    *
  from player_ids;
`);
  return data;
};
