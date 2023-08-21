/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-async-promise-executor */
import {
  GetGamelogsForSeason
} from '../repository';

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
  weeklyScore += gamelog.idp_def_td * settings.idpDefTd || 0;
  weeklyScore += gamelog.idp_ff * settings.idpFF || 0;
  weeklyScore += gamelog.idp_fum_rec * settings.idpFumRec || 0;
  weeklyScore += gamelog.idp_fum_ret_yd * settings.idpFumRetYd || 0;
  weeklyScore += gamelog.idp_int * settings.idpInt || 0;
  weeklyScore += gamelog.idp_int_ret_yd * settings.idpIntRetYd || 0;
  weeklyScore += gamelog.idp_pass_def * settings.idpPassDef || 0;
  weeklyScore += gamelog.idp_qb_hit * settings.idpQBHit || 0;
  weeklyScore += gamelog.idp_sack * settings.idpSack || 0;
  weeklyScore += gamelog.idp_safe * settings.idpSafety || 0;
  weeklyScore += gamelog.idp_tkl_ast * (settings.idpTklAst || settings.idpTkl) || 0;
  weeklyScore += gamelog.idp_tkl_loss * settings.idpTklLoss || 0;
  weeklyScore += gamelog.idp_tkl_solo * (settings.idpTklSolo || settings.idpTkl) || 0;
  weeklyScore += gamelog.def_st_ff * settings.defStFF || 0;
  weeklyScore += gamelog.def_st_fum_rec * settings.defStFumRec || 0;
  weeklyScore += gamelog.def_st_td * settings.defStTd || 0;
  weeklyScore += gamelog.def_td * settings.defTd || 0;
  weeklyScore += gamelog.sack * settings.sack || 0;
  weeklyScore += gamelog.safe * settings.safety || 0;
  weeklyScore += gamelog.blk_ick * settings.blkKick || 0;
  weeklyScore += gamelog.int * settings.int || 0;
  weeklyScore += gamelog.pts_allow ? (settings.defPtsStart || 10)
    + gamelog.pts_allow * (settings.defPtsAllowedMod || -0.3) : 0;
  weeklyScore += gamelog.st_ff * settings.stFF || 0;
  weeklyScore += gamelog.st_td * settings.stTd || 0;
  weeklyScore += gamelog.st_fum_rec * settings.stFumRec || 0;
  weeklyScore += gamelog.pr_td * settings.prTd || 0;
  weeklyScore += gamelog.kr_td * settings.krTd || 0;
  weeklyScore += gamelog.fgm * settings.fgMade || 0;
  weeklyScore += gamelog.fgm_yds_over_30 * settings.fgMadeMod || 0;
  weeklyScore += gamelog.fgmiss * settings.fgMiss || 0;
  weeklyScore += gamelog.xpm * settings.xpMade || 0;
  weeklyScore += gamelog.xpmiss * settings.xpMiss || 0;
  return weeklyScore;
};

export const FetchGamelogsForSeason = async (season, startWeek, endWeek) =>
  GetGamelogsForSeason(season, startWeek, endWeek);

export const FetchPointsPerWeekInSeason = async (season, settings, startWeek, endWeek) => {
  const gamelogData = await FetchGamelogsForSeason(season, startWeek, endWeek);
  const fantasySeasonWeeks = gamelogData.rows;
  const pointsDict = {};
  fantasySeasonWeeks.forEach(gamelogs => {
    Object.entries(gamelogs.gamelog_json).forEach(async ([key, value]) => {
      const pointsForWeek = await CalculatePointsFromGamelog(value, settings);
      if (!pointsDict[gamelogs.week]) {
        pointsDict[gamelogs.week] = {};
      }
      pointsDict[gamelogs.week][key] = { pts: pointsForWeek, gamelog: value };
    });
  });
  return pointsDict;
};
