/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-async-promise-executor */
import {
  standardDeviation, sum, mean, zScore, cumulativeStdNormalProbability
} from 'simple-statistics';

const SUPPORTED_STARTERS = [ 'QB', 'RB', 'WR', 'TE', 'FLEX', 'SUPER_FLEX', 'K', 'DF', 'LB', 'DB', 'DL', 'IDP_FLEX'];

const FLEX_POS = [ 'RB', 'WR', 'TE' ];

const IDP_FLEX_POS = [ 'LB', 'DB', 'DL' ];

const SUPER_FLEX_POS = [ 'QB', 'RB', 'WR', 'TE' ];

export const SUPPORTED_POS = ['QB', 'RB', 'WR', 'TE', 'LB', 'DB', 'DL', 'K', 'DF' ];

/**
 * Get standard deviation for an entire team from the std dev of the players
 * @param {*} posGroupStdDev list of all starters and thier std dev
 */
export const CalculateTeamStdDev = async (posGroupStdDev) =>
  Number(Math.sqrt(posGroupStdDev.reduce((t, p) =>
    p ** 2 + t, 0)).toFixed(2));

/**
 * Calculate the Avg team score and std dev
 * @param {*} players array of players in our system
 * @param {*} pointsDict dict of points for players by week
 * @param {*} format dict of league format
 */
export const CalculateAvgTeamScore = async (players, pointsDict, format) => {
  const weeklyAVGDict = {};
  const { teamCount } = format;
  const promises = Object.entries(pointsDict).map(async ([ week, weeklyPointsDict ]) => {
    const pointsPerPostionArray = [];
    const processedNameIds = [];
    const sortedPlayers = players.filter(p =>
      weeklyPointsDict[Number(p.sleeper_id)])
      .sort((a, b) =>
        weeklyPointsDict[Number(b.sleeper_id)].pts - weeklyPointsDict[Number(a.sleeper_id)].pts);

    SUPPORTED_STARTERS.forEach(pos => {
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
        pointsForStartersList.push(weeklyPointsDict[Number(player.sleeper_id)].pts);
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
    SUPPORTED_POS.forEach(pos => {
      const avgDepth = format[pos] * teamCount;
      const replacementPlayers = sortedPlayers.filter(p =>
        p.position === pos && !processedNameIds.includes(p.name_id))
        .slice(0, avgDepth);
      replacementLevelDict[pos] = replacementPlayers.length > 0
        ? mean(replacementPlayers.map(p =>
          weeklyPointsDict[Number(p.sleeper_id)].pts || 0)) : 0;
      // console.log(pos, avgDepth, replacementLevelDict[pos]);
    });

    // team averages based on line up
    const posScores = Object.values(pointsPerPostionArray).map(t =>
      t.avg);
    const startingLineUpStdDev = [];
    SUPPORTED_STARTERS.forEach(pos => {
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
 */
export const CalculatePercentAndWoRPForPlayers = async (players, pointsDict, teamPointDict) => {
  // replacement level wins? Do i need this? full season
  const rlPoints = {};
  SUPER_FLEX_POS.forEach(pos => {
    const weeklyRepPoints = [];
    Object.entries(teamPointDict).map(async ([_, weeklyTeamPointDict]) => {
      weeklyRepPoints.push(weeklyTeamPointDict.repLevel[pos]);
    });
    rlPoints[pos] = mean(weeklyRepPoints);
  });
  // console.log(rlPoints)
  const replacementLevelWins = {};
  SUPPORTED_POS.forEach(pos => {
    const repLevelPositionPoints = [];
    Object.entries(teamPointDict).map(async ([_, weeklyTeamPointDict]) => {
      const posPointsPerWeek = weeklyTeamPointDict.posGroups[pos];
      const valueAddedTotal = weeklyTeamPointDict.total
        - posPointsPerWeek.avg + rlPoints[pos];
      const playerZ = zScore(
        valueAddedTotal,
        weeklyTeamPointDict.total,
        weeklyTeamPointDict.stdDev
      );
      repLevelPositionPoints.push(cumulativeStdNormalProbability(playerZ));
    });
    replacementLevelWins[pos] = repLevelPositionPoints.length > 0
      ? mean(repLevelPositionPoints) : 0;
    // console.log(pos, replacementLevelWins[pos]);
  });
  // WEEKLY WORP TEST
  const replacementLevelWinPer = {};
  Object.entries(teamPointDict).map(async ([ week, weeklyTeamPointDict ]) => {
    replacementLevelWinPer[week] = {};
    SUPPORTED_POS.forEach(pos => {
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
  console.log(replacementLevelWinPer)
  // calculate percent and WoRP for each player
  const playerWorpAndPercents = {};
  players.forEach(p => {
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
      yearWorp: playerPercent * weeks - replacementLevelWins[p.position] * weeks,
      svw: playerPercent * weeks,
      worp: Math.round(weeklyWorp * 100) / 100,
      percent: playerPercent
    };
  });
  return playerWorpAndPercents;
};

export const CalculateWORPForSeason = async (pointsDict, playersInSystem, format) => {
  const avgPointsPerPos = await CalculateAvgTeamScore(playersInSystem, pointsDict, format);
  const playerWoRPAndPercent = await CalculatePercentAndWoRPForPlayers(playersInSystem, pointsDict, avgPointsPerPos);
  return playerWoRPAndPercent;
  // return playersInSystem.sort((a, b) =>
  //   playerWoRPAndPercent[b.name_id].worp - playerWoRPAndPercent[a.name_id].worp)
  //   .map((p, ind) => [p.name_id, ind, playerWoRPAndPercent[p.name_id]]);
};
