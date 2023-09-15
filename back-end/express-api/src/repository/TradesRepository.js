import Model from '../models/model';

const playersModel = new Model('trades');

export const FetchTrades = async (tradeInfo) => {
  const {
    sideA,
    sideB,
    isSuperflex,
    starters,
    teams,
    leagueType,
    ppr,
    tep,
    page,
    pageLength
  } = tradeInfo;

  // Calculate the offset to paginate results
  const offset = (page - 1) * pageLength;

  // Build the SQL query based on your search criteria
  const query = `
    SELECT *
    FROM trades t
    JOIN league_info l ON t.league_id = l. league_id
    WHERE
      (
        (ARRAY_LENGTH($1::text[], 1) = 0 AND ARRAY_LENGTH($2::text[], 1) = 0) OR
        (ARRAY[$1] <@ ARRAY[t.sideA] AND ARRAY[$2] <@ ARRAY[t.sideB]) OR
        (ARRAY[$1] <@ ARRAY[t.sideB] AND ARRAY[$2] <@ ARRAY[t.sideA])
      )
      AND (COALESCE($3::boolean[], ARRAY[]::boolean[]) = ARRAY[]::boolean[] OR l.is_superflex = ANY($3::boolean[]))
      AND (COALESCE($4::integer[], ARRAY[]::integer[]) = ARRAY[]::integer[] OR l.starters = ANY($4::integer[]))
      AND (COALESCE($5::integer[], ARRAY[]::integer[]) = ARRAY[]::integer[] OR l.teams = ANY($5::integer[]))
      AND (($6::text IS NULL) OR l.league_type::text = $6::league_type_v2::text)
      AND (COALESCE($7::decimal[], ARRAY[]::decimal[]) = ARRAY[]::decimal[] OR l.ppr = ANY($7::decimal[]))
      AND (COALESCE($8::decimal[], ARRAY[]::decimal[]) = ARRAY[]::decimal[] OR l.tep = ANY($8::decimal[]))
    ORDER BY transaction_date DESC
    LIMIT $9
    OFFSET $10
      `;

  // Execute the query
  const results = await playersModel.pool.query(query, [
    sideA,
    sideB,
    isSuperflex,
    starters,
    teams,
    leagueType,
    ppr,
    tep,
    pageLength,
    offset,
  ]);
  return results.rows;
};

export const GetTradeDetailsForPlayer = async (playerId) => {
  const query = `
    WITH PlayerTrades AS (
      SELECT trades.*,
            l.*,
            pi.sleeper_id as playerId
      FROM trades
      LEFT JOIN player_ids pi ON '${playerId}' = pi.name_id
      LEFT JOIN league_info l ON trades.league_id = l. league_id
      WHERE
          pi.sleeper_id = ANY(sideA) OR pi.sleeper_id = ANY(sideB)
      ORDER BY transaction_date DESC
      LIMIT 10
  )

  , TradeAgg AS (
      SELECT
          JSON_AGG(json_build_object(
              'count', mvta.count,
              'week_interval', mvta.week_interval,
              'rank', mvta.rank,
              'position_rank', mvta.position_rank
          )) AS mat_vw_trade_agg
      FROM mat_vw_trade_agg mvta
      WHERE mvta.id IN (SELECT playerId FROM PlayerTrades)
  )

  SELECT
      JSON_AGG(pt.*) AS PlayerTrades,
      (SELECT mat_vw_trade_agg FROM TradeAgg) AS mat_vw_trade_agg
  FROM PlayerTrades pt;
  `;

  const data = await playersModel.pool.query(query);
  return data.rows;
};

export const FetchRecentTradeVolume = async () => {
  const query = `
    SELECT * from mat_vw_trade_agg
      WHERE week_interval = 1;
  `;

  const data = await playersModel.pool.query(query);
  return data.rows;
};
