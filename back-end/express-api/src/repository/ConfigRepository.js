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
