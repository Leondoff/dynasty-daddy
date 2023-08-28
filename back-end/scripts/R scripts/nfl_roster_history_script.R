install.packages("tidyverse", type = "binary")
install.packages("ggrepel", type = "binary")
install.packages("nflreadr", type = "binary")
install.packages("nflplotR", type = "binary")
install.packages("nflfastR", type = "binary")
install.packages("gsisdecoder", type = "binary")

library(nflreadr)
# options(nflreadr.verbose = FALSE)
library(nflfastR)
# library(ggrepel)
# library(nflplotR)
# library(dplyr)

# file_name <- "roster_all_years.csv"

# load weekly roster stats for players
aaa <- load_rosters_weekly(season = 2002:2023)

selected_columns <- aaa[, c("season", "season", "full_name", "team", "position", "depth_chart_position", "gsis_id", "headshot_url", "jersey_number", "sleeper_id", "yahoo_id", "college")]

# write rostered players to csv
write.csv(selected_columns, "C:\\Users\\Jeremy\\Desktop\\roster.csv", row.names=FALSE)

try({# to avoid CRAN test problems
  pbp <- load_pbp(season = 1999:2022)
  weekly <- calculate_player_stats_def(pbp, weekly = TRUE)

  grouped_data_def <- weekly %>% group_by(player_id, season)
  summed_data_def <- grouped_data_def %>% 
  summarise(
    sum_def_tackles = sum(def_tackles + def_tackle_assists, na.rm = TRUE),
    sum_forced_fum = sum(def_fumbles_forced, na.rm = TRUE),
    sum_def_sacks = sum(def_sacks, na.rm = TRUE),
    sum_def_interceptions = sum(def_interceptions, na.rm = TRUE),
    sum_def_tds = sum(def_tds, na.rm = TRUE),
    sum_def_safety = sum(def_safety, na.rm = TRUE),
    max_def_tackles = max(def_tackles + def_tackle_assists, na.rm = TRUE),
    max_forced_fum = max(def_fumbles_forced, na.rm = TRUE),
    max_def_sacks = max(def_sacks, na.rm = TRUE),
    max_def_interceptions = max(def_interceptions, na.rm = TRUE),
    max_def_tds = max(def_tds, na.rm = TRUE),
    has_1_sack_int = any(def_sacks >= 1 & def_interceptions >= 1),
  )
  # write.csv(weekly, "C:\\Users\\Jeremy\\Desktop\\def_stats.csv", row.names=FALSE)
  write.csv(summed_data_def, "C:\\Users\\Jeremy\\Desktop\\def_cat_stats.csv", row.names=FALSE)
})

# NFL Stats spreadsheet for thresholds
player_data <- load_player_stats(season = 1999:2022)

# Group the filtered data by season and calculate the sum of passing yards and passing TDs
grouped_data <- player_data %>% group_by(player_id, season)
summed_data <- grouped_data %>% 
  summarise(
    sum_rushing_yards = sum(rushing_yards, na.rm = TRUE),
    sum_rushing_tds = sum(rushing_tds, na.rm = TRUE),
    sum_receiving_yards = sum(receiving_yards, na.rm = TRUE),
    sum_receiving_tds = sum(receiving_tds, na.rm = TRUE),
    sum_interceptions = sum(interceptions, na.rm = TRUE),
    sum_passing_yards = sum(passing_yards, na.rm = TRUE),
    sum_passing_tds = sum(passing_tds, na.rm = TRUE),
    sum_receptions = sum(receptions, na.rm = TRUE),
    sum_special_teams_tds = sum(special_teams_tds, na.rm = TRUE),
    max_passing_tds = max(passing_tds, na.rm = TRUE),
    max_rushing_tds = max(rushing_tds, na.rm = TRUE),
    max_receiving_tds = max(receiving_tds, na.rm = TRUE),
    max_interceptions = max(interceptions, na.rm = TRUE),
    max_passing_yds = max(passing_yards, na.rm = TRUE),
    max_rushing_yds = max(rushing_yards, na.rm = TRUE),
    max_receiving_yds = max(receiving_yards, na.rm = TRUE),
    max_receptions = max(receptions, na.rm = TRUE),
    has_70_rushing_receiving = any(rushing_yards >= 70 & receiving_yards >= 70),
    has_50_rushing_200_passing = any(rushing_yards >= 50 & passing_yards >= 200),
    has_1_rushing_receiving_td = any(rushing_tds >= 1 & receiving_tds >= 1),
    has_1_passing_receiving_td = any(receiving_tds >= 1 & passing_tds >= 1),
    has_3_passing_1_rushing_td = any(rushing_tds >= 1 & passing_tds >= 3),
  )

write.csv(summed_data, "C:\\Users\\Jeremy\\Desktop\\stats.csv", row.names=FALSE)

# Create super bowl data
# superbowlData <- data.frame(
#   Year = c("2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2011", "2010", "2009", "2008", "2007", "2006", "2005", "2004", "2003", "2002", "2001", "2000"),
#   Winner = c("KC", "LA", "TB", "KC", "NE", "PHI", "NE", "DEN", "NE", "SEA", "BAL", "NYG", "GB", "NO", "PIT", "NYG", "IND", "PIT", "NE", "NE", "TB", "NE", "BAL", "LA")
# )

# dict <- setNames(superbowlData$Winner, superbowlData$Year)

# roster_data <- list()
# for (key in names(dict)) {
#   value <- dict[[key]]
#   data <- load_rosters(as.numeric(key) - 1)
#   matching_rosters <- data[data$team == value, ]
#   roster_data <- rbind(roster_data, matching_rosters, fill=TRUE)
# }


# write.csv(roster_data, "C:\\Users\\Jeremy\\Desktop\\superbowl.csv", row.names=FALSE)
