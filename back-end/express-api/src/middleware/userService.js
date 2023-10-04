import { GetUserById, PersistNewUser, UpdateUserLeagues } from '../repository';

export const FindUserById = async (id) =>
  GetUserById(id);

export const CreateNewUser = async (id, firstName, lastName, imgUrl) =>
  PersistNewUser(id, firstName, lastName, imgUrl);

export const AddLeaguesToUser = async (id, leagues) =>
  UpdateUserLeagues(id, leagues);
