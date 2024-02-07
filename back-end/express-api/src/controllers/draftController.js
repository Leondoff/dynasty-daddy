import { HttpStatusCode } from 'axios';
import { GetDraftADP, GetDraftADPDetails } from '../middleware';

export const GetDraftADPEndpoint = async (req, res) => {
  try {
    const adp = await GetDraftADP(req.body);
    res.status(HttpStatusCode.Ok).json(adp);
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};

export const GetDraftADPDetailsEndpoint = async (req, res) => {
  try {
    const adp = await GetDraftADPDetails(req.body);
    res.status(HttpStatusCode.Ok).json(adp);
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};
