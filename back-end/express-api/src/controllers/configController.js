import { HttpStatusCode } from 'axios';
import { GetConfigTableData } from '../repository';

/**
 * fetch all config options for application
 */
export const GetConfigValuesEndpoint = async (req, res) => {
  try {
    const data = await GetConfigTableData(false);
    res.status(HttpStatusCode.Ok).json(data.rows);
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};
