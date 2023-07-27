-- create material view for non offense players and initialize data
DROP MATERIALIZED VIEW if EXISTS mat_vw_def_players;

CREATE MATERIALIZED VIEW if not exists mat_vw_def_players AS
    SELECT DISTINCT ON (player_info.name_id) 
        player_info.name_id as name_id,
        pi.sleeper_id as sleeper_id,
        pi.mfl_id,
        pi.ff_id,
        pi.espn_id,
        pi.ffpc_id,
        pi.yahoo_id,
        player_info.full_name as full_name,
        player_info.first_name as first_name,
        player_info.last_name as last_name,
        player_info.team as team,
        player_info.position as position,
        player_info.age as age,
        player_info.experience as experience,
        player_info.injury_status as injury_status
    FROM player_info
    LEFT JOIN player_ids pi on player_info.name_id = pi.name_id
    WHERE player_info.active is not false
        and (player_info.team is not null or player_info.position = 'DF')
        AND player_info.position not in ('QB', 'WR', 'TE', 'RB', 'PI');


CREATE UNIQUE INDEX ON mat_vw_def_players (name_id);

REFRESH MATERIALIZED VIEW mat_vw_def_players;