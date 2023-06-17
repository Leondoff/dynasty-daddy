export class LeagueScoringDTO {
    /**
     * Offense Scoring
     */
    fum: number;
    fumLost: number;

    // Off: Passing
    pass2pt: number;
    passInt: number;
    passTd: number;
    pass40YdPTd: number;
    passIntTd: number;
    passYd: number;
    passAtt: number;
    passCmp: number;
    passCmp40YdP: number;
    passFD: number;
    passInc: number;
    passSack: number;

    // Off: Receiving
    rec: number;
    rec2pt: number;
    recTd: number;
    recYd: number;
    recFD: number;
    rec40YdP: number;
    rec40YdPTd: number;
    rec_0_4: number;
    rec_5_9: number;
    rec_10_19: number;
    rec_20_29: number;
    rec_30_39: number;

    // Off: Rushing
    rush2pt: number;
    rushTd: number;
    rushYd: number;
    rushAtt: number;
    rushFD: number;
    rush40YdP: number;
    rush40YdPTd: number;

    // Off: Bonuses
    bonusPassCmp25: number;
    bonusPassYd300: number;
    bonusPassYd400: number;
    bonusRecRB: number;
    bonusRecTE: number;
    bonusRecWR: number;
    bonusRecYd100: number;
    bonusRecYd200: number;
    bonusRushAtt20: number;
    bonusRushRecYd100: number;
    bonusRushRecYd200: number;
    bonusRushYd100: number;
    bonusRushYd200: number;

    /**
     * Defensive Scoring
     */

    // IDP Scoring
    idpBlkKick: number;
    idpDefTD: number;
    idpFF: number;
    idpFumRec: number;
    idpFumRetYd: number;
    idpInt: number;
    idpIntRetYd: number;
    idpPassDef: number;
    idpQBHit: number;
    idpSack: number;
    idpSafety: number;
    idpTkl: number;
    idpTklAst: number;
    idpTklLoss: number;
    idpTklSolo: number;

    // Team DST Scoring
    defStFF: number;
    defStFumRec: number;
    defStTd: number;
    defTd: number;
    sack: number;
    safety: number;
    blkKick: number;
    int: number;
    ptsAllowed_0: number;
    ptsAllowed_1_6: number;
    ptsAllowed_7_13: number;
    ptsAllowed_14_20: number;
    ptsAllowed_21_27: number;
    ptsAllowed_28_34: number;
    ptsAllowed_35p: number;

    // Special teams scoring
    stFF: number;
    stTD: number;
    stFumRec: number;
    prTd: number;
    krTd: number;

    // Kicker scoring
    fgm_0_19: number;
    fgm_20_29: number;
    fgm_30_39: number;
    fgm_40_49: number;
    fgm_50p: number;
    fgmiss: number;
    xpMake: number;
    xpMiss: number;

    fromSleeper(sleeperData: any): LeagueScoringDTO {
        this.fum = sleeperData?.fum || 0;
        this.fumLost = sleeperData?.fum_lost || 0;
        this.pass2pt = sleeperData?.pass_2pt || 0;
        this.passInt = sleeperData?.pass_int || 0;
        this.passTd = sleeperData?.pass_td || 0;
        this.pass40YdPTd = sleeperData?.pass_td_40p || 0;
        this.passIntTd = sleeperData?.pass_int_td || 0;
        this.passYd = sleeperData?.pass_yd || 0;
        this.passAtt = sleeperData?.pass_att || 0;
        this.passCmp = sleeperData?.pass_cmp || 0;
        this.passCmp40YdP = sleeperData?.pass_cmp_40p || 0;
        this.passFD = sleeperData?.pass_fd || 0;
        this.passInc = sleeperData?.pass_inc || 0;
        this.passSack = sleeperData?.pass_sack || 0;
        this.rec = sleeperData?.rec || 0;
        this.rec2pt = sleeperData?.rec_2pt || 0;
        this.recTd = sleeperData?.rec_td || 0;
        this.recYd = sleeperData?.rec_yd || 0;
        this.recFD = sleeperData?.rec_fd || 0;
        this.rec40YdP = sleeperData?.rec_40p || 0;
        this.rec40YdPTd = sleeperData?.rec_td_40p || 0;
        this.rec_0_4 = sleeperData?.rec_0_4 || 0;
        this.rec_5_9 = sleeperData?.rec_5_9 || 0;
        this.rec_10_19 = sleeperData?.rec_10_19 || 0;
        this.rec_20_29 = sleeperData?.rec_20_29 || 0;
        this.rec_30_39 = sleeperData?.rec_30_39 || 0;
        this.rush2pt = sleeperData?.rush_2pt || 0;
        this.rushTd = sleeperData?.rush_td || 0;
        this.rushYd = sleeperData?.rush_yd || 0;
        this.rushAtt = sleeperData?.rush_att || 0;
        this.rushFD = sleeperData?.rush_fd || 0;
        this.rush40YdP = sleeperData?.rush_40p || 0;
        this.rush40YdPTd = sleeperData?.rush_td_40p || 0;
        this.bonusPassCmp25 = sleeperData?.bonus_pass_cmp_25 || 0;
        this.bonusPassYd300 = sleeperData?.bonus_pass_yd_300 || 0;
        this.bonusPassYd400 = sleeperData?.bonus_pass_yd_400 || 0;
        this.bonusRecRB = sleeperData?.bonus_rec_rb || 0;
        this.bonusRecTE = sleeperData?.bonus_rec_te || 0;
        this.bonusRecWR = sleeperData?.bonus_rec_wr || 0;
        this.bonusRecYd100 = sleeperData?.bonus_rec_yd_100 || 0;
        this.bonusRecYd200 = sleeperData?.bonus_rec_yd_200 || 0;
        this.bonusRushAtt20 = sleeperData?.bonus_rush_att_20 || 0;
        this.bonusRushRecYd100 = sleeperData?.bonus_rush_rec_yd_100 || 0;
        this.bonusRushRecYd200 = sleeperData?.bonus_rush_rec_yd_200 || 0;
        this.bonusRushYd100 = sleeperData?.bonus_rush_yd_100 || 0;
        this.bonusRushYd200 = sleeperData?.bonus_rush_yd_200 || 0;
        this.idpBlkKick = sleeperData?.idp_blk_kick || 0;
        this.idpDefTD = sleeperData?.idp_def_td || 0;
        this.idpFF = sleeperData?.idp_ff || 0;
        this.idpFumRec = sleeperData?.idp_fum_rec || 0;
        this.idpFumRetYd = sleeperData?.idp_fum_ret_yd || 0;
        this.idpInt = sleeperData?.idp_int || 0;
        this.idpIntRetYd = sleeperData?.idp_int_ret_yd || 0;
        this.idpPassDef = sleeperData?.idp_pass_def || 0;
        this.idpQBHit = sleeperData?.idp_qb_hit || 0;
        this.idpSack = sleeperData?.idp_sack || 0;
        this.idpSafety = sleeperData?.idp_safe || 0;
        this.idpTkl = sleeperData?.idp_tkl || 0;
        this.idpTklAst = sleeperData?.idp_tkl_ast || 0;
        this.idpTklLoss = sleeperData?.idp_tkl_loss || 0;
        this.idpTklSolo = sleeperData?.idp_tkl_solo || 0;
        this.defStFF = sleeperData?.def_st_ff || 0;
        this.defStFumRec = sleeperData?.def_st_fum_rec || 0;
        this.defStTd = sleeperData?.def_st_td || 0;
        this.defTd = sleeperData?.def_td || 0;
        this.sack = sleeperData?.sack || 0;
        this.safety = sleeperData?.safe || 0;
        this.blkKick = sleeperData?.blk_ick || 0;
        this.int = sleeperData?.int || 0;
        this.ptsAllowed_0 = sleeperData?.pts_allowed_0 || 0;
        this.ptsAllowed_1_6 = sleeperData?.pts_allowed_1_6 || 0;
        this.ptsAllowed_7_13 = sleeperData?.pts_allowed_7_13 || 0;
        this.ptsAllowed_14_20 = sleeperData?.pts_allowed_14_20 || 0;
        this.ptsAllowed_21_27 = sleeperData?.pts_allowed_21_27 || 0;
        this.ptsAllowed_28_34 = sleeperData?.pts_allowed_28_34 || 0;
        this.ptsAllowed_35p = sleeperData?.pts_allowed_35p || 0;
        this.stFF = sleeperData?.st_ff || 0;
        this.stTD = sleeperData?.st_td || 0;
        this.stFumRec = sleeperData?.st_fum_rec || 0;
        this.prTd = sleeperData?.pr_td || 0;
        this.krTd = sleeperData?.kr_td || 0;
        this.fgm_0_19 = sleeperData?.fgm_0_19 || 0;
        this.fgm_20_29 = sleeperData?.fgm_20_29 || 0;
        this.fgm_30_39 = sleeperData?.fgm_30_39 || 0;
        this.fgm_40_49 = sleeperData?.fgm_40_49 || 0;
        this.fgm_50p = sleeperData?.fgm_50p || 0;
        this.fgmiss = sleeperData?.fgm || 0
        
        return this;
    }

    parseJSON(jsonBlob) {
        const data = JSON.parse(jsonBlob);
        const result = {};
      
        for (const item of data) {
          const abbreviation = item.abbreviation?.$t || '';
          const shortDescription = item.shortDescription?.$t || '';
      
          result[abbreviation] = shortDescription;
        }
      
        return result;
      }
}