/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-async-promise-executor */

import { PersistLeagueInfo, FetchTrades, FetchRecentTradeVolume } from '../repository';

export const AddLeaguesToDatabase = async (leagues) =>
  PersistLeagueInfo(leagues);

export const FetchTradesFromDatabase = async (tradeSearh) =>
  FetchTrades(tradeSearh);

export const GetRecentTradeVolume = async () =>
  FetchRecentTradeVolume();
