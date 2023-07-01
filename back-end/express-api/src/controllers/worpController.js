import { CalculateWORPForSeason } from '../middleware';

export const GetWORPForLeague = async (req, res) => {
  try {
    const { season, settings, format } = req.body;
    const worp = await CalculateWORPForSeason(season, settings, format);
    res.status(200).json(worp);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};
