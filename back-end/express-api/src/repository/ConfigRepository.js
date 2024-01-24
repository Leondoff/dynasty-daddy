import Model from '../models/model';

const configModel = new Model('config');

/**
 * Fetch all rows in the config table
 */
export const GetConfigTableData = async (internalOnly) => {
  const data = await configModel.selectQuery('Select config_key, '
        + '       config_value '
        + 'from config '
        + `where is_internal_only = ${internalOnly};`);
  return data;
};

/**
 * Fetch single record from the config table
 */
export const GetSingleConfigValue = async (key) => {
  const data = await configModel.selectQuery('Select '
        + '       config_value '
        + 'from config '
        + `where config_key = '${key}';`);
  return data.rows[0].config_value;
};
