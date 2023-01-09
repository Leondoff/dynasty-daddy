import { Component, Input, OnInit } from '@angular/core';
import { LeagueService } from 'src/app/services/league.service';
import { PlayerService } from 'src/app/services/player.service';
import { NflService } from 'src/app/services/utilities/nfl.service';
import { DraftService } from '../../services/draft.service';
import { LeagueSwitchService } from '../../services/league-switch.service';
import { WrappedService } from '../../services/wrapped.service';
import { FadeGrowStagger, FadeSlideInOut } from '../animations/fade.animation';

@Component({
  selector: 'app-wrapped-draft',
  templateUrl: './wrapped-draft.component.html',
  styleUrls: ['./wrapped-draft.component.scss'],
  animations: [FadeSlideInOut, FadeGrowStagger]
})
export class WrappedDraftComponent implements OnInit {

  @Input()
  baseFrame: number;

  /** draft intro text */
  draftIntro = [];

  /** best players in draft */
  bestPicksInTheDraft = [];

  /** best & worst draft */
  bestWorstDraft = [];

  /** best value picks in draft */
  bestValuePicks = [];

  /** worst picks in draft */
  worstValuePicks = [];

  /** show next button */
  showNext = false;
  /** show page content */
  showContent = false;

  constructor(private draftService: DraftService, public wrappedService: WrappedService, public leagueSwitchService: LeagueSwitchService, private leagueService: LeagueService, private playerService: PlayerService) { }

  ngOnInit(): void {
    // intro draft text
    this.draftIntro.push('The ' + this.leagueService.selectedLeague.season + ' season started with a draft.');
    if (this.leagueService.completedDrafts[0] && this.leagueService.completedDrafts[0].picks.length > 0) {
      this.draftIntro.push('Your league selected ' + this.leagueService.completedDrafts[0].picks.length + ' players.');
      this.draftIntro.push('Let\'s see if one of you has the chops to be an NFL GM.');
    } else {
      this.draftIntro.push('Or I guess it did...');
      this.draftIntro.push('Since we couldn\'t find or load the draft, we\'ll skip over it.');
    }
    if (this.leagueService.completedDrafts[0] && this.leagueService.completedDrafts[0].picks.length > 0) {
      // best/worst overall draft
      const draftRankings = this.draftService.getTeamsWithBestValueDrafts(this.leagueService.completedDrafts[0]);
      const bestTeam = draftRankings[0];
      const worstTeam = draftRankings[this.leagueService.selectedLeague.totalRosters - 1];
      this.bestWorstDraft.push({ rank: 'Best', details: 'Draft Savant - added the most value in the draft', header: bestTeam.team.owner.teamName, image: bestTeam.team.owner.avatar });
      this.bestWorstDraft.push({ rank: 'Worst', details: 'The Buster - added the least value in the draft', header: worstTeam.team.owner.teamName, image: worstTeam.team.owner.avatar });
      // best picks in the draft
      const valueToUse = this.leagueService.selectedLeague.isSuperflex ? 'sf_trade_value' : 'trade_value';
      const sortedPicks = this.leagueService.completedDrafts[0].picks.slice().sort((a, b) => (this.playerService.getPlayerByPlayerPlatformId(b.playerId, this.leagueService.selectedLeague.leaguePlatform)?.[valueToUse] || 0) - (this.playerService.getPlayerByPlayerPlatformId(a.playerId, this.leagueService.selectedLeague.leaguePlatform)?.[valueToUse] || 0));
      for (let i = 0; i < 5; i++) {
        const pick = sortedPicks[i];
        const player = this.leagueService.platformPlayersMap[pick?.playerId];
        const team = this.leagueService.getTeamByRosterId(sortedPicks[i].rosterId);
        this.bestPicksInTheDraft.push({ rank: '#' + (i + 1), details: 'Selected with pick ' + pick.pickNumber + ' by ' + team.owner.ownerName, header: player.full_name || player.first_name + ' ' + player.last_name, image: team.owner.avatar });
      }
      // best value picks
      const valuePicks = this.draftService.sortPlayersByBestValuePick(this.leagueService.completedDrafts[0]).filter(p => !this.leagueService.platformPlayersMap[p.playerId]);
      for (let i = 0; i < 5; i++) {
        const pick = valuePicks[i].pick;
        const player = this.leagueService.platformPlayersMap[pick.playerId];
        const team = this.leagueService.getTeamByRosterId(valuePicks[i].pick.rosterId);
        this.bestValuePicks.push({ rank: '#' + (i + 1), details: 'Selected with pick ' + pick.pickNumber + ' by ' + team.owner.ownerName, header: player.full_name || player.first_name + ' ' + player.last_name, image: team.owner.avatar });
      }
      // worst value picks
      for (let i = 0; i < 5; i++) {
        const pick = valuePicks[valuePicks.length - i - 1].pick;
        const player = this.leagueService.platformPlayersMap[pick.playerId];
        const team = this.leagueService.getTeamByRosterId(valuePicks[valuePicks.length - i - 1].pick.rosterId);
        this.worstValuePicks.push({ rank: '#' + (i + 1), details: 'Selected with pick ' + pick.pickNumber + ' by ' + team.owner.ownerName, header: player.full_name || player.first_name + ' ' + player.last_name, image: team.owner.avatar });
      }
    }
    setInterval(() => {
      this.showContent = true;
    }, 1000);
    setInterval(() => {
      this.showNext = true;
    }, 3000);
  }

  /**
   * handles transitioning to the next frame
   */
  nextFrame(): void {
    this.wrappedService.frameNumber++;
    if (this.leagueService.completedDrafts.length === 0 || !this.leagueService.completedDrafts[0] || this.leagueService.completedDrafts[0].picks.length === 0) {
      this.wrappedService.frameNumber = 6;
    }
    this.showNext = false;
    this.showContent = false;
    setInterval(() => {
      this.showContent = true;
    }, 1000);
    setInterval(() => {
      this.showNext = true;
    }, 7000);
  }
}
