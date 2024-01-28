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
  const insertQuery = `
    INSERT INTO trivia_events_games (event_id, name, game_json)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;

  const queryValues = [eventId, name, JSON.stringify(gameJson)];

  const { rows } = await playersModel.pool.query(insertQuery, queryValues);

  return rows[0];
};
