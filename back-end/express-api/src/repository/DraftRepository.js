import Model from '../models/model';

const playersModel = new Model('trades');

export const FetchDraftADP = async (draftADPFilters) => {
  const {
    playerType,
    isSuperflex,
    starters,
    teams,
    leagueType,
    ppr,
    tep,
    startedAt,
    endedAt,
    isIDP,
    isAuction
  } = draftADPFilters;

  const draftTotalQuery = `
    SELECT COUNT(DISTINCT draft_id) AS total_drafts_count
    FROM league_drafts ld
    INNER JOIN league_info li on li.league_id = ld.league_id
    WHERE
    ld.is_scraped = true
    and ld.player_type = $1
    and li.is_superflex = ${isSuperflex}
          AND (COALESCE($2::integer[], ARRAY[]::integer[]) = ARRAY[]::integer[] OR li.starters = ANY($2::integer[]))
          AND (COALESCE($3::integer[], ARRAY[]::integer[]) = ARRAY[]::integer[] OR li.teams = ANY($3::integer[]))
          AND (($4::text IS NULL) OR li.league_type::text = $4::league_type_v2::text)
          AND (COALESCE($5::decimal[], ARRAY[]::decimal[]) = ARRAY[]::decimal[] OR li.ppr = ANY($5::decimal[]))
          AND (COALESCE($6::decimal[], ARRAY[]::decimal[]) = ARRAY[]::decimal[] OR li.tep = ANY($6::decimal[]))
    and ld.ended_at BETWEEN $7 AND $8
    AND ld.is_idp = ${isIDP}
    AND (
      (${isAuction} AND ld.draft_type = 'auction')
      OR (NOT ${isAuction} AND ld.draft_type != 'auction')
    )
  `;

  // Build the SQL query based on your search criteria
  const query = `
    SELECT ldp.player_id,
     AVG(ldp.pick_no) AS average_adp,
     COUNT(*) as count,
      AVG(
        CASE 
            WHEN ${isAuction} THEN ldp.budget_ratio
            ELSE NULL 
        END
    ) AS average_budget_ratio
    FROM league_draft_picks ldp
    inner join league_drafts ld on ld.draft_id = ldp.draft_id
    inner join league_info li on li.league_id = ld.league_id
    where 
    ld.player_type = $1
    and li.is_superflex = ${isSuperflex}
          AND (COALESCE($2::integer[], ARRAY[]::integer[]) = ARRAY[]::integer[] OR li.starters = ANY($2::integer[]))
          AND (COALESCE($3::integer[], ARRAY[]::integer[]) = ARRAY[]::integer[] OR li.teams = ANY($3::integer[]))
          AND (($4::text IS NULL) OR li.league_type::text = $4::league_type_v2::text)
          AND (COALESCE($5::decimal[], ARRAY[]::decimal[]) = ARRAY[]::decimal[] OR li.ppr = ANY($5::decimal[]))
          AND (COALESCE($6::decimal[], ARRAY[]::decimal[]) = ARRAY[]::decimal[] OR li.tep = ANY($6::decimal[]))
    and ld.ended_at BETWEEN $7 AND $8
    AND ld.is_idp = ${isIDP}
    AND (
      (${isAuction} AND ld.draft_type = 'auction')
      OR (NOT ${isAuction} AND ld.draft_type != 'auction')
    )
    GROUP BY player_id
      HAVING 
    COUNT(*) >= 5;
  `;

  const totalDrafts = await playersModel.pool.query(draftTotalQuery, [
    playerType,
    starters,
    teams,
    leagueType,
    ppr,
    tep,
    startedAt,
    endedAt
  ]);

  // Execute the query
  const results = await playersModel.pool.query(query, [
    playerType,
    starters,
    teams,
    leagueType,
    ppr,
    tep,
    startedAt,
    endedAt,
  ]);
  return { total: totalDrafts.rows[0]?.total_drafts_count || 0, adps: results.rows };
};

export const FetchDraftADPDetails = async (draftADPFilters) => {
  const {
    playerType,
    isSuperflex,
    starters,
    teams,
    leagueType,
    ppr,
    tep,
    startedAt,
    endedAt,
    sleeperId,
    isIDP,
    isAuction
  } = draftADPFilters;

  const query = `
      SELECT 
      ldp.player_id,
      ldp.pick_no,
      ldp.budget_ratio,
      ldp.auction_amount,
      ld.ended_at,
      li.teams,
      li.starters,
      li.tep,
      li.ppr
    FROM 
      league_draft_picks ldp
    INNER JOIN 
      league_drafts ld ON ld.draft_id = ldp.draft_id
    INNER JOIN 
      league_info li ON li.league_id = ld.league_id
    WHERE 
      ldp.player_id = $9
      AND ld.player_type = $1
      and li.is_superflex = ${isSuperflex}
            AND (COALESCE($2::integer[], ARRAY[]::integer[]) = ARRAY[]::integer[] OR li.starters = ANY($2::integer[]))
            AND (COALESCE($3::integer[], ARRAY[]::integer[]) = ARRAY[]::integer[] OR li.teams = ANY($3::integer[]))
            AND (($4::text IS NULL) OR li.league_type::text = $4::league_type_v2::text)
            AND (COALESCE($5::decimal[], ARRAY[]::decimal[]) = ARRAY[]::decimal[] OR li.ppr = ANY($5::decimal[]))
            AND (COALESCE($6::decimal[], ARRAY[]::decimal[]) = ARRAY[]::decimal[] OR li.tep = ANY($6::decimal[]))
      and ld.ended_at BETWEEN $7 AND $8
      AND ld.is_idp = ${isIDP}
      AND (
        (${isAuction} AND ld.draft_type = 'auction')
        OR (NOT ${isAuction} AND ld.draft_type != 'auction')
      )
  `;

  // Execute the query
  const results = await playersModel.pool.query(query, [
    playerType,
    starters,
    teams,
    leagueType,
    ppr,
    tep,
    startedAt,
    endedAt,
    sleeperId,
  ]);
  return results.rows;
};
