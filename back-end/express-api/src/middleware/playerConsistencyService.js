import { SUPPORTED_POS } from './worpService';

export const CalculateConsistency = async (pointsDict, playersInSystem, format) => {
  const consistencyDict = {};
  const { teamCount } = format;

  Object.entries(pointsDict).map(async ([ _, weeklyPointsDict ]) => {
    const sortedPlayers = playersInSystem.filter(p =>
      weeklyPointsDict[Number(p.sleeper_id)])
      .sort((a, b) =>
        weeklyPointsDict[Number(b.sleeper_id)] - weeklyPointsDict[Number(a.sleeper_id)]);

    SUPPORTED_POS.forEach(pos => {
      const highThreshold = (teamCount * format[pos]) / 2;
      const midThreshold = teamCount * format[pos] || 0;
      const lowThreshold = teamCount * (format[pos] || 0) + teamCount;

      const posPlayers = sortedPlayers.filter(p =>
        p.position === pos);

      posPlayers.forEach((p, ind) => {
        if (p.name_id in consistencyDict) {
          consistencyDict[p.name_id].week += 1;
          consistencyDict[p.name_id].spikeHigh += ind < highThreshold ? 1 : 0;
          consistencyDict[p.name_id].spikeMid += ind < midThreshold ? 1 : 0;
          consistencyDict[p.name_id].spikeLow += ind < lowThreshold ? 1 : 0;
        } else {
          consistencyDict[p.name_id] = {
            week: 1,
            spikeHigh: ind < highThreshold ? 1 : 0,
            spikeMid: ind < midThreshold ? 1 : 0,
            spikeLow: ind < lowThreshold ? 1 : 0,
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
