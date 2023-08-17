/* eslint-disable max-len */
/* eslint-disable no-async-promise-executor */
import {
  standardDeviation, sum, mean, zScore, cumulativeStdNormalProbability
} from 'simple-statistics';
import {
  IDP_FLEX_POS,
  FLEX_POS,
  SUPER_FLEX_POS,
  FLEX_TYPES
} from './constants';

/**
 * Return positions strings that are to be processed
 * @param {*} format dict of positions
 */
export const getPositionsToProcess = async (format) => {
  const posList = [];
  Object.keys(format).forEach(pos => {
    if (format[pos] !== 0) {
      switch (pos) {
        case 'teamCount':
          break;
        case 'IDP_FLEX':
          posList.push(...IDP_FLEX_POS);
          posList.push('IDP_FLEX');
          break;
        case 'FLEX':
          posList.push(...FLEX_POS);
          posList.push('FLEX');
          break;
        case 'SUPER_FLEX':
          posList.push(...SUPER_FLEX_POS);
          posList.push('SUPER_FLEX');
          break;
        default:
          posList.push(pos);
      }
    }
  });
  return Array.from(new Set(posList));
};

/**
 * Get standard deviation for an entire team from the std dev of the players
 * @param {*} posGroupStdDev list of all starters and thier std dev
 */
export const CalculateTeamStdDev = async (posGroupStdDev) =>
  Number(posGroupStdDev.reduce((t, p) =>
    p + t, 0).toFixed(2));
// Number(Math.sqrt(posGroupStdDev.reduce((t, p) =>
//   p ** 2 + t, 0)).toFixed(2));

/**
 * Calculate the Avg team score and std dev
 * @param {*} players array of players in our system
 * @param {*} pointsDict dict of points for players by week
 * @param {*} format dict of league format
 */
export const CalculateAvgTeamScore = async (players, pointsDict, format) => {
  const weeklyAVGDict = {};
  const { teamCount } = format;
  const starterPosList = await getPositionsToProcess(format);
  const posList = (await starterPosList).filter(p =>
    !FLEX_TYPES.includes(p));
  const promises = Object.entries(pointsDict).map(async ([ week, weeklyPointsDict ]) => {
    const pointsPerPostionArray = [];
    const processedNameIds = [];
    const sortedPlayers = players.filter(p =>
      weeklyPointsDict[p.sleeper_id])
      .sort((a, b) =>
        weeklyPointsDict[b.sleeper_id].pts - weeklyPointsDict[a.sleeper_id].pts);

    starterPosList.forEach(pos => {
      const avgDepth = format[pos] * teamCount;
      let posPlayerList = [];
      switch (pos) {
        case 'SUPER_FLEX': {
          posPlayerList = sortedPlayers.filter(p =>
            !processedNameIds.includes(p.name_id) && SUPER_FLEX_POS.includes(p.position))
            .slice(0, avgDepth);
          break;
        }
        case 'FLEX': {
          posPlayerList = sortedPlayers.filter(p =>
            FLEX_POS.includes(p.position) && !processedNameIds.includes(p.name_id))
            .slice(0, avgDepth);
          break;
        }
        case 'IDP_FLEX': {
          posPlayerList = sortedPlayers.filter(p =>
            IDP_FLEX_POS.includes(p.position) && !processedNameIds.includes(p.name_id))
            .slice(0, avgDepth);
          break;
        }
        default:
          posPlayerList = sortedPlayers.filter(p =>
            p.position === pos && !processedNameIds.includes(p.name_id))
            .slice(0, avgDepth);
      }

      const pointsForStartersList = [];

      posPlayerList.forEach(player => {
        processedNameIds.push(player.name_id);
        // console.log(pos, player.name_id, weeklyPointsDict[Number(player.sleeper_id)]);
        pointsForStartersList.push(weeklyPointsDict[player.sleeper_id].pts);
      });
      pointsPerPostionArray[pos] = {
        avg: pointsForStartersList.length > 0
          ? Number(mean(pointsForStartersList).toFixed(2)) : 0,
        std: pointsForStartersList.length > 0
          ? Number(standardDeviation(pointsForStartersList).toFixed(2)) : 0,
      };
    });

    // Replacement level for each position
    const replacementLevelDict = {};
    posList.forEach(pos => {
      // const avgDepth = format[pos] * teamCount;
      const avgDepth = 1;
      const replacementPlayers = sortedPlayers.filter(p =>
        p.position === pos && !processedNameIds.includes(p.name_id))
        .slice(0, avgDepth);
      replacementLevelDict[pos] = replacementPlayers.length > 0
        ? mean(replacementPlayers.map(p =>
          weeklyPointsDict[p.sleeper_id].pts || 0)) : 0;
      // console.log(pos, avgDepth, replacementLevelDict[pos]);
    });

    // team averages based on line up
    const posScores = Object.values(pointsPerPostionArray).map(t =>
      t.avg);
    const startingLineUpStdDev = [];
    starterPosList.forEach(pos => {
      let count = 0;
      while (count < format[pos]) {
        startingLineUpStdDev.push(pointsPerPostionArray[pos].std);
        count += 1;
      }
    });

    return new Promise(async (resolve) => {
      const teamStdDev = await CalculateTeamStdDev(startingLineUpStdDev);

      // Resolve the Promise with the iteration result
      resolve({
        week: Number(week),
        posGroups: pointsPerPostionArray,
        total: Number(sum(posScores).toFixed(2)),
        stdDev: teamStdDev,
        repLev: replacementLevelDict
      });
    });
  });
  const results = await Promise.all(promises);

  // Combine the results into weeklyAVGDict
  results.forEach((result) => {
    weeklyAVGDict[result.week] = {
      posGroups: result.posGroups,
      total: result.total,
      stdDev: result.stdDev,
      repLevel: result.repLev
    };
  });
  return weeklyAVGDict;
};

/**
 * Using all calculations before, determine the win percent and WoRP for a player
 * @param {*} players array of players in system
 * @param {*} pointsDict weekly points for players
 * @param {*} teamPointDict weekly team points
 * @param {*} format league starter dict
 */
export const CalculatePercentAndWoRPForPlayers = async (players, pointsDict, teamPointDict, format) => {
  // // replacement level wins? Do i need this? full season
  // const rlPoints = {};
  // SUPER_FLEX_POS.forEach(pos => {
  //   const weeklyRepPoints = [];
  //   Object.entries(teamPointDict).map(async ([_, weeklyTeamPointDict]) => {
  //     weeklyRepPoints.push(weeklyTeamPointDict.repLevel[pos]);
  //   });
  //   rlPoints[pos] = mean(weeklyRepPoints);
  // });
  const posList = (await getPositionsToProcess(format)).filter(p =>
    !FLEX_TYPES.includes(p));
  // weekly WoRP calculation
  const replacementLevelWinPer = {};
  Object.entries(teamPointDict).map(async ([ week, weeklyTeamPointDict ]) => {
    replacementLevelWinPer[week] = {};
    posList.forEach(pos => {
      const posPointsPerWeek = weeklyTeamPointDict.posGroups[pos];
      const valueAddedTotal = weeklyTeamPointDict.total
        - posPointsPerWeek.avg + weeklyTeamPointDict.repLevel[pos];
      const repPlayerZ = zScore(
        valueAddedTotal,
        weeklyTeamPointDict.total,
        weeklyTeamPointDict.stdDev
      );
      replacementLevelWinPer[week][pos] = cumulativeStdNormalProbability(repPlayerZ);
    });
  });
  // console.log(replacementLevelWinPer)
  // calculate percent and WoRP for each player
  const playerWorpAndPercents = {};
  players.filter(p =>
    posList.includes(p.position)).forEach(p => {
    let weeklyWorp = 0;
    const winsPercentPerWeek = [];
    Object.entries(pointsDict).map(async ([ week, weeklyPointsDict ]) => {
      const posPointsPerWeek = teamPointDict[week].posGroups[p.position];
      const playerPointsPerWeek = weeklyPointsDict[p.sleeper_id]
        ? weeklyPointsDict[p.sleeper_id].pts : teamPointDict[week].repLevel[p.position];
      const valueAddedTotal = teamPointDict[week].total
          - posPointsPerWeek.avg + playerPointsPerWeek;
      const playerZ = zScore(
        valueAddedTotal,
        teamPointDict[week].total,
        teamPointDict[week].stdDev
      );
      winsPercentPerWeek.push(cumulativeStdNormalProbability(playerZ));
      weeklyWorp += cumulativeStdNormalProbability(playerZ)
          - replacementLevelWinPer[week][p.position];
      // console.log(week, ` Team {${teamPointDict[week].total}, ${teamPointDict[week].stdDev}}`, p.position, teamPointDict[week].posGroups[p.position], `Points: {${weeklyPointsDict[p.sleeper_id]}, ${valueAddedTotal}, ${cumulativeStdNormalProbability(playerZ)}}`, `Rep: {pts: ${teamPointDict[week].repLevel[p.position]}, win% ${replacementLevelWinPer[week][p.position]}}, WORP: {Weekly: ${cumulativeStdNormalProbability(playerZ) - replacementLevelWinPer[week][p.position]}, Total: ${weeklyWorp}}`);
    });
    const playerPercent = winsPercentPerWeek.length > 0
      ? mean(winsPercentPerWeek) : 0;
      // console.log(playerPercent);
    const weeks = Object.keys(pointsDict).length;
    playerWorpAndPercents[p.name_id] = {
      svw: playerPercent * weeks,
      worp: Math.round(weeklyWorp * 100) / 100,
      percent: playerPercent
    };
  });
  return playerWorpAndPercents;
};

export const CalculateWORPForSeason = async (pointsDict, playersInSystem, format) => {
  const avgPointsPerPos = await CalculateAvgTeamScore(playersInSystem, pointsDict, format);
  const playerWoRPAndPercent = await CalculatePercentAndWoRPForPlayers(playersInSystem, pointsDict, avgPointsPerPos, format);
  return playerWoRPAndPercent;
  // return playersInSystem.sort((a, b) =>
  //   playerWoRPAndPercent[b.name_id].worp - playerWoRPAndPercent[a.name_id].worp)
  //   .map((p, ind) => [p.name_id, ind, playerWoRPAndPercent[p.name_id]]);
};
