-- create material view for player values and initialize data
DROP MATERIALIZED VIEW if EXISTS mat_vw_players;

CREATE MATERIALIZED VIEW if not exists mat_vw_players AS
Select
    *
From
    (
        WITH mostRecentDataPoint (name_id, most_recent_data_point) as (
            select
                player_info.name_id as name_id,
                max(pv.created_at) as most_recent_data_point
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        )
        select
            distinct on (player_info.name_id) player_info.name_id as name_id,
            pi.sleeper_id as sleeper_id,
            pi.mfl_id,
            pi.ff_id,
            pi.espn_id,
            pi.yahoo_id,
            player_info.full_name as full_name,
            player_info.first_name as first_name,
            player_info.last_name as last_name,
            player_info.team as team,
            player_info.position as position,
            player_info.age as age,
            player_info.experience as experience,
            player_info.injury_status as injury_status,
            pv.created_at as date,
            mostRecentDataPoint.most_recent_data_point,
            pa.avg_adp,
            pa.fantasyPro_adp,
            pa.bb10_adp,
            pa.rtsports_adp,
            pa.underdog_adp,
            pa.drafters_adp
        from
            player_info
            left join player_values pv on player_info.name_id = pv.name_id
            and pv.created_at > now() :: date - 1
            left join player_ids pi on player_info.name_id = pi.name_id
            left join mostRecentDataPoint on mostRecentDataPoint.name_id = player_info.name_id
            left join player_adp pa on pa.name_id = player_info.name_id
            and pa.updated_at > now() :: date - 1
        where
            player_info.active is not false
        order by
            player_info.name_id,
            pv.id desc
    ) as T
order by
    sf_trade_value asc WITH NO DATA;

CREATE UNIQUE INDEX ON mat_vw_players (name_id);

REFRESH MATERIALIZED VIEW mat_vw_players;
