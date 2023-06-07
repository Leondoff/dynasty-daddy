/**
 * Format singular league data for response
 */
export const formatSingularLeague = async (league) =>
  ({
    league_id: league.league_id,
    franchise_id: league.franchise_id,
    name: league.name,
    url: league.url
  });

/**
 * Format leagues response into formatted response
 */
export const FormatMFLLeagues = async (leagues) => {
  const leagueList = [];
  if (Array.isArray(leagues.league)) {
    leagues.league.forEach(async l => {
      leagueList.push(await formatSingularLeague(l));
    });
  } else {
    console.log(leagues)
    leagueList.push(await formatSingularLeague(leagues.league));
  }
  return leagueList;
};
