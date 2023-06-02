
-- create material view for fantasy calc aggregates
DROP MATERIALIZED VIEW if EXISTS mat_vw_fc_player_values;

CREATE MATERIALIZED VIEW if not exists mat_vw_fc_player_values AS
Select
    *
From
    (
        WITH allTimeHighSFValue (name_id, fc_all_time_high_sf) as (
            select
                player_info.name_id as name_id,
                max(pv.fc_sf_trade_value) as fc_all_time_high_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeHighValue (name_id, fc_all_time_high) as (
            select
                player_info.name_id as name_id,
                max(pv.fc_trade_value) as fc_all_time_high
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeLowSFValue (name_id, fc_all_time_low_sf) as (
            select
                player_info.name_id as name_id,
                min(pv.fc_sf_trade_value) as fc_all_time_low_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeLowValue (name_id, fc_all_time_low) as (
            select
                player_info.name_id as name_id,
                min(pv.fc_trade_value) as fc_all_time_low
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        threeMonthHighSfValue (name_id, fc_three_month_high_sf) as (
            select
                player_info.name_id as name_id,
                max(pv.fc_sf_trade_value) as fc_three_month_high_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthHighValue (name_id, fc_three_month_high) as (
            select
                player_info.name_id as name_id,
                max(pv.fc_trade_value) as fc_three_month_high
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthLowSfValue (name_id, fc_three_month_low_sf) as (
            select
                player_info.name_id as name_id,
                min(pv.fc_sf_trade_value) as fc_three_month_low_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthLowValue (name_id, fc_three_month_low) as (
            select
                player_info.name_id as name_id,
                min(pv.fc_trade_value) as fc_three_month_low
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        allTimeBestSFRank (name_id, fc_all_time_best_rank_sf) as (
            select
                player_info.name_id as name_id,
                min(pv.fc_sf_position_rank) as fc_all_time_best_rank_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeBestRank (name_id, fc_all_time_best_rank) as (
            select
                player_info.name_id as name_id,
                min(pv.fc_position_rank) as fc_all_time_best_rank
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeWorstSFRank (name_id, fc_all_time_worst_rank_sf) as (
            select
                player_info.name_id as name_id,
                max(pv.fc_sf_position_rank) as fc_all_time_worst_rank_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeWorstRank (name_id, fc_all_time_worst_rank) as (
            select
                player_info.name_id as name_id,
                max(pv.fc_position_rank) as fc_all_time_worst_rank
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        threeMonthBestSfRank (name_id, fc_three_month_best_rank_sf) as (
            select
                player_info.name_id as name_id,
                min(pv.fc_sf_position_rank) as fc_three_month_best_rank_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthBestRank (name_id, fc_three_month_best_rank) as (
            select
                player_info.name_id as name_id,
                min(pv.fc_position_rank) as fc_three_month_best_rank
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthWorstSfRank (name_id, fc_three_month_worst_rank_sf) as (
            select
                player_info.name_id as name_id,
                max(pv.fc_sf_position_rank) as fc_three_month_worst_rank_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthWorstRank (name_id, fc_three_month_worst_rank) as (
            select
                player_info.name_id as name_id,
                max(pv.fc_position_rank) as fc_three_month_worst_rank
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
            fc_last_month_value_sf,
            fc_last_month_value,
            fc_last_month_rank_sf,
            fc_last_month_rank
        ) as (
            select
                player_info.name_id as name_id,
                pv.fc_sf_trade_value as fc_last_month_value_sf,
                pv.fc_trade_value as fc_last_month_value,
                pv.fc_sf_position_rank as fc_last_month_rank_sf,
                pv.fc_position_rank as fc_last_month_rank
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date = now() :: date - 30
        )
        select
            distinct on (player_info.name_id) player_info.name_id,
            coalesce(pv.fc_trade_value, 0) as fc_trade_value,
            coalesce(pv.fc_sf_trade_value, 0) as fc_sf_trade_value,
            coalesce(pv.fc_sf_position_rank, null) as fc_sf_position_rank,
            coalesce(pv.fc_position_rank, null) as fc_position_rank,
            allTimeHighSFValue.fc_all_time_high_sf,
            allTimeBestSFRank.fc_all_time_best_rank_sf,
            allTimeHighValue.fc_all_time_high,
            allTimeBestRank.fc_all_time_best_rank,
            allTimeLowSFValue.fc_all_time_low_sf,
            allTimeWorstSFRank.fc_all_time_worst_rank_sf,
            allTimeLowValue.fc_all_time_low,
            allTimeWorstRank.fc_all_time_worst_rank,
            threeMonthHighSfValue.fc_three_month_high_sf,
            threeMonthBestSfRank.fc_three_month_best_rank_sf,
            threeMonthHighValue.fc_three_month_high,
            threeMonthBestRank.fc_three_month_best_rank,
            threeMonthLowSfValue.fc_three_month_low_sf,
            threeMonthWorstSfRank.fc_three_month_worst_rank_sf,
            threeMonthLowValue.fc_three_month_low,
            threeMonthWorstRank.fc_three_month_worst_rank,
            lastMonthValue.fc_last_month_value_sf,
            lastMonthValue.fc_last_month_rank_sf,
            lastMonthValue.fc_last_month_value,
            lastMonthValue.fc_last_month_rank
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
        order by
            player_info.name_id,
            pv.id desc
    ) as T
order by
    fc_sf_trade_value desc WITH NO DATA;

CREATE UNIQUE INDEX ON mat_vw_fc_player_values (name_id);

REFRESH MATERIALIZED VIEW mat_vw_fc_player_values;
