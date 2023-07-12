install.packages("nflreadr")

library(nflreadr)
options(nflreadr.verbose = FALSE)
library(dplyr)

# file_name <- "roster_all_years.csv"

# # Loop from 1999 to 2022
# for (year in 2001:1999) {
#   # Call the function and get the roster data
#   roster_data <- load_rosters(2002:2022)

#   # Select the desired columns (name and team)
#   selected_columns <- roster_data[, c("season", "full_name", "team", "position", "depth_chart_position", "gsis_id", "headshot_url", "jersey_number", "sleeper_id", "yahoo_id", "college")]
  
#   # Write the selected columns to the file in append mode without headers
#   write.table(selected_columns, file = file_name, append = TRUE, sep = ",")
  
#   # Print a message for each iteration
#   message(paste("Data for year", year, "has been written to", file_name))
# }

# load weekly roster stats for players
# aaa <- load_rosters_weekly(season = 2002:2022)

# selected_columns <- aaa[, c("season", "season", "full_name", "team", "position", "depth_chart_position", "gsis_id", "headshot_url", "jersey_number", "sleeper_id", "yahoo_id", "college")]


# # write rostered players to csv
# write.csv(selected_columns, "C:\\Users\\Jeremy\\Desktop\\test.csv", row.names=FALSE)

#manually add in 1999-2001 from the commented out section above

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
