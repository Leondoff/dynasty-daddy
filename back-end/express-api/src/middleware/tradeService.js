/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-async-promise-executor */

import { PersistLeagueInfo } from '../repository';

export const AddLeaguesToDatabase = async (leagues) =>
  PersistLeagueInfo(leagues);
