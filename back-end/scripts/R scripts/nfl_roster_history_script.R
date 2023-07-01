install.packages("nflreadr")

library(nflreadr)
options(nflreadr.verbose = FALSE)

# Loop from 1999 to 2022
for (year in 1999:2022) {
  # Create the file name with the year
  file_name <- paste0("roster_", year, ".csv")
  
  # Call the function and write to the file
  write.csv(load_rosters(year), file_name, row.names = FALSE)
  
  # Print a message for each iteration
  message(paste("Data for year", year, "has been written to", file_name))
}