install.packages("nflreadr")

library(nflreadr)
options(nflreadr.verbose = FALSE)

file_name <- "roster_all_years.csv"

# Loop from 1999 to 2022
for (year in 2022:1999) {
  # Call the function and get the roster data
  roster_data <- load_rosters(year)

  # Select the desired columns (name and team)
  selected_columns <- roster_data[, c("season", "full_name", "team", "position", "depth_chart_position", "gsis_id", "headshot_url", "jersey_number", "sleeper_id", "yahoo_id", "college")]
  
  # Write the selected columns to the file in append mode without headers
  write.table(selected_columns, file = file_name, append = TRUE, sep = ",")
  
  # Print a message for each iteration
  message(paste("Data for year", year, "has been written to", file_name))
}