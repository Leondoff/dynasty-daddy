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
aaa <- load_rosters_weekly(season = 2002:2022)

selected_columns <- aaa[, c("season", "season", "full_name", "team", "position", "depth_chart_position", "gsis_id", "headshot_url", "jersey_number", "sleeper_id", "yahoo_id", "college")]


# write rostered players to csv
write.csv(selected_columns, "C:\\Users\\Jeremy\\Desktop\\test.csv", row.names=FALSE)

#manually add in 1999-2001 from the commented out section above

# NFL Stats spreadsheet for thresholds
player_data <- load_player_stats(season = 1999:2022)

# Group the filtered data by season and calculate the sum of passing yards and passing TDs
grouped_data <- player_data %>% group_by(player_id, season)
summed_data <- grouped_data %>% summarise(rushing_yards = sum(rushing_yards, na.rm = TRUE),
                                          rushing_tds = sum(rushing_tds, na.rm = TRUE),
                                          receiving_yards = sum(receiving_yards, na.rm = TRUE),
                                          receiving_tds = sum(receiving_tds, na.rm = TRUE),
                                          interceptions = sum(interceptions, na.rm = TRUE),
                                          passing_yards = sum(passing_yards, na.rm = TRUE),
                                          passing_tds = sum(passing_tds, na.rm = TRUE))

write.csv(summed_data, "C:\\Users\\Jeremy\\Desktop\\stats.csv", row.names=FALSE)
