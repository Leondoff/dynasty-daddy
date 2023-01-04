/* tslint:disable:variable-name */
import {LeaguePlatform} from './FantasyPlatformDTO';

export class LeagueOwnerDTO {
  constructor(user_id: string, display_name: string, team_name: string, avatar: string) {
    this.userId = user_id;
    this.ownerName = display_name;
    this.teamName = team_name || display_name;
    this.avatar = avatar;
  }

  ownerName: string;
  teamName: string;
  userId: string;
  avatar: string;
}
