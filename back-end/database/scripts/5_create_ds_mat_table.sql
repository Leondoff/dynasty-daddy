-- create material view for dynasty superflex aggregates
DROP MATERIALIZED VIEW if EXISTS mat_vw_ds_player_values;

CREATE MATERIALIZED VIEW if not exists mat_vw_ds_player_values AS
Select
    *
From
    (
        WITH allTimeHighSFValue (name_id, ds_all_time_high_sf) as (
            select
                player_info.name_id as name_id,
                max(pv.ds_sf_trade_value) as ds_all_time_high_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeHighValue (name_id, ds_all_time_high) as (
            select
                player_info.name_id as name_id,
                max(pv.ds_trade_value) as ds_all_time_high
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeLowSFValue (name_id, ds_all_time_low_sf) as (
            select
                player_info.name_id as name_id,
                min(pv.ds_sf_trade_value) as ds_all_time_low_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeLowValue (name_id, ds_all_time_low) as (
            select
                player_info.name_id as name_id,
                min(pv.ds_trade_value) as ds_all_time_low
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        threeMonthHighSfValue (name_id, ds_three_month_high_sf) as (
            select
                player_info.name_id as name_id,
                max(pv.ds_sf_trade_value) as ds_three_month_high_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthHighValue (name_id, ds_three_month_high) as (
            select
                player_info.name_id as name_id,
                max(pv.ds_trade_value) as ds_three_month_high
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthLowSfValue (name_id, ds_three_month_low_sf) as (
            select
                player_info.name_id as name_id,
                min(pv.ds_sf_trade_value) as ds_three_month_low_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthLowValue (name_id, ds_three_month_low) as (
            select
                player_info.name_id as name_id,
                min(pv.ds_trade_value) as ds_three_month_low
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        allTimeBestSFRank (name_id, ds_all_time_best_rank_sf) as (
            select
                player_info.name_id as name_id,
                min(pv.ds_sf_position_rank) as ds_all_time_best_rank_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeBestRank (name_id, ds_all_time_best_rank) as (
            select
                player_info.name_id as name_id,
                min(pv.ds_position_rank) as ds_all_time_best_rank
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeWorstSFRank (name_id, ds_all_time_worst_rank_sf) as (
            select
                player_info.name_id as name_id,
                max(pv.ds_sf_position_rank) as ds_all_time_worst_rank_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        allTimeWorstRank (name_id, ds_all_time_worst_rank) as (
            select
                player_info.name_id as name_id,
                max(pv.ds_position_rank) as ds_all_time_worst_rank
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            group by
                player_info.name_id
        ),
        threeMonthBestSfRank (name_id, ds_three_month_best_rank_sf) as (
            select
                player_info.name_id as name_id,
                min(pv.ds_sf_position_rank) as ds_three_month_best_rank_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthBestRank (name_id, ds_three_month_best_rank) as (
            select
                player_info.name_id as name_id,
                min(pv.ds_position_rank) as ds_three_month_best_rank
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthWorstSfRank (name_id, ds_three_month_worst_rank_sf) as (
            select
                player_info.name_id as name_id,
                max(pv.ds_sf_position_rank) as ds_three_month_worst_rank_sf
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date > now() :: date - 90
            group by
                player_info.name_id
        ),
        threeMonthWorstRank (name_id, ds_three_month_worst_rank) as (
            select
                player_info.name_id as name_id,
                max(pv.ds_position_rank) as ds_three_month_worst_rank
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
            ds_last_month_value_sf,
            ds_last_month_value,
            ds_last_month_rank_sf,
            ds_last_month_rank
        ) as (
            select
                player_info.name_id as name_id,
                pv.ds_sf_trade_value as ds_last_month_value_sf,
                pv.ds_trade_value as ds_last_month_value,
                pv.ds_sf_position_rank as ds_last_month_rank_sf,
                pv.ds_position_rank as ds_last_month_rank
            from
                player_info
                left join player_values pv on player_info.name_id = pv.name_id
            WHERE
                pv.created_at :: date = now() :: date - 30
        )
        select
            distinct on (player_info.name_id) player_info.name_id,
            coalesce(pv.ds_trade_value, 0) as ds_trade_value,
            coalesce(pv.ds_sf_trade_value, 0) as ds_sf_trade_value,
            coalesce(pv.ds_sf_position_rank, null) as ds_sf_position_rank,
            coalesce(pv.ds_position_rank, null) as ds_position_rank,
            allTimeHighSFValue.ds_all_time_high_sf,
            allTimeBestSFRank.ds_all_time_best_rank_sf,
            allTimeHighValue.ds_all_time_high,
            allTimeBestRank.ds_all_time_best_rank,
            allTimeLowSFValue.ds_all_time_low_sf,
            allTimeWorstSFRank.ds_all_time_worst_rank_sf,
            allTimeLowValue.ds_all_time_low,
            allTimeWorstRank.ds_all_time_worst_rank,
            threeMonthHighSfValue.ds_three_month_high_sf,
            threeMonthBestSfRank.ds_three_month_best_rank_sf,
            threeMonthHighValue.ds_three_month_high,
            threeMonthBestRank.ds_three_month_best_rank,
            threeMonthLowSfValue.ds_three_month_low_sf,
            threeMonthWorstSfRank.ds_three_month_worst_rank_sf,
            threeMonthLowValue.ds_three_month_low,
            threeMonthWorstRank.ds_three_month_worst_rank,
            lastMonthValue.ds_last_month_value_sf,
            lastMonthValue.ds_last_month_rank_sf,
            lastMonthValue.ds_last_month_value,
            lastMonthValue.ds_last_month_rank
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
    ds_sf_trade_value desc WITH NO DATA;

CREATE UNIQUE INDEX ON mat_vw_ds_player_values (name_id);

REFRESH MATERIALIZED VIEW mat_vw_ds_player_values;
