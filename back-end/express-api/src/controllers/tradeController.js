import { AddLeaguesToDatabase } from '../middleware/tradeService';

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
