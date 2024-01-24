import Model from '../models/model';

const playersModel = new Model('trivia_event_games');

export const GetEventGames = async (id) => {
  const data = await playersModel.selectQuery(`
  SELECT
    *
  from trivia_events_games
  WHERE event_id = ${id};
`);
  return data.rows;
};

export const InsertEventGame = async (eventId, name, gameJson) => {
  const query = `
    INSERT INTO trivia_events_games (event_id, name, game_json)
    VALUES (${eventId}, '${name}', '${JSON.stringify(gameJson)}')
    RETURNING *;
  `;

  const data = await playersModel.pool.query(query);
  return data.rows[0];
};
