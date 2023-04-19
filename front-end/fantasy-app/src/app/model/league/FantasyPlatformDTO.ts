import {LeagueUserDTO} from './LeagueUserDTO';
import {LeagueDTO} from './LeagueDTO';

export class FantasyPlatformDTO {
  userData: LeagueUserDTO;
  leagues: LeagueDTO[];
  leaguePlatform: LeaguePlatform = LeaguePlatform.SLEEPER;
}

export enum LeaguePlatform {
  SLEEPER,
  MFL,
  FLEAFLICKER,
  ESPN
}
