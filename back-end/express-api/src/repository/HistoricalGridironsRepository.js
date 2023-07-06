import Model from '../models/model';

const playersModel = new Model('historical_gridirons');

export const GetAllHistoricalGridirons = async () => {
  const data = await playersModel.selectQuery(`
  SELECT
    *
  from historical_gridirons LIMIT 20;
`);
  return data.rows;
};
