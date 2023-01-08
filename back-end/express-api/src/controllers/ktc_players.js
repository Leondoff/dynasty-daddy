import Model from '../models/model';

const playersModel = new Model('players_info');

export const getCurrentPlayerValues = async (req, res) => {
  try {
    const data = await playersModel.selectQuery(
      'SELECT mp.name_id, mp.sleeper_id, mp.mfl_id, mp.full_name, mp.first_name, mp.last_name, mp.team, mp."position", mp.age, mp.experience, mp.injury_status, mp.trade_value, mp.sf_trade_value, mp.sf_position_rank, mp.position_rank, mp."date", mp.all_time_high_sf, mp.all_time_low_sf, mp.all_time_high, mp.all_time_low, mp.three_month_high_sf, mp.three_month_high, mp.three_month_low_sf, mp.three_month_low, mp.last_month_value, mp.last_month_value_sf, mp.most_recent_data_point, mp.avg_adp, mp.fantasypro_adp, mp.bb10_adp, mp.rtsports_adp, mp.underdog_adp, mp.drafters_adp,\n'
        + 'mvfpv.fc_trade_value,\n'
        + 'mvfpv.fc_sf_trade_value,\n'
        + 'mvfpv.fc_all_time_high_sf,\n'
        + 'mvfpv.fc_all_time_low_sf,\n'
        + 'mvfpv.fc_all_time_high,\n'
        + 'mvfpv.fc_all_time_low,\n'
        + 'mvfpv.fc_three_month_high_sf,\n'
        + 'mvfpv.fc_three_month_low_sf,\n'
        + 'mvfpv.fc_three_month_high,\n'
        + 'mvfpv.fc_three_month_low,\n'
        + 'mvfpv.fc_last_month_value_sf,\n'
        + 'mvfpv.fc_last_month_value\n'
        + 'FROM mat_vw_players mp inner join mat_vw_fc_player_values mvfpv on mvfpv.name_id = mp.name_id\n'
        +' order by sf_trade_value desc');
    res.status(200).json(data.rows);
  } catch (err) {
    res.status(405).json(err.stack);
  }
};

export const getPrevPlayerValues = async (req, res) => {
  try {
    const { intervalDays } = req.params || 30;
    const data = await playersModel.selectQuery(
      'select  player_info.name_id    as name_id,\n'
      + '                                               player_info.full_name  as full_name,\n'
      + '                                               pv.trade_value         as trade_value,\n'
      + '                                               pv.sf_trade_value      as sf_trade_value,\n'
      + '                                               pv.fc_sf_trade_value   as fc_sf_trade_value,\n'
      + '                                               pv.fc_trade_value      as fc_trade_value,\n'
      + '                                               pv.sf_position_rank    as sf_position_rank,\n'
      + '                                               pv.position_rank       as position_rank,\n'
      + '                                               pv.created_at          as date\n'
      + '      from player_info\n'
      + '               left join player_values pv on player_info.name_id = pv.name_id',
      ` WHERE pv.created_at::date = now()::date - ${intervalDays} order by pv.sf_trade_value desc `
    );
    res.status(200).json(data.rows.map(player =>
      (
        {
          name_id: player.name_id,
          full_name: player.full_name,
          sf_position_rank: player.sf_position_rank,
          position_rank: player.position_rank,
          sf_trade_value: player.sf_trade_value,
          trade_value: player.trade_value,
          date: player.date
        }
      )));
  } catch (err) {
    res.status(405).json(err.stack);
  }
};

/**
 * query to get player comp table datapoints
 * @param req
 * @param res
 * @return {Promise<void>}
 */
export const getHistoricalPlayerValueById = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAllTime } = req.query || 'false';
    // updated where to include all time data if specified
    const sqlClause = isAllTime === 'false' ? ` WHERE pv.name_id = '${id}' AND pv.created_at::date >= now()::date - 180` : ` WHERE pv.name_id = '${id}'`;
    const data = await playersModel.selectQuery('select  player_info.name_id    as name_id,\n'
      + '                                               player_info.full_name  as full_name,\n'
      + '                                               pv.trade_value         as trade_value,\n'
      + '                                               pv.sf_trade_value      as sf_trade_value,\n'
      + '                                               pv.fc_sf_trade_value   as fc_sf_trade_value,\n'
      + '                                               pv.fc_trade_value      as fc_trade_value,\n'
      + '                                               pv.sf_position_rank    as sf_position_rank,\n'
      + '                                               pv.position_rank       as position_rank,\n'
      + '                                               pv.created_at          as date\n'
      + '      from player_info\n'
      + '               left join player_values pv on player_info.name_id = pv.name_id', sqlClause);
    res.status(200).json(data.rows);
  } catch (err) {
    res.status(405).json(err.stack);
  }
};
