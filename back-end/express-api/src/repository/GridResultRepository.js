import Model from '../models/model';

const playersModel = new Model('grid_results');

export const GetCurrentResults = async () => {
  const data = await playersModel.selectQuery(`
  SELECT
    *
  from grid_results;
`);
  return data.rows;
};

export const PersistGridResult = async (playerId, cellNum, name) => {
  const data = await playersModel.selectQuery(`
  INSERT INTO grid_results (player_id, cellNum, name, guesses)
    VALUES (${playerId}, ${cellNum}, '${name}', 1)
    ON CONFLICT (player_id, cellNum)
    DO UPDATE SET guesses = grid_results.guesses + 1;
`);
  return data.rows;
};
