import Model from '../models/model';

const playersModel = new Model('player_metadata');

/**
 * get the player metadata for a specific name_id
 * @param id name id of player
 */
export const GetPlayerMetadataByNameId = async (id) => {
  const data = await playersModel.selectQuery('select profile_json, \n'
    + '  updated_at as last_updated  \n'
    + '  from player_metadata pm     \n'
    + `  WHERE name_id = '${id}'`);
  return data;
};
