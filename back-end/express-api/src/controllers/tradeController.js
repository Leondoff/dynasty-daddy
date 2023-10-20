import { HttpStatusCode } from 'axios';
import { AddLeaguesToDatabase, FetchTradesFromDatabase, GetRecentTradeVolume } from '../middleware';

export const AddLeaguesToDatabaseEndpoint = async (req, res) => {
  try {
    const {
      leagues
    } = req.body;
    await AddLeaguesToDatabase(leagues);
    res.status(HttpStatusCode.Ok).json('success');
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};

export const GetTradesFromSearchEndpoint = async (req, res) => {
  try {
    const trades = await FetchTradesFromDatabase(req.body);
    res.status(HttpStatusCode.Ok).json(trades);
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};

export const GetRecentTradeVolumeEndpoint = async (req, res) => {
  try {
    const trades = await GetRecentTradeVolume();
    res.status(HttpStatusCode.Ok).json(trades);
  } catch (err) {
    res.status(HttpStatusCode.InternalServerError).json(err.stack);
  }
};
