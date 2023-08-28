import Model from '../models/model';

const playersModel = new Model('league_info');

export const PersistLeagueInfo = async (leagues) => {
  const placeholders = leagues.map((_, index) =>
    `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`).join(', ');
  const values = leagues.flatMap(league =>
    [ league.leagueId, league.season, league.platform ]);
  const insertQuery = `
    INSERT INTO league_info (league_id, season, platform)
    VALUES ${placeholders}
    ON CONFLICT (league_id, season, platform) DO NOTHING;`;
  const data = await playersModel.pool.query(insertQuery, values);
  return data.rows;
};
