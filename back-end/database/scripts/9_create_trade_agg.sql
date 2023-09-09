CREATE MATERIALIZED VIEW mat_vw_trade_agg AS
WITH combined AS (
    SELECT unnest(sideA) AS id, transaction_date
    FROM trades
    UNION ALL
    SELECT unnest(sideB) AS id, transaction_date
    FROM trades
),
weekly_counts AS (
    SELECT
        CASE
            WHEN transaction_date >= (now() - interval '7 days') THEN 1
            WHEN transaction_date >= (now() - interval '14 days') THEN 2
            WHEN transaction_date >= (now() - interval '21 days') THEN 3
            WHEN transaction_date >= (now() - interval '28 days') THEN 4
            WHEN transaction_date >= (now() - interval '35 days') THEN 5
            WHEN transaction_date >= (now() - interval '42 days') THEN 6
            WHEN transaction_date >= (now() - interval '49 days') THEN 7
            WHEN transaction_date >= (now() - interval '56 days') THEN 8
            ELSE 9
        END AS week_interval,
        id,
        COUNT(*) AS count
    FROM
        combined
    WHERE
        transaction_date >= (now() - interval '56 days') AND
        id NOT LIKE '%pi'
    GROUP BY
        week_interval, id
),
player_info AS (
	SELECT DISTINCT ON (sleeper_id)
	    sleeper_id,
	    position
	FROM
	    (
	    SELECT
	        sleeper_id,
	        position
	    FROM
	        mat_vw_players
	    UNION ALL
	    SELECT
	        sleeper_id,
	        position
	    FROM
	        mat_vw_def_players
	    ) AS combined
	),
ranked_weekly_counts AS (
    SELECT
        week_interval,
        id,
        count,
        RANK() OVER (PARTITION BY week_interval ORDER BY count DESC) AS rank,
        p.position,
        RANK() OVER (PARTITION BY week_interval, p.position ORDER BY count DESC) AS position_rank
    FROM
        weekly_counts w
    INNER JOIN
        player_info p
    ON
        w.id = p.sleeper_id
)
SELECT
    week_interval,
    id,
    count,
    rank,
    position,
    position_rank
FROM
    ranked_weekly_counts
ORDER BY
    week_interval, rank;

-- Create a unique index on the materialized view
CREATE UNIQUE INDEX idx_unique_mat_vw_trade_agg
ON mat_vw_trade_agg (week_interval, id);

REFRESH MATERIALIZED VIEW mat_vw_trade_agg;