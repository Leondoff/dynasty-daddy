import Model from '../models/model';

const configModel = new Model('config');

/**
 * Fetch all rows in the config table
 */
export const GetConfigTableData = async () => {
  const data = await configModel.selectQuery('Select config_key, '
        + '       config_value '
        + 'from config;');
  return data;
};

export const IncrementGridGamesPlayed = async () => {
  const data = await configModel.pool.query(`UPDATE config 
    SET config_value = CAST(config_value AS INTEGER) + 1
    WHERE config_key = 'daily_grid_completed';`);
  return data;
};
