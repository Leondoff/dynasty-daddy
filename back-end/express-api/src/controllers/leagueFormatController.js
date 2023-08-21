import {
  CalculatePlayerConsistencyForSeason,
  CalculateWORPForSeason,
  FetchPointsPerWeekInSeason,
  getPositionsToProcess,
  FLEX_TYPES
} from '../middleware';
import {
  GetPlayersInfoWithIds
} from '../repository';

export const GetLeagueFormatForLeague = async (req, res) => {
  try {
    const {
      season, startWeek, endWeek, settings, format
    } = req.body;
    const experienceOffset = (new Date()).getFullYear() - season;
    const posFilterList = (await getPositionsToProcess(format))
      .filter(p =>
        !FLEX_TYPES.includes(p));
    const posListString = posFilterList.map(pos =>
      `'${pos}'`);
    const playersInSystem = (await GetPlayersInfoWithIds(`AND ((pi.experience >= ${experienceOffset} AND pi.position IN (${posListString.join(', ')})) OR pi.position = 'DF')`)).rows;
    const pointsDict = await FetchPointsPerWeekInSeason(season, settings, startWeek, endWeek);
    const worp = await CalculateWORPForSeason(pointsDict, playersInSystem, format);
    const consistency = await CalculatePlayerConsistencyForSeason(
      pointsDict,
      playersInSystem,
      format,
      posFilterList
    );
    const leagueFormat = {};
    playersInSystem.forEach(p => {
      if (worp[p.name_id] && consistency[p.name_id]) {
        leagueFormat[p.name_id] = {
          w: worp[p.name_id],
          c: consistency[p.name_id]
        };
      }
    });
    res.status(200).json(leagueFormat);
  } catch (err) {
    res.status(500).json(err.stack);
  }
};
