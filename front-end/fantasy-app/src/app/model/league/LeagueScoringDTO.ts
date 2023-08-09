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
  idpDefTd: number;
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
  defPtsStart: number = 10;
  defPtsAllowedMod: number = -0.3;

  // Special teams scoring
  stFF: number;
  stTd: number;
  stFumRec: number;
  prTd: number;
  krTd: number;

  // Kicker scoring
  fgMade: number = 3;
  fgMiss: number = -1;
  xpMake: number = 1;
  xpMiss: number = -1;
  fgMadeMod: number = 0.1;

  fromSleeper(sleeperData: any): LeagueScoringDTO {
    this.fum = sleeperData?.fum || 0;
    this.fumLost = sleeperData?.fum_lost || 0;
    this.pass2pt = sleeperData?.pass_2pt || 0;
    this.passInt = sleeperData?.pass_int || 0;
    this.passTd = sleeperData?.pass_td || 0;
    this.pass40YdPTd = sleeperData?.pass_td_40p || 0;
    this.passIntTd = sleeperData?.pass_int_td || 0;
    this.passYd = this.roundYD(sleeperData?.pass_yd);
    this.passAtt = sleeperData?.pass_att || 0;
    this.passCmp = sleeperData?.pass_cmp || 0;
    this.passCmp40YdP = sleeperData?.pass_cmp_40p || 0;
    this.passFD = sleeperData?.pass_fd || 0;
    this.passInc = sleeperData?.pass_inc || 0;
    this.passSack = sleeperData?.pass_sack || 0;
    this.rec = sleeperData?.rec || 0;
    this.rec2pt = sleeperData?.rec_2pt || 0;
    this.recTd = sleeperData?.rec_td || 0;
    this.recYd = this.roundYD(sleeperData?.rec_yd);
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
    this.rushYd = this.roundYD(sleeperData?.rush_yd);
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
    this.idpDefTd = sleeperData?.idp_def_td || 0;
    this.idpFF = sleeperData?.idp_ff || 0;
    this.idpFumRec = sleeperData?.idp_fum_rec || 0;
    this.idpFumRetYd = this.roundYD(sleeperData?.idp_fum_ret_yd);
    this.idpInt = sleeperData?.idp_int || 0;
    this.idpIntRetYd = this.roundYD(sleeperData?.idp_int_ret_yd);
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
    this.defPtsStart = sleeperData?.pts_allow_0 || 10;
    this.defPtsAllowedMod = sleeperData?.pts_allow || -0.3;
    this.stFF = sleeperData?.st_ff || 0;
    this.stTd = sleeperData?.st_td || 0;
    this.stFumRec = sleeperData?.st_fum_rec || 0;
    this.prTd = sleeperData?.pr_td || 0;
    this.krTd = sleeperData?.kr_td || 0;
    this.fgMade = sleeperData?.fgm || 3;
    this.fgMadeMod = 0.1;
    this.fgMiss = sleeperData?.fgmiss || 0;
    return this;
  }

  fromMFL(scoringSettings: any[]): LeagueScoringDTO {
    const mflCache = {};
    for (let posRules of scoringSettings) {
      mflCache[posRules.positions] = {}
      if (Array.isArray(posRules?.['rule'])) {
        for (let rule of posRules?.['rule']) {
          if (MFLRulesMap[rule?.['event']?.['$t']]) {
            for (let met of MFLRulesMap[rule?.['event']?.['$t']]) {
              const metNum = Number(rule?.['points']?.['$t'].replace('*', ''));
              if (met === 'pts_allowed') {
                if (rule?.['range']?.['$t'] === '0-999') {
                  if (rule?.['points']?.['$t'].includes('*')) {
                    this.defPtsAllowedMod = metNum || 10;
                  } else {
                    this.defPtsStart = metNum || 10;
                  }
                }
              } else if (met === 'fgLength') {
                if (rule?.['range']?.['$t'].substr(0, 2) == '0-') {
                  this.fgMade = metNum || 3;
                }
                this.fgMadeMod = 0.1;
              } else {
                mflCache[posRules.positions][met] = metNum
                this[met] = this[met] != 0 && this[met] < metNum ? this[met] : metNum
              }
            }
          }
        }
      } else {
        const rule = posRules?.['rule'];
        if (MFLRulesMap[rule?.['event']?.['$t']]) {
          for (let met of MFLRulesMap[rule?.['event']?.['$t']]) {
            const metNum = Number(rule?.['points']?.['$t'].replace('*', ''));
            if (met === 'pts_allowed') {
              if (rule?.['range']?.['$t'] === '0-999') {
                if (rule?.['points']?.['$t'].includes('*')) {
                  this.defPtsAllowedMod = metNum || 10;
                } else {
                  this.defPtsStart = metNum || 10;
                }
              }
            } else if (met === 'fgLength') {
              if (rule?.['range']?.['$t'].substr(0, 2) == '0-') {
                this.fgMade = metNum || 3;
              }
              this.fgMadeMod = 0.1;
            } else {
              mflCache[posRules.positions][met] = metNum
              this[met] = this[met] != 0 && this[met] < metNum ? this[met] : metNum
            }
          }
        }
      }
    }
    // evaluate rec premiums
    if (mflCache['TE'] && mflCache['TE']['rec'] > this.rec)
      this.bonusRecTE = mflCache['TE']['rec'] - this.rec;
    if (mflCache['RB'] && mflCache['RB']['rec'] > this.rec)
      this.bonusRecRB = mflCache['RB']['rec'] - this.rec;
    if (mflCache['WR'] && mflCache['WR']['rec'] > this.rec)
      this.bonusRecWR = mflCache['WR']['rec'] - this.rec;
    return this;
  }

  fromESPN(scoringSettings: any[]): LeagueScoringDTO {
    for (let rule of scoringSettings['scoringItems']) {
      if (ESPNRulesMap[rule.statId]) {
        for (let met of ESPNRulesMap[rule.statId]) {
          this[met] = rule['points'] || rule['pointsOverrides']['16'] || 0;
        }
      }
    }
    return this;
  }

  fromFF(scoringSettings: any[]): LeagueScoringDTO {
    for (let ruleGroup of scoringSettings) {
      for (let rule of ruleGroup?.scoringRules || []) {
        if (FFRulesMap[rule.category.id]) {
          if (!rule.isBonus) {
            for (let met of FFRulesMap[rule.category.id]) {
              this[met] = rule?.pointsPer?.value || rule?.points?.value || 0;
            }
          } else {
            if (FFRulesMap[rule.category.id]) {

            }
          }
        }
      }
    }
    return this;
  }

  fromFFPC(scoringSettings: any): LeagueScoringDTO {
    console.log(scoringSettings);
    return this;
  }

  private roundYD(number?: number): number {
    if (!number) return 0;
    return Math.round(100 * number) / 100
  }
}

export const MFLRulesMap = {
  '#P': ['passTd'],
  'PY': ['passYd'],
  'PA': ['passAtt'],
  'PC': ['passCmp'],
  'INC': ['passInc'],
  'IN': ['passInt'],
  '#IT': ['passIntTd'],
  'TSK': ['passSack'],
  'P40': ['passCmp40YdP'],
  'P2': ['pass2pt'],
  '#R': ['rushTd'],
  'RY': ['rushYd'],
  'RA': ['rushAtt'],
  'R40': ['rush40YdP'],
  'R2': ['rush2pt'],
  '#C': ['recTd'],
  'CY': ['recYd'],
  'CC': ['rec'],
  'C20': ['rec_20_29'],
  'C40': ['rec40YdP'],
  'C2': ['rec2pt'],
  '#F': ['fgMake'],
  'FG': ['fgLength'],
  '#M': ['fgmiss'],
  'EP': ['xpMake'],
  'EM': ['xpMiss'],
  '#UT': ['prTd'],
  '#KT': ['krTd'],
  'FCS': ['stFumRec'],
  '#T': ['defStTd'],
  '1P': ['passFD'],
  '1R': ['rushFD'],
  '1C': ['recFD'],
  'FC': ['defStFumRec', 'idpFumRec'],
  'FF': ['defStFF', 'idpFF'],
  '#D': ['defTd', 'idpDefTd'],
  'SK': ['sack', 'idpSack'],
  'SF': ['safety', 'idpSafety'],
  'IC': ['int', 'idpInt'],
  'BLF': ['blkKick', 'idpBlkKick'],
  'ICY': ['idpIntRetYd'],
  'PD': ['idpPassDef'],
  'TKD': ['idpTkl', 'idpTklSolo'],
  'TK': ['idpTkl', 'idpTklSolo'],
  'ASD': ['idpTklAst'],
  'AS': ['idpTklAst'],
  'QH': ['idpQBHit'],
  'TKL': ['idpTklLoss'],
  'FCY': ['idpFumRetYd'],
  'FCD': ['idpFumRec'],
  'FU': ['fum'],
  'TPA': ['pts_allowed']
};

// https://github.com/cwendt94/espn-api/blob/master/espn_api/football/constant.py
export const ESPNRulesMap = {
  0: ['passAtt'],
  1: ['passCmp'],
  2: ['passInc'],
  3: ['passYd'],
  4: ['passTd'],
  15: ['pass40YdPTd'],
  17: ['bonusPassYd300'],
  18: ['bonusPassYd400'],
  19: ['pass2pt'],
  20: ['passInt'],
  22: ['passYd'],
  23: ['rushAtt'],
  24: ['rushYd'],
  25: ['rushTd'],
  26: ['rush2pt'],
  35: ['rush40YdPTd'],
  37: ['bonusRushYd100'],
  38: ['bonusRushYd200'],
  40: ['rushAtt'],
  41: ['rec'],
  42: ['recYd'],
  43: ['recTd'],
  44: ['rec2pt'],
  45: ['rec40YdPTd'],
  53: ['rec'],
  56: ['bonusRecYd100'],
  57: ['bonusRecYd200'],
  62: ['pass2pt'],
  64: ['passSack'],
  68: ['fum'],
  72: ['fumLost'],
  83: ['fgMade'],
  85: ['fgMiss'],
  86: ['xpMade'],
  88: ['xpMiss'],
  89: ['defPtsStart'],
  94: ['defTd', 'idpDefTd'],
  95: ['int', 'idpInt'],
  96: ['defStFumRec', 'idpFumRec'],
  97: ['blkKick', 'idpBlkKick'],
  98: ['safety', 'idpSafety'],
  99: ['sack', 'idpSack'],
  105: ['defStTd'],
  106: ['defStFF', 'idpFF'],
  107: ['idpTklAst'],
  108: ['idpTklSolo'],
  109: ['idpTkl'],
  113: ['idpPassDef']
}

export const FFRulesMap = {
  1: ['passAtt'],
  2: ['passCmp'],
  3: ['passYd'],
  4: ['pass2pt'],
  5: ['passTd'],
  7: ['passInt'],
  9: ['passSack'],
  10: ['passInc'],
  133: ['passFD'],
  21: ['rushAtt'],
  22: ['rushYd'],
  23: ['rush2pt'],
  24: ['rushTd'],
  132: ['rushFD'],
  41: ['rec'],
  42: ['recYd'],
  43: ['rec2pt'],
  44: ['recTd'],
  131: ['recFD'],
  26: ['fum'],
  27: ['fumLost'],
  29: ['defStTd'],
  101: ['fgMade'],
  103: ['fgMiss'],
  104: ['xpMade'],
  105: ['xpMiss'],
  81: ['idpTkl'],
  82: ['idpTklAst'],
  83: ['idpTklSolo'],
  124: ['idlTklLoss'],
  84: ['int', 'idpInt'],
  85: ['sack', 'idpSack'],
  86: ['defStFF', 'idpFF'],
  87: ['defStFumRec', 'idpFumRec'],
  88: ['safety', 'idpSafety'],
  117: ['blkKick', 'idpBlkKick'],
  96: ['idpPassDef'],
  136: ['idpQBHit'],
  128: ['idpIntRetYd'],
  89: ['idpDefTd', 'defTd']
}
