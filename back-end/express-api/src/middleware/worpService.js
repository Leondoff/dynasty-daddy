/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-async-promise-executor */
import {
  standardDeviation, sum, mean, zScore, cumulativeStdNormalProbability
} from 'simple-statistics';
import {
  GetGamelogsForSeason
} from '../repository/PlayerGamelogsRepository';
import {
  GetPlayersInfoWithIds
} from '../repository/PlayerInfoRepository';

const SUPPORTED_POS = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'SUPER_FLEX'];

const FLEX_POS = ['RB', 'WR', 'TE'];

const SUPER_FLEX_POS = ['QB', 'RB', 'WR', 'TE'];

/**
 * Calculate points from an individual game log based on settings
 * @param {*} gamelog gamelog to process
 * @param {*} settings scoring settings to reference
 */
export const CalculatePointsFromGamelog = (gamelog, settings) => {
  let weeklyScore = 0;
  weeklyScore += gamelog.fum * settings.fum || 0;
  weeklyScore += gamelog.fum_lost * settings.fumLost || 0;
  weeklyScore += gamelog.pass_2pt * settings.pass2pt || 0;
  weeklyScore += gamelog.pass_int * settings.passInt || 0;
  weeklyScore += gamelog.pass_td * settings.passTd || 0;
  weeklyScore += gamelog.pass_td_40p * settings.pass40YdPTd || 0;
  weeklyScore += gamelog.pass_int_td * settings.passIntTd || 0;
  weeklyScore += gamelog.pass_yd * settings.passYd || 0;
  weeklyScore += gamelog.pass_att * settings.passAtt || 0;
  weeklyScore += gamelog.pass_cmp * settings.passCmp || 0;
  weeklyScore += gamelog.pass_cmp_40p * settings.passCmp40YdP || 0;
  weeklyScore += gamelog.pass_fd * settings.passFD || 0;
  weeklyScore += gamelog.pass_inc * settings.passInc || 0;
  weeklyScore += gamelog.pass_sack * settings.passSack || 0;
  weeklyScore += gamelog.rec * settings.rec || 0;
  weeklyScore += gamelog.rec_2pt * settings.rec2pt || 0;
  weeklyScore += gamelog.rec_td * settings.recTd || 0;
  weeklyScore += gamelog.rec_yd * settings.recYd || 0;
  weeklyScore += gamelog.rec_fd * settings.recFD || 0;
  weeklyScore += gamelog.rec_40p * settings.rec40YdP || 0;
  weeklyScore += gamelog.rec_td_40p * settings.rec40YdPTd || 0;
  weeklyScore += gamelog.rec_0_4 * settings.rec_0_4 || 0;
  weeklyScore += gamelog.rec_5_9 * settings.rec_5_9 || 0;
  weeklyScore += gamelog.rec_10_19 * settings.rec_10_19 || 0;
  weeklyScore += gamelog.rec_20_29 * settings.rec_20_29 || 0;
  weeklyScore += gamelog.rec_30_39 * settings.rec_30_39 || 0;
  weeklyScore += gamelog.rush_2pt * settings.rush2pt || 0;
  weeklyScore += gamelog.rush_td * settings.rushTd || 0;
  weeklyScore += gamelog.rush_yd * settings.rushYd || 0;
  weeklyScore += gamelog.rush_att * settings.rushAtt || 0;
  weeklyScore += gamelog.rush_fd * settings.rushFD || 0;
  weeklyScore += gamelog.rush_40p * settings.rush40YdP || 0;
  weeklyScore += gamelog.rush_td_40p * settings.rush40YdPTd || 0;
  weeklyScore += gamelog.bonus_pass_cmp_25 * settings.bonusPassCmp25 || 0;
  weeklyScore += gamelog.bonus_pass_yd_300 * settings.bonusPassYd300 || 0;
  weeklyScore += gamelog.bonus_pass_yd_400 * settings.bonusPassYd400 || 0;
  weeklyScore += gamelog.bonus_rec_rb * settings.bonusRecRB || 0;
  weeklyScore += gamelog.bonus_rec_te * settings.bonusRecTE || 0;
  weeklyScore += gamelog.bonus_rec_wr * settings.bonusRecWR || 0;
  weeklyScore += gamelog.bonus_rec_yd_100 * settings.bonusRecYd100 || 0;
  weeklyScore += gamelog.bonus_rec_yd_200 * settings.bonusRecYd200 || 0;
  weeklyScore += gamelog.bonus_rush_att_20 * settings.bonusRushAtt20 || 0;
  weeklyScore += gamelog.bonus_rush_rec_yd_100 * settings.bonusRushRecYd100 || 0;
  weeklyScore += gamelog.bonus_rush_rec_yd_200 * settings.bonusRushRecYd200 || 0;
  weeklyScore += gamelog.bonus_rush_yd_100 * settings.bonusRushYd100 || 0;
  weeklyScore += gamelog.bonus_rush_yd_200 * settings.bonusRushYd200 || 0;
  weeklyScore += gamelog.idp_blk_kick * settings.idpBlkKick || 0;
  weeklyScore += gamelog.idp_def_td * settings.idpDefTD || 0;
  weeklyScore += gamelog.idp_ff * settings.idpFF || 0;
  weeklyScore += gamelog.idp_fum_rec * settings.idpFumRec || 0;
  weeklyScore += gamelog.idp_fum_ret_yd * settings.idpFumRetYd || 0;
  weeklyScore += gamelog.idp_int * settings.idpInt || 0;
  weeklyScore += gamelog.idp_int_ret_yd * settings.idpIntRetYd || 0;
  weeklyScore += gamelog.idp_pass_def * settings.idpPassDef || 0;
  weeklyScore += gamelog.idp_qb_hit * settings.idpQBHit || 0;
  weeklyScore += gamelog.idp_sack * settings.idpSack || 0;
  weeklyScore += gamelog.idp_safe * settings.idpSafety || 0;
  weeklyScore += gamelog.idp_tkl * settings.idpTkl || 0;
  weeklyScore += gamelog.idp_tkl_ast * settings.idpTklAst || 0;
  weeklyScore += gamelog.idp_tkl_loss * settings.idpTklLoss || 0;
  weeklyScore += gamelog.idp_tkl_solo * settings.idpTklSolo || 0;
  weeklyScore += gamelog.def_st_ff * settings.defStFF || 0;
  weeklyScore += gamelog.def_st_fum_rec * settings.defStFumRec || 0;
  weeklyScore += gamelog.def_st_td * settings.defStTd || 0;
  weeklyScore += gamelog.def_td * settings.defTd || 0;
  weeklyScore += gamelog.sack * settings.sack || 0;
  weeklyScore += gamelog.safe * settings.safety || 0;
  weeklyScore += gamelog.blk_ick * settings.blkKick || 0;
  weeklyScore += gamelog.int * settings.int || 0;
  weeklyScore += gamelog.pts_allowed_0 * settings.ptsAllowed_0 || 0;
  weeklyScore += gamelog.pts_allowed_1_6 * settings.ptsAllowed_1_6 || 0;
  weeklyScore += gamelog.pts_allowed_7_13 * settings.ptsAllowed_7_13 || 0;
  weeklyScore += gamelog.pts_allowed_14_20 * settings.ptsAllowed_14_20 || 0;
  weeklyScore += gamelog.pts_allowed_21_27 * settings.ptsAllowed_21_27 || 0;
  weeklyScore += gamelog.pts_allowed_28_34 * settings.ptsAllowed_28_34 || 0;
  weeklyScore += gamelog.pts_allowed_35p * settings.ptsAllowed_35p || 0;
  weeklyScore += gamelog.st_ff * settings.stFF || 0;
  weeklyScore += gamelog.st_td * settings.stTd || 0;
  weeklyScore += gamelog.st_fum_rec * settings.stFumRec || 0;
  weeklyScore += gamelog.pr_td * settings.prTd || 0;
  weeklyScore += gamelog.kr_td * settings.krTd || 0;
  weeklyScore += gamelog.fgm_0_19 * settings.fgm_0_19 || 0;
  weeklyScore += gamelog.fgm_20_29 * settings.fgm_20_29 || 0;
  weeklyScore += gamelog.fgm_30_39 * settings.fgm_30_39 || 0;
  weeklyScore += gamelog.fgm_40_49 * settings.fgm_40_49 || 0;
  weeklyScore += gamelog.fgm_50p * settings.fgm_50p || 0;
  weeklyScore += gamelog.fgm * settings.fgmiss || 0;
  return weeklyScore;
};

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
  const promises = Object.entries(pointsDict).map(async ([week, weeklyPointsDict]) => {
    const pointsPerPostionArray = [];
    const processedNameIds = [];
    const sortedPlayers = players.filter(p =>
      weeklyPointsDict[Number(p.sleeper_id)])
      .sort((a, b) =>
        weeklyPointsDict[Number(b.sleeper_id)] - weeklyPointsDict[Number(a.sleeper_id)]);

    SUPPORTED_POS.forEach(pos => {
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
        default:
          posPlayerList = sortedPlayers.filter(p =>
            p.position === pos && !processedNameIds.includes(p.name_id))
            .slice(0, avgDepth);
      }

      const pointsForStartersList = [];

      posPlayerList.forEach(player => {
        processedNameIds.push(player.name_id);
        console.log(pos, player.name_id, weeklyPointsDict[Number(player.sleeper_id)]);
        pointsForStartersList.push(weeklyPointsDict[Number(player.sleeper_id)]);
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
    SUPER_FLEX_POS.forEach(pos => {
      const avgDepth = format[pos] * teamCount;
      const replacementPlayers = sortedPlayers.filter(p =>
        p.position === pos && !processedNameIds.includes(p.name_id))
        .slice(0, avgDepth);
      replacementLevelDict[pos] = replacementPlayers.length > 0
        ? mean(replacementPlayers.map(p =>
          weeklyPointsDict[Number(p.sleeper_id)] || 0)) : 0;
      // console.log(pos, avgDepth, replacementLevelDict[pos]);
    });

    // team averages based on line up
    const posScores = Object.values(pointsPerPostionArray).map(t =>
      t.avg);
    const startingLineUpStdDev = [];
    SUPPORTED_POS.forEach(pos => {
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

  // calculate season long replacement level for positions
  const allWeekRL = {};
  results.forEach(res => {
    SUPER_FLEX_POS.forEach(pos => {
      if (!allWeekRL[pos]) {
        allWeekRL[pos] = [];
      }
      allWeekRL[pos].push(res.repLev[pos]);
    });
  });
  const repLevelPlayersForSeason = {};
  SUPER_FLEX_POS.forEach(pos => {
    repLevelPlayersForSeason[pos] = allWeekRL[pos].length > 0
      ? Number(mean(allWeekRL[pos]).toFixed(2)) : 0;
  });

  // Combine the results into weeklyAVGDict
  results.forEach((result) => {
    weeklyAVGDict[result.week] = {
      posGroups: result.posGroups,
      total: result.total,
      stdDev: result.stdDev,
      repLevel: repLevelPlayersForSeason
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
  // replacement level wins? Do i need this?
  const rlPoints = {};
  SUPER_FLEX_POS.forEach(pos => {
    const weeklyRepPoints = [];
    Object.entries(teamPointDict).map(async ([_, weeklyTeamPointDict]) => {
      weeklyRepPoints.push(weeklyTeamPointDict.repLevel[pos]);
    });
    rlPoints[pos] = mean(weeklyRepPoints);
  });
  console.log(rlPoints)
  const replacementLevelWins = {};
  SUPER_FLEX_POS.forEach(pos => {
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
    console.log(pos, replacementLevelWins[pos]);
  });

  // calculate percent and WoRP for each player
  const playerWorpAndPercents = {};
  players.filter(p => p.name_id == 'alvinkamararb').forEach(p => {
    const winsPercentPerWeek = [];
    Object.entries(pointsDict).map(async ([week, weeklyPointsDict]) => {
      const posPointsPerWeek = teamPointDict[week].posGroups[p.position];
      const playerPointsPerWeek = weeklyPointsDict[p.sleeper_id]
        ? weeklyPointsDict[p.sleeper_id] : rlPoints[p.position];
      const valueAddedTotal = teamPointDict[week].total
        - posPointsPerWeek.avg + playerPointsPerWeek;
      const playerZ = zScore(
        valueAddedTotal,
        teamPointDict[week].total,
        teamPointDict[week].stdDev
      );
      winsPercentPerWeek.push(cumulativeStdNormalProbability(playerZ));
      console.log(week, ` Team {${teamPointDict[week].total}, ${teamPointDict[week].stdDev}}`, p.position, teamPointDict[week].posGroups[p.position], `Points: {${weeklyPointsDict[p.sleeper_id]}, ${valueAddedTotal}, ${cumulativeStdNormalProbability(playerZ)}}`, `Rep: ${teamPointDict[week].repLevel[p.position]}`)
    });
    const playerPercent = winsPercentPerWeek.length > 0
      ? mean(winsPercentPerWeek) : 0;
    console.log(playerPercent);
    const weeks = Object.keys(pointsDict).length;
    playerWorpAndPercents[p.name_id] = {
      worp: playerPercent * weeks - replacementLevelWins[p.position] * weeks,
      svw: playerPercent * weeks,
      percent: playerPercent
    };
  });
  return playerWorpAndPercents;
};

export const CalculateWORPForSeason = async (season, settings, format) => {
  const gamelogData = await GetGamelogsForSeason(season);
  const fantasySeasonWeeks = gamelogData.rows.slice(0, gamelogData.rows.length - 1);
  const pointsDict = {};
  fantasySeasonWeeks.forEach(gamelogs => {
    Object.entries(gamelogs.gamelog_json).forEach(async ([key, value]) => {
      const pointsForWeek = await CalculatePointsFromGamelog(value, settings);
      if (!pointsDict[gamelogs.week]) {
        pointsDict[gamelogs.week] = {};
      }
      pointsDict[gamelogs.week][key] = pointsForWeek;
    });
  });
  const playersInSystem = (await GetPlayersInfoWithIds()).rows;
  const avgPointsPerPos = await CalculateAvgTeamScore(playersInSystem, pointsDict, format);
  const playerWoRPAndPercent = await CalculatePercentAndWoRPForPlayers(playersInSystem, pointsDict, avgPointsPerPos);
  return playerWoRPAndPercent;
  // return playersInSystem.sort((a, b) =>
  //   playerWoRPAndPercent[b.name_id].worp - playerWoRPAndPercent[a.name_id].worp)
  //   .map((p, ind) => [p.name_id, ind, playerWoRPAndPercent[p.name_id]]);
};
