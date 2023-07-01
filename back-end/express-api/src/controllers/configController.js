import { GetConfigTableData } from '../repository/ConfigRepository';

/**
 * fetch all config options for application
 */
export const GetConfigValuesEndpoint = async (req, res) => {
  try {
    const data = await GetConfigTableData();
    res.status(200).json(data.rows);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};
