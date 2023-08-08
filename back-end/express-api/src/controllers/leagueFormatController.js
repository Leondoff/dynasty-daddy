import { CalculatePlayerConsistencyForSeason, CalculateWORPForSeason, FetchPointsPerWeekInSeason } from '../middleware';
import {
  GetPlayersInfoWithIds
} from '../repository';

export const GetLeagueFormatForLeague = async (req, res) => {
  try {
    const { season, settings, format } = req.body;
    const experienceOffset = (new Date()).getFullYear() - season;
    const playersInSystem = (await GetPlayersInfoWithIds(`AND (pi.experience >= ${experienceOffset} OR pi.position = 'DF')`)).rows;
    const pointsDict = await FetchPointsPerWeekInSeason(season, settings);
    const worp = await CalculateWORPForSeason(pointsDict, playersInSystem, format);
    const consistency = await CalculatePlayerConsistencyForSeason(
      pointsDict, playersInSystem, format);
    const leagueFormat = {};
    playersInSystem.forEach(p => {
      leagueFormat[p.name_id] = {
        w: worp[p.name_id],
        c: consistency[p.name_id]
      };
    });
    res.status(200).json(leagueFormat);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};
