import Model from '../models/model';

const playersModel = new Model('players_info');

/**
 * Returns current player values from the database
 */
export const GetCurrentPlayerValues = async () => {
  const data = await playersModel.selectQuery('SELECT mp.name_id, mp.sleeper_id, mp.mfl_id, mp.ff_id, mp.espn_id, mp.yahoo_id, mp.full_name, mp.first_name, mp.last_name, mp.team, mp."position", mp.age, mp.experience, mp.injury_status, ktc.trade_value, ktc.sf_trade_value, ktc.sf_position_rank, ktc.position_rank, mp."date", ktc.all_time_high_sf, ktc.all_time_low_sf, ktc.all_time_high, ktc.all_time_low, ktc.three_month_high_sf, ktc.three_month_high, ktc.three_month_low_sf, ktc.three_month_low, ktc.last_month_value, ktc.last_month_value_sf, mp.most_recent_data_point, mp.avg_adp, mp.fantasypro_adp, mp.bb10_adp, mp.rtsports_adp, mp.underdog_adp, mp.drafters_adp\n'
    + 'FROM mat_vw_players mp\n'
    + ' LEFT JOIN mat_vw_ktc_player_values ktc on ktc.name_id = mp.name_id \n'
    + ' order by sf_trade_value desc');
  return data;
};

/**
 * Returns historical value comparison data for players
 * @param {*} id name id of player
 * @param {*} isAllTime is alltime data or six months
 */
export const GetHistoricalPlayerValuesDatapoint = async (id, isAllTime) => {
  // updated where to include all time data if specified
  const sqlClause = isAllTime === 'false' ? ` WHERE pv.name_id = '${id}' AND pv.created_at::date >= now()::date - 180` : ` WHERE pv.name_id = '${id}'`;
  const data = await playersModel.selectQuery('select  player_info.name_id    as name_id,\n'
    + '                                               player_info.full_name  as full_name,\n'
    + '                                               pv.trade_value         as trade_value,\n'
    + '                                               pv.sf_trade_value      as sf_trade_value,\n'
    + '                                               pv.fc_sf_trade_value   as fc_sf_trade_value,\n'
    + '                                               pv.fc_trade_value      as fc_trade_value,\n'
    + '                                               pv.dp_sf_trade_value   as dp_sf_trade_value,\n'
    + '                                               pv.dp_trade_value      as dp_trade_value,\n'
    + '                                               pv.ds_sf_trade_value   as ds_sf_trade_value,\n'
    + '                                               pv.ds_trade_value      as ds_trade_value,\n'
    + '                                               pv.sf_position_rank    as sf_position_rank,\n'
    + '                                               pv.position_rank       as position_rank,\n'
    + '                                               pv.created_at          as date\n'
    + '      from player_info\n'
    + '               left join player_values pv on player_info.name_id = pv.name_id', sqlClause);
  return data;
};

/**
 * Fetch values for a specific day in the past
 * @param {*} intervalDays number of days in the past
 */
export const GetHistoricalPlayerValuesDatapointByDays = async (intervalDays) => {
  const data = await playersModel.selectQuery(
    'select  player_info.name_id    as name_id,\n'
    + '                                               player_info.full_name  as full_name,\n'
    + '                                               pv.trade_value         as trade_value,\n'
    + '                                               pv.sf_trade_value      as sf_trade_value,\n'
    + '                                               pv.fc_sf_trade_value   as fc_sf_trade_value,\n'
    + '                                               pv.fc_trade_value      as fc_trade_value,\n'
    + '                                               pv.dp_sf_trade_value   as dp_sf_trade_value,\n'
    + '                                               pv.dp_trade_value      as dp_trade_value,\n'
    + '                                               pv.ds_sf_trade_value   as ds_sf_trade_value,\n'
    + '                                               pv.ds_trade_value      as ds_trade_value,\n'
    + '                                               pv.sf_position_rank    as sf_position_rank,\n'
    + '                                               pv.position_rank       as position_rank,\n'
    + '                                               pv.created_at          as date\n'
    + '      from player_info\n'
    + '               left join player_values pv on player_info.name_id = pv.name_id',
    ` WHERE pv.created_at::date = now()::date - ${intervalDays} order by pv.sf_trade_value desc `
  );
  return data;
};

/**
 * Get player values for a specific market from the database
 * @param {*} market market value (0: KTC, 1: FantasyCalc, 2: DynastyProcess)
 */
export const GetPlayerValuesForMarket = async (market) => {
  switch (market) {
    case '0': {
      const data = await playersModel.selectQuery(
        'SELECT mp.name_id,\n'
        + 'mp.trade_value as trade_value,\n'
        + 'mp.sf_trade_value as sf_trade_value,\n'
        + 'mp.sf_position_rank as sf_position_rank,\n'
        + 'mp.position_rank as position_rank,\n'
        + 'mp.all_time_high_sf as all_time_high_sf,\n'
        + 'mp.all_time_low_sf as all_time_low_sf,\n'
        + 'mp.all_time_high as all_time_high,\n'
        + 'mp.all_time_low as all_time_low,\n'
        + 'mp.three_month_high_sf as three_month_high_sf,\n'
        + 'mp.three_month_high as three_month_high,\n'
        + 'mp.three_month_low_sf as three_month_low_sf,\n'
        + 'mp.three_month_low as three_month_low,\n'
        + 'mp.last_month_value as last_month_value,\n'
        + 'mp.last_month_value_sf as last_month_value_sf,\n'
        + 'mp.all_time_best_rank_sf as all_time_best_rank_sf,\n'
        + 'mp.all_time_best_rank as all_time_best_rank,\n'
        + 'mp.all_time_worst_rank_sf as all_time_worst_sf,\n'
        + 'mp.all_time_worst_rank as all_time_worst_rank,\n'
        + 'mp.three_month_best_rank_sf as three_month_best_rank_sf,\n'
        + 'mp.three_month_best_rank as three_month_best_rank,\n'
        + 'mp.three_month_worst_rank_sf as three_month_worst_rank_sf,\n'
        + 'mp.three_month_worst_rank as three_month_worst_rank,\n'
        + 'mp.last_month_rank as last_month_rank,\n'
        + 'mp.last_month_rank_sf as last_month_rank_sf\n'
        + 'FROM mat_vw_ktc_player_values mp;');
      return data;
    }
    case '1': {
      const data = await playersModel.selectQuery(
        'SELECT mp.name_id,\n'
        + 'mp.fc_trade_value as trade_value,\n'
        + 'mp.fc_sf_trade_value as sf_trade_value,\n'
        + 'mp.fc_sf_position_rank as sf_position_rank,\n'
        + 'mp.fc_position_rank as position_rank,\n'
        + 'mp.fc_all_time_high_sf as all_time_high_sf,\n'
        + 'mp.fc_all_time_low_sf as all_time_low_sf,\n'
        + 'mp.fc_all_time_high as all_time_high,\n'
        + 'mp.fc_all_time_low as all_time_low,\n'
        + 'mp.fc_three_month_high_sf as three_month_high_sf,\n'
        + 'mp.fc_three_month_high as three_month_high,\n'
        + 'mp.fc_three_month_low_sf as three_month_low_sf,\n'
        + 'mp.fc_three_month_low as three_month_low,\n'
        + 'mp.fc_last_month_value as last_month_value,\n'
        + 'mp.fc_last_month_value_sf as last_month_value_sf,\n'
        + 'mp.fc_all_time_best_rank_sf as all_time_best_rank_sf,\n'
        + 'mp.fc_all_time_best_rank as all_time_best_rank,\n'
        + 'mp.fc_all_time_worst_rank_sf as all_time_worst_sf,\n'
        + 'mp.fc_all_time_worst_rank as all_time_worst_rank,\n'
        + 'mp.fc_three_month_best_rank_sf as three_month_best_rank_sf,\n'
        + 'mp.fc_three_month_best_rank as three_month_best_rank,\n'
        + 'mp.fc_three_month_worst_rank_sf as three_month_worst_rank_sf,\n'
        + 'mp.fc_three_month_worst_rank as three_month_worst_rank,\n'
        + 'mp.fc_last_month_rank as last_month_rank,\n'
        + 'mp.fc_last_month_rank_sf as last_month_rank_sf\n'
        + 'FROM mat_vw_fc_player_values mp;');
      return data;
    }
    case '2': {
      const data = await playersModel.selectQuery(
        'SELECT mp.name_id,\n'
        + 'mp.dp_trade_value as trade_value,\n'
        + 'mp.dp_sf_trade_value as sf_trade_value,\n'
        + 'mp.dp_sf_position_rank as sf_position_rank,\n'
        + 'mp.dp_position_rank as position_rank,\n'
        + 'mp.dp_all_time_high_sf as all_time_high_sf,\n'
        + 'mp.dp_all_time_low_sf as all_time_low_sf,\n'
        + 'mp.dp_all_time_high as all_time_high,\n'
        + 'mp.dp_all_time_low as all_time_low,\n'
        + 'mp.dp_three_month_high_sf as three_month_high_sf,\n'
        + 'mp.dp_three_month_high as three_month_high,\n'
        + 'mp.dp_three_month_low_sf as three_month_low_sf,\n'
        + 'mp.dp_three_month_low as three_month_low,\n'
        + 'mp.dp_last_month_value as last_month_value,\n'
        + 'mp.dp_last_month_value_sf as last_month_value_sf,\n'
        + 'mp.dp_last_month_value_sf as last_month_value_sf,\n'
        + 'mp.dp_all_time_best_rank_sf as all_time_best_rank_sf,\n'
        + 'mp.dp_all_time_best_rank as all_time_best_rank,\n'
        + 'mp.dp_all_time_worst_rank_sf as all_time_worst_sf,\n'
        + 'mp.dp_all_time_worst_rank as all_time_worst_rank,\n'
        + 'mp.dp_three_month_best_rank_sf as three_month_best_rank_sf,\n'
        + 'mp.dp_three_month_best_rank as three_month_best_rank,\n'
        + 'mp.dp_three_month_worst_rank_sf as three_month_worst_rank_sf,\n'
        + 'mp.dp_three_month_worst_rank as three_month_worst_rank,\n'
        + 'mp.dp_last_month_rank as last_month_rank,\n'
        + 'mp.dp_last_month_rank_sf as last_month_rank_sf\n'
        + 'FROM mat_vw_dp_player_values mp;');
      return data;
    }
    case '3': {
      const data = await playersModel.selectQuery(
        'SELECT mp.name_id,\n'
        + 'mp.ds_trade_value as trade_value,\n'
        + 'mp.ds_sf_trade_value as sf_trade_value,\n'
        + 'mp.ds_sf_position_rank as sf_position_rank,\n'
        + 'mp.ds_position_rank as position_rank,\n'
        + 'mp.ds_all_time_high_sf as all_time_high_sf,\n'
        + 'mp.ds_all_time_low_sf as all_time_low_sf,\n'
        + 'mp.ds_all_time_high as all_time_high,\n'
        + 'mp.ds_all_time_low as all_time_low,\n'
        + 'mp.ds_three_month_best_rank_sf as three_month_best_rank_sf,\n'
        + 'mp.ds_three_month_best_rank as three_month_best_rank,\n'
        + 'mp.ds_three_month_worst_rank_sf as three_month_worst_rank_sf,\n'
        + 'mp.ds_three_month_worst_rank as three_month_worst_rank,\n'
        + 'mp.ds_last_month_value as last_month_value,\n'
        + 'mp.ds_last_month_value_sf as last_month_value_sf,\n'
        + 'mp.ds_all_time_best_rank_sf as all_time_best_rank_sf,\n'
        + 'mp.ds_all_time_best_rank as all_time_best_rank,\n'
        + 'mp.ds_all_time_worst_rank_sf as all_time_worst_sf,\n'
        + 'mp.ds_all_time_worst_rank as all_time_worst_rank,\n'
        + 'mp.ds_three_month_best_rank_sf as three_month_best_rank_sf,\n'
        + 'mp.ds_three_month_best_rank as three_month_best_rank,\n'
        + 'mp.ds_three_month_worst_rank_sf as three_month_worst_rank_sf,\n'
        + 'mp.ds_three_month_worst_rank as three_month_worst_rank,\n'
        + 'mp.ds_last_month_rank as last_month_rank,\n'
        + 'mp.ds_last_month_rank_sf as last_month_rank_sf\n'
        + 'FROM mat_vw_ds_player_values mp;');
      return data;
    }
    default:
      return null;
  }
};

/**
 * Fetch values for a specific day in the past
 * @param {*} intervalDays number of days in the past
 */
// eslint-disable-next-line max-len
export const GetFantasyPortfolioForInterval = async (intervalDays, playerList) => {
  const data = await playersModel.selectQuery(
    'SELECT name_id, jsonb_agg(\n'
    + 'json_build_object(\'date\', created_at::date, \'sf_trade_value\', sf_trade_value, \'trade_value\', trade_value,\n'
    + ' \'fc_sf_trade_value\', fc_sf_trade_value, \'fc_trade_value\', fc_trade_value, \'dp_sf_trade_value\', dp_sf_trade_value,\n'
    + ' \'dp_trade_value\', dp_trade_value, \'ds_sf_trade_value\', ds_sf_trade_value, \'ds_trade_value\', ds_trade_value) order by created_at::date \n'
    + ' ) AS player_data\n'
    + ' FROM player_values\n'
    + ` WHERE name_id IN ${playerList} \n`
    + ` and created_at::date >= current_date - interval '${intervalDays} days'\n`
    + ' GROUP BY name_id'
  );
  return data;
};
