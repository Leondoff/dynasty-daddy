import { SUPPORTED_POS } from './worpService';

export const CalculateOpportunityPerWeek = async (pos, stats) => {
  if (!stats) return 0;
  switch (pos) {
    case 'QB':
      return (stats.pass_att || 0) + (stats.rush_att || 0);
    case 'LB':
    case 'DB':
    case 'DL':
      return stats.def_snp || 0;
    case 'K':
      return stats.xpa || 0;
    case 'DF':
      return 0;
    default:
      return (stats.rec_tgt || 0) + (stats.rush_att || 0);
  }
};

export const CalculateConsistency = async (pointsDict, playersInSystem, format) => {
  const consistencyDict = {};
  const { teamCount } = format;
  Object.entries(pointsDict).map(async ([ _, weeklyPointsDict ]) => {
    const sortedPlayers = playersInSystem.filter(p =>
      weeklyPointsDict[Number(p.sleeper_id)])
      .sort((a, b) =>
        weeklyPointsDict[Number(b.sleeper_id)].pts - weeklyPointsDict[Number(a.sleeper_id)].pts);

    SUPPORTED_POS.forEach(pos => {
      const highThreshold = (teamCount * format[pos]) / 2;
      const midThreshold = teamCount * format[pos] || 0;
      const lowThreshold = teamCount * (format[pos] || 0) + teamCount;

      const posPlayers = sortedPlayers.filter(p =>
        p.position === pos);

      posPlayers.forEach(async (p, ind) => {
        const playerInfo = weeklyPointsDict[Number(p.sleeper_id)];
        const opp = await CalculateOpportunityPerWeek(
          pos, playerInfo.gamelog);
        if (p.name_id in consistencyDict) {
          consistencyDict[p.name_id].week += 1;
          consistencyDict[p.name_id].spikeHigh += ind < highThreshold ? 1 : 0;
          consistencyDict[p.name_id].spikeMid += ind < midThreshold ? 1 : 0;
          consistencyDict[p.name_id].spikeLow += ind < lowThreshold ? 1 : 0;
          consistencyDict[p.name_id].opp += opp;
          consistencyDict[p.name_id].pts += playerInfo.pts;
        } else {
          consistencyDict[p.name_id] = {
            week: 1,
            spikeHigh: ind < highThreshold ? 1 : 0,
            spikeMid: ind < midThreshold ? 1 : 0,
            spikeLow: ind < lowThreshold ? 1 : 0,
            opp,
            pts: playerInfo.pts
          };
        }
      });
    });
  });

  return consistencyDict;
};

export const CalculatePlayerConsistencyForSeason = async (pointsDict, playersInSystem, format) => {
  const updatedPlayerDict = await CalculateConsistency(pointsDict, playersInSystem, format);
  return updatedPlayerDict;
};
