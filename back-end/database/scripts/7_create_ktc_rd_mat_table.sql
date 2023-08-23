
-- create material view for fantasy calc aggregates
DROP MATERIALIZED VIEW if EXISTS mat_vw_ktc_rd_player_values;

CREATE MATERIALIZED VIEW if not exists mat_vw_ktc_rd_player_values AS
Select
    *
From
    (
        WITH allTimeHighSFValue (name_id, ktc_rd_all_time_high_sf) as (
            select
                player_info.name_id as name_id,
                max(pv.ktc_rd_sf_trade_value) as ktc_rd_all_time_high_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeHighValue (name_id, ktc_rd_all_time_high) as (
            select
                player_info.name_id as name_id,
                max(pv.ktc_rd_trade_value) as ktc_rd_all_time_high
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeLowSFValue (name_id, ktc_rd_all_time_low_sf) as (
            select
                player_info.name_id as name_id,
                min(pv.ktc_rd_sf_trade_value) as ktc_rd_all_time_low_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeLowValue (name_id, ktc_rd_all_time_low) as (
            select
                player_info.name_id as name_id,
                min(pv.ktc_rd_trade_value) as ktc_rd_all_time_low
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        threeMonthHighSfValue (name_id, ktc_rd_three_month_high_sf) as (
            select
                player_info.name_id as name_id,
                max(pv.ktc_rd_sf_trade_value) as ktc_rd_three_month_high_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthHighValue (name_id, ktc_rd_three_month_high) as (
            select
                player_info.name_id as name_id,
                max(pv.ktc_rd_trade_value) as ktc_rd_three_month_high
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthLowSfValue (name_id, ktc_rd_three_month_low_sf) as (
            select
                player_info.name_id as name_id,
                min(pv.ktc_rd_sf_trade_value) as ktc_rd_three_month_low_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthLowValue (name_id, ktc_rd_three_month_low) as (
            select
                player_info.name_id as name_id,
                min(pv.ktc_rd_trade_value) as ktc_rd_three_month_low
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        allTimeBestSFRank (name_id, ktc_rd_all_time_best_rank_sf) as (
            select
                player_info.name_id as name_id,
                min(pv.ktc_rd_sf_position_rank) as ktc_rd_all_time_best_rank_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeBestRank (name_id, ktc_rd_all_time_best_rank) as (
            select
                player_info.name_id as name_id,
                min(pv.ktc_rd_position_rank) as ktc_rd_all_time_best_rank
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeWorstSFRank (name_id, ktc_rd_all_time_worst_rank_sf) as (
            select
                player_info.name_id as name_id,
                max(pv.ktc_rd_sf_position_rank) as ktc_rd_all_time_worst_rank_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeWorstRank (name_id, ktc_rd_all_time_worst_rank) as (
            select
                player_info.name_id as name_id,
                max(pv.ktc_rd_position_rank) as ktc_rd_all_time_worst_rank
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        threeMonthBestSfRank (name_id, ktc_rd_three_month_best_rank_sf) as (
            select
                player_info.name_id as name_id,
                min(pv.ktc_rd_sf_position_rank) as ktc_rd_three_month_best_rank_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthBestRank (name_id, ktc_rd_three_month_best_rank) as (
            select
                player_info.name_id as name_id,
                min(pv.ktc_rd_position_rank) as ktc_rd_three_month_best_rank
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthWorstSfRank (name_id, ktc_rd_three_month_worst_rank_sf) as (
            select
                player_info.name_id as name_id,
                max(pv.ktc_rd_sf_position_rank) as ktc_rd_three_month_worst_rank_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthWorstRank (name_id, ktc_rd_three_month_worst_rank) as (
            select
                player_info.name_id as name_id,
                max(pv.ktc_rd_position_rank) as ktc_rd_three_month_worst_rank
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        lastMonthValue (
            name_id,
            ktc_rd_last_month_value_sf,
            ktc_rd_last_month_value,
            ktc_rd_last_month_rank_sf,
            ktc_rd_last_month_rank
        ) as (
            select
                player_info.name_id as name_id,
                pv.ktc_rd_sf_trade_value as ktc_rd_last_month_value_sf,
                pv.ktc_rd_trade_value as ktc_rd_last_month_value,
                pv.ktc_rd_sf_position_rank as ktc_rd_last_month_rank_sf,
                pv.ktc_rd_position_rank as ktc_rd_last_month_rank
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date = now() :: date - 30
        )
        select
            distinct on (player_info.name_id) player_info.name_id,
            coalesce(pv.ktc_rd_trade_value, 0) as ktc_rd_trade_value,
            coalesce(pv.ktc_rd_sf_trade_value, 0) as ktc_rd_sf_trade_value,
            coalesce(pv.ktc_rd_sf_position_rank, null) as ktc_rd_sf_position_rank,
            coalesce(pv.ktc_rd_position_rank, null) as ktc_rd_position_rank,
            allTimeHighSFValue.ktc_rd_all_time_high_sf,
            allTimeBestSFRank.ktc_rd_all_time_best_rank_sf,
            allTimeHighValue.ktc_rd_all_time_high,
            allTimeBestRank.ktc_rd_all_time_best_rank,
            allTimeLowSFValue.ktc_rd_all_time_low_sf,
            allTimeWorstSFRank.ktc_rd_all_time_worst_rank_sf,
            allTimeLowValue.ktc_rd_all_time_low,
            allTimeWorstRank.ktc_rd_all_time_worst_rank,
            threeMonthHighSfValue.ktc_rd_three_month_high_sf,
            threeMonthBestSfRank.ktc_rd_three_month_best_rank_sf,
            threeMonthHighValue.ktc_rd_three_month_high,
            threeMonthBestRank.ktc_rd_three_month_best_rank,
            threeMonthLowSfValue.ktc_rd_three_month_low_sf,
            threeMonthWorstSfRank.ktc_rd_three_month_worst_rank_sf,
            threeMonthLowValue.ktc_rd_three_month_low,
            threeMonthWorstRank.ktc_rd_three_month_worst_rank,
            lastMonthValue.ktc_rd_last_month_value_sf,
            lastMonthValue.ktc_rd_last_month_rank_sf,
            lastMonthValue.ktc_rd_last_month_value,
            lastMonthValue.ktc_rd_last_month_rank
        from
            player_info
            left join player_values pv on player_info.name_id = pv.name_id
            and pv.created_at > now() :: date - 1
            left join allTimeHighSFValue on allTimeHighSFValue.name_id = player_info.name_id
            left join allTimeHighValue on allTimeHighValue.name_id = player_info.name_id
            left join allTimeLowSFValue on allTimeLowSFValue.name_id = player_info.name_id
            left join allTimeLowValue on allTimeLowValue.name_id = player_info.name_id
            left join threeMonthHighSfValue on threeMonthHighSfValue.name_id = player_info.name_id
            left join threeMonthHighValue on threeMonthHighValue.name_id = player_info.name_id
            left join threeMonthLowSfValue on threeMonthLowSfValue.name_id = player_info.name_id
            left join threeMonthLowValue on threeMonthLowValue.name_id = player_info.name_id
            left join allTimeBestSfRank on allTimeBestSfRank.name_id = player_info.name_id
            left join allTimeBestRank on allTimeBestRank.name_id = player_info.name_id
            left join allTimeWorstSfRank on allTimeWorstSfRank.name_id = player_info.name_id
            left join allTimeWorstRank on allTimeWorstRank.name_id = player_info.name_id
            left join threeMonthBestSfRank on threeMonthBestSfRank.name_id = player_info.name_id
            left join threeMonthBestRank on threeMonthBestRank.name_id = player_info.name_id
            left join threeMonthWorstSfRank on threeMonthWorstSfRank.name_id = player_info.name_id
            left join threeMonthWorstRank on threeMonthWorstRank.name_id = player_info.name_id
            left join lastMonthValue on lastMonthValue.name_id = player_info.name_id
        where
            player_info.active is not false
            and player_info.position in ('QB', 'WR', 'TE', 'RB') 
        order by
            player_info.name_id,
            pv.id desc
    ) as T
order by
    ktc_rd_sf_trade_value desc WITH NO DATA;

CREATE UNIQUE INDEX ON mat_vw_ktc_rd_player_values (name_id);

REFRESH MATERIALIZED VIEW mat_vw_ktc_rd_player_values;
