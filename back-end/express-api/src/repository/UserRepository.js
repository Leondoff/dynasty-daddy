import Model from '../models/model';

const playersModel = new Model('users');

/**
 * get the user info by id
 * @param id user id
 */
export const GetUserById = async (id) => {
  const data = await playersModel.selectQuery('select * \n'
    + '  from users     \n'
    + `  WHERE user_id = '${id}'`);
  return data.rows[0];
};

/**
 * Persist new user to database for patreon
 * @param {*} id user id to persist
 * @param {*} firstName first name of user
 * @param {*} lastName last name of user
 * @param {*} imgUrl avatar url
 */
export const PersistNewUser = async (id, firstName, lastName, imgUrl) => {
  await playersModel.selectQuery('INSERT INTO users (user_id, first_name, last_name, image_url) \n'
    + ` VALUES ('${id}', '${firstName}', '${lastName}', '${imgUrl}');`);
  return {
    user_id: id,
    first_name: firstName,
    last_name: lastName,
    image_url: imgUrl,
    leagues: { leagues: [] }
  };
};

/**
 * Update the leagues field for a specific user by user_id.
 * @param {number} id - User ID.
 * @param {object} leagues - New leagues data to be set.
 */
export const UpdateUserLeagues = async (id, leagues) => {
  const query = `
    UPDATE users
    SET leagues = ARRAY[${leagues.map(l => `'${JSON.stringify(l)}'`)}]::jsonb[]
    WHERE user_id = '${id}';
  `;
  return playersModel.selectQuery(query);
};

/**
 * Update the power rankings presets for a specific user by user_id.
 * @param {number} id - User ID.
 * @param {object} presets - presets data to be set.
 */
export const UpdateUserPRPresets = async (id, presets) => {
  const query = `
    UPDATE users
    SET pr_presets = ARRAY[${presets.map(l => `'${JSON.stringify(l)}'`)}]::jsonb[]
    WHERE user_id = '${id}';
  `;
  return playersModel.selectQuery(query);
};

/**
 * Update the league format presets for a specific user by user_id.
 * @param {number} id - User ID.
 * @param {object} presets - presets data to be set.
 */
export const UpdateUserLFPresets = async (id, presets) => {
  const query = `
    UPDATE users
    SET lf_presets = ARRAY[${presets.map(l => `'${JSON.stringify(l)}'`)}]::jsonb[]
    WHERE user_id = '${id}';
  `;
  return playersModel.selectQuery(query);
};
