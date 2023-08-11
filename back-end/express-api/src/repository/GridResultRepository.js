import Model from '../models/model';

const playersModel = new Model('grid_results');

export const GetCurrentResults = async (id) => {
  const data = await playersModel.selectQuery(`
  SELECT
    *
  from grid_results
  WHERE grid_id = ${id};
`);
  return data.rows;
};

export const PersistGridResult = async (batchData, id) => {
  const placeholders = batchData.map((_, index) =>
    `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, 1, $${index * 4 + 4}, ${id})`).join(', ');
  const values = batchData.flatMap(item =>
    [ item.playerId, item.cellNum, item.name, item.img]);

  const query = `
    INSERT INTO grid_results (player_id, cellNum, name, guesses, img, grid_id)
    VALUES ${placeholders}
    ON CONFLICT (player_id, cellNum, grid_id)
    DO UPDATE SET guesses = grid_results.guesses + 1;
  `;

  console.log(query, values, placeholders);

  const data = await playersModel.pool.query(query, values);
  return data.rows;
};
