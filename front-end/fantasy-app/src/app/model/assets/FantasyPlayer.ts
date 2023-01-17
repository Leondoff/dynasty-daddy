/* tslint:disable:variable-name */
import {LeagueOwnerDTO} from '../league/LeagueOwnerDTO';

export class FantasyPlayer {

  id: number;
  name_id: string;
  sleeper_id: string;
  mfl_id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  team: string;
  position: string;
  sf_position_rank: number;
  position_rank: number;
  age: number;
  experience: number;
  injury_status: string;
  sf_trade_value: number;
  trade_value: number;
  owner: LeagueOwnerDTO = null;
  date: string;
  all_time_high_sf: number;
  all_time_low_sf: number;
  all_time_high: number;
  all_time_low: number;
  three_month_high_sf: number;
  three_month_high: number;
  three_month_low_sf: number;
  three_month_low: number;
  last_month_value: number;
  last_month_value_sf: number;
  most_recent_data_point: string;
  sf_change: number = null;
  standard_change: number = null;
  avg_adp: number = null;
  fantasypro_adp: number = null;
  bb10_adp: number = null;
  rtsports_adp: number = null;
  underdog_adp: number = null;
  drafters_adp: number = null;
  fc_sf_trade_value: number;
  fc_trade_value: number;
  fc_sf_position_rank: number;
  fc_position_rank: number;
  fc_all_time_high_sf: number;
  fc_all_time_low_sf: number;
  fc_all_time_high: number;
  fc_all_time_low: number;
  fc_three_month_high_sf: number;
  fc_three_month_high: number;
  fc_three_month_low_sf: number;
  fc_three_month_low: number;
  fc_last_month_value: number;
  fc_last_month_value_sf: number;
  fc_sf_change: number = null;
  fc_standard_change: number = null;

  constructor() {}
}

export class FantasyPlayerDataPoint {
  name_id: string;
  full_name: string;
  sf_position_rank: number;
  position_rank: number;
  sf_trade_value: number;
  trade_value: number;
  fc_sf_trade_value: number;
  fc_trade_value: number;
  date: string;
}

export enum Position {
  QB,
  RB,
  WR,
  TE,
  PICK,
}

export enum FantasyMarket {
  KeepTradeCut,
  FantasyCalc
}
