import { AddLeaguesToDatabase, FetchTradesFromDatabase, GetRecentTradeVolume } from '../middleware';

export const AddLeaguesToDatabaseEndpoint = async (req, res) => {
  try {
    const {
      leagues
    } = req.body;
    await AddLeaguesToDatabase(leagues);
    res.status(200).json('success');
  } catch (err) {
    res.status(500).json(err.stack);
  }
};

export const GetTradesFromSearchEndpoint = async (req, res) => {
  try {
    const trades = await FetchTradesFromDatabase(req.body);
    res.status(200).json(trades);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};

export const GetRecentTradeVolumeEndpoint = async (req, res) => {
  try {
    const trades = await GetRecentTradeVolume();
    res.status(200).json(trades);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};
