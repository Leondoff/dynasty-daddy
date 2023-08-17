/* eslint-disable no-restricted-globals */

export const CalculateOpportunityPerWeek = async (pos, stats) => {
  if (!stats) return 0;
  switch (pos) {
    case 'QB':
      return (stats.pass_att || 0) + (stats.rush_att || 0);
    case 'LB':
    case 'DB':
    case 'DL':
    case 'DF':
      return stats.def_snp || 0;
    case 'K':
      return (stats.xpa || 0) + (stats.fga || 0);
    default:
      return (stats.rec_tgt || 0) + (stats.rush_att || 0);
  }
};

export const CalculateSnapPercentPerWeek = async (pos, stats) => {
  if (!stats) return 0;
  switch (pos) {
    case 'LB':
    case 'DB':
    case 'DL':
    case 'DF':
      return (stats.def_snp || 0) / (stats.tm_def_snp || 1);
    case 'K':
      return (stats.snp || 0) + (stats.tm_st_snp || 1);
    default:
      return (stats.snp || 0) / (stats.tm_off_snp || 1);
  }
};

export const CalculateConsistency = async (pointsDict, playersInSystem, format, posList) => {
  const consistencyDict = {};
  const { teamCount } = format;
  Object.entries(pointsDict).map(async ([ _, weeklyPointsDict ]) => {
    const sortedPlayers = playersInSystem.filter(p => {
      const sleeperId = isNaN(Number(p.sleeper_id)) ? p.sleeper_id : Number(p.sleeper_id);
      return weeklyPointsDict[sleeperId] !== undefined;
    }).sort((a, b) => {
      const sleeperIdA = isNaN(Number(a.sleeper_id)) ? a.sleeper_id : Number(a.sleeper_id);
      const sleeperIdB = isNaN(Number(b.sleeper_id)) ? b.sleeper_id : Number(b.sleeper_id);
      const pointsA = weeklyPointsDict[sleeperIdA].pts || 0;
      const pointsB = weeklyPointsDict[sleeperIdB].pts || 0;
      return pointsB - pointsA;
    });
    posList.forEach(pos => {
      const highThreshold = (teamCount * format[pos]) / 2;
      const midThreshold = teamCount * format[pos] || 0;
      const lowThreshold = teamCount * (format[pos] || 0) + teamCount;

      const posPlayers = sortedPlayers.filter(p =>
        p.position === pos);

      posPlayers.forEach(async (p, ind) => {
        const sleeperId = isNaN(Number(p.sleeper_id)) ? p.sleeper_id : Number(p.sleeper_id);
        const playerInfo = weeklyPointsDict[sleeperId];
        const opp = await CalculateOpportunityPerWeek(pos, playerInfo.gamelog);
        let tmSnp = 0;
        let snp = 0;
        switch (pos) {
          case 'LB':
          case 'DB':
          case 'DL':
            snp = playerInfo.gamelog.def_snp || 0;
            tmSnp = playerInfo.gamelog.tm_def_snp || 0;
            break;
          case 'DF':
            snp = playerInfo.gamelog.tm_snp || 0;
            tmSnp = playerInfo.gamelog.tm_snp || 0;
            break;
          case 'K':
            snp = playerInfo.gamelog.snp || 0;
            tmSnp = playerInfo.gamelog.tm_st_snp || 0;
            break;
          default:
            snp = playerInfo.gamelog.off_snp || 0;
            tmSnp = playerInfo.gamelog.tm_off_snp || 0;
            break;
        }
        if (p.name_id in consistencyDict) {
          consistencyDict[p.name_id].week += 1;
          consistencyDict[p.name_id].spikeHigh += ind < highThreshold ? 1 : 0;
          consistencyDict[p.name_id].spikeMid += ind < midThreshold ? 1 : 0;
          consistencyDict[p.name_id].spikeLow += ind < lowThreshold ? 1 : 0;
          consistencyDict[p.name_id].opp += opp;
          consistencyDict[p.name_id].snp += snp;
          consistencyDict[p.name_id].tmSnp += tmSnp;
          consistencyDict[p.name_id].pts += playerInfo.pts;
        } else {
          consistencyDict[p.name_id] = {
            week: 1,
            spikeHigh: ind < highThreshold ? 1 : 0,
            spikeMid: ind < midThreshold ? 1 : 0,
            spikeLow: ind < lowThreshold ? 1 : 0,
            opp,
            pts: playerInfo.pts,
            tmSnp,
            snp,
          };
        }
      });
    });
  });

  return consistencyDict;
};

export const CalculatePlayerConsistencyForSeason = async (pointsDict, playersInSystem, format, posList) => {
  const updatedPlayerDict = await CalculateConsistency(pointsDict, playersInSystem, format, posList);
  return updatedPlayerDict;
};
