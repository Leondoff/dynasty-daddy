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

export const PersistGridResult = async (batchData) => {
  const placeholders = batchData.map((_, index) =>
    `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, 1, $${index * 4 + 4})`).join(', ');
  const values = batchData.flatMap(item =>
    [ item.playerId, item.cellNum, item.name, item.img ]);

  const query = `
    INSERT INTO grid_results (player_id, cellNum, name, guesses, img)
    VALUES ${placeholders}
    ON CONFLICT (player_id, cellNum)
    DO UPDATE SET guesses = grid_results.guesses + 1;
  `;

  const data = await playersModel.pool.query(query, values);
  return data.rows;
};
