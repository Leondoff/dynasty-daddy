import Model from '../models/model';

const playersModel = new Model('players_info');

/**
 * Returns current player values from the database
 */
export const GetCurrentPlayerValues = async () => {
  const data = await playersModel.selectQuery(`
  SELECT
      mp.name_id,
      mp.sleeper_id,
      mp.mfl_id,
      mp.ff_id,
      mp.espn_id,
      mp.yahoo_id,
      mp.full_name,
      mp.first_name,
      mp.last_name,
      mp.team,
      mp."position",
      mp.age,
      mp.experience,
      mp.injury_status,
      ktc.trade_value,
      ktc.sf_trade_value,
      ktc.sf_position_rank,
      ktc.position_rank,
      mp."date",
      ktc.all_time_high_sf,
      ktc.all_time_low_sf,
      ktc.all_time_high,
      ktc.all_time_low,
      ktc.three_month_high_sf,
      ktc.three_month_high,
      ktc.three_month_low_sf,
      ktc.three_month_low,
      ktc.last_month_value,
      ktc.last_month_value_sf,
      ktc.all_time_best_rank_sf,
      ktc.all_time_worst_rank_sf,
      ktc.all_time_best_rank,
      ktc.all_time_worst_rank,
      ktc.three_month_best_rank_sf,
      ktc.three_month_best_rank,
      ktc.three_month_worst_rank_sf,
      ktc.three_month_worst_rank,
      ktc.last_month_rank,
      ktc.last_month_rank_sf,
      mp.most_recent_data_point,
      mp.avg_adp,
      mp.fantasypro_adp,
      mp.bb10_adp,
      mp.rtsports_adp,
      mp.underdog_adp,
      mp.drafters_adp
  FROM
      mat_vw_players mp
  LEFT JOIN
      mat_vw_ktc_player_values ktc ON ktc.name_id = mp.name_id
  ORDER BY
      sf_trade_value DESC
`);
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
  const data = await playersModel.selectQuery(`
  SELECT
      player_info.name_id    as name_id,
      player_info.full_name  as full_name,
      pv.trade_value         as trade_value,
      pv.sf_trade_value      as sf_trade_value,
      pv.fc_sf_trade_value   as fc_sf_trade_value,
      pv.fc_trade_value      as fc_trade_value,
      pv.dp_sf_trade_value   as dp_sf_trade_value,
      pv.dp_trade_value      as dp_trade_value,
      pv.ds_sf_trade_value   as ds_sf_trade_value,
      pv.ds_trade_value      as ds_trade_value,
      pv.sf_position_rank    as sf_position_rank,
      pv.position_rank       as position_rank,
      pv.created_at          as date
  FROM 
      player_info
  LEFT JOIN
      player_values pv on player_info.name_id = pv.name_id`,
  sqlClause
  );
  return data;
};

/**
 * Fetch values for a specific day in the past
 * @param {*} intervalDays number of days in the past
 */
export const GetHistoricalPlayerValuesDatapointByDays = async (intervalDays) => {
  const data = await playersModel.selectQuery(`
  SELECT
      player_info.name_id    as name_id,
      player_info.full_name  as full_name,
      pv.trade_value         as trade_value,
      pv.sf_trade_value      as sf_trade_value,
      pv.fc_sf_trade_value   as fc_sf_trade_value,
      pv.fc_trade_value      as fc_trade_value,
      pv.dp_sf_trade_value   as dp_sf_trade_value,
      pv.dp_trade_value      as dp_trade_value,
      pv.ds_sf_trade_value   as ds_sf_trade_value,
      pv.ds_trade_value      as ds_trade_value,
      pv.sf_position_rank    as sf_position_rank,
      pv.position_rank       as position_rank,
      pv.created_at          as date
  FROM
      player_info
  LEFT JOIN
      player_values pv on player_info.name_id = pv.name_id`,
  ` WHERE pv.created_at::date = now()::date - ${intervalDays} order by pv.sf_trade_value desc `
  );
  return data;
};

/**
 * Get player values for a specific market from the database
 * @param {*} market market value (0: KTC, 1: FantasyCalc, 2: DynastyProcess)
 */
export const GetPlayerValuesForMarket = async (market) => {
  let table = '';
  let marketPrefix = '';
  switch (market) {
    // KeepTradeCut
    case '0': {
      table = 'mat_vw_ktc_player_values';
      marketPrefix = '';
      break;
    }
    // FantasyCalc
    case '1': {
      table = 'mat_vw_fc_player_values';
      marketPrefix = 'fc_';
      break;
    }
    // DynastyProcess
    case '2': {
      table = 'mat_vw_dp_player_values';
      marketPrefix = 'dp_';
      break;
    }
    // DynastySuperflex
    case '3': {
      table = 'mat_vw_ds_player_values';
      marketPrefix = 'ds_';
      break;
    }
    // Invalid fantasy market
    default:
      return null;
  }
  const data = await playersModel.selectQuery(`
  SELECT
      mp.name_id as name_id,
      mp.${marketPrefix}trade_value as trade_value,
      mp.${marketPrefix}sf_trade_value as sf_trade_value,
      mp.${marketPrefix}sf_position_rank as sf_position_rank,
      mp.${marketPrefix}position_rank as position_rank,
      mp.${marketPrefix}all_time_high_sf as all_time_high_sf,
      mp.${marketPrefix}all_time_low_sf as all_time_low_sf,
      mp.${marketPrefix}all_time_high as all_time_high,
      mp.${marketPrefix}all_time_low as all_time_low,
      mp.${marketPrefix}three_month_high_sf as three_month_high_sf,
      mp.${marketPrefix}three_month_high as three_month_high,
      mp.${marketPrefix}three_month_low_sf as three_month_low_sf,
      mp.${marketPrefix}three_month_low as three_month_low,
      mp.${marketPrefix}last_month_value as last_month_value,
      mp.${marketPrefix}last_month_value_sf as last_month_value_sf,
      mp.${marketPrefix}all_time_best_rank_sf as all_time_best_rank_sf,
      mp.${marketPrefix}all_time_best_rank as all_time_best_rank,
      mp.${marketPrefix}all_time_worst_rank_sf as all_time_worst_rank_sf,
      mp.${marketPrefix}all_time_worst_rank as all_time_worst_rank,
      mp.${marketPrefix}three_month_best_rank_sf as three_month_best_rank_sf,
      mp.${marketPrefix}three_month_best_rank as three_month_best_rank,
      mp.${marketPrefix}three_month_worst_rank_sf as three_month_worst_rank_sf,
      mp.${marketPrefix}three_month_worst_rank as three_month_worst_rank,
      mp.${marketPrefix}last_month_rank as last_month_rank,
      mp.${marketPrefix}last_month_rank_sf as last_month_rank_sf
  FROM
      ${table} mp;
  `);
  return data;
};

/**
 * Fetch values for a specific day in the past
 * @param {*} intervalDays number of days in the past
 */
// eslint-disable-next-line max-len
export const GetFantasyPortfolioForInterval = async (intervalDays, playerList) => {
  const data = await playersModel.selectQuery(`
    SELECT
        name_id,
        jsonb_agg(
            json_build_object(
                'date', created_at::date,
                'sf_trade_value', sf_trade_value,
                'trade_value', trade_value,
                'fc_sf_trade_value', fc_sf_trade_value,
                'fc_trade_value', fc_trade_value,
                'dp_sf_trade_value', dp_sf_trade_value,
                'dp_trade_value', dp_trade_value,
                'ds_sf_trade_value', ds_sf_trade_value,
                'ds_trade_value', ds_trade_value
            ) ORDER BY created_at::date
        ) AS player_data
    FROM
        player_values
    WHERE
        name_id IN ${playerList}
        AND created_at::date >= current_date - interval '${intervalDays} days'
    GROUP BY
        name_id
    `);
  return data;
};
