# manual script for scraping flea flicker rosters to csvs in order to map player ids
install.packages("ffscrapr")

library(ffscrapr)
library(dplyr)
library(tidyr)

# load league from flea flicker
aaa <- fleaflicker_connect(season = 2022, league_id = 312861)

# write rostered players to csv
write.csv(ff_rosters(aaa), "C:\\Users\\Jeremy\\Desktop\\People.csv", row.names=FALSE)
