import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { SleeperApiService } from './sleeper-api.service';
import { LeagueWrapper } from '../../../model/league/LeagueWrapper';
import { LeagueTeamMatchUpDTO } from '../../../model/league/LeagueTeamMatchUpDTO';
import { LeagueRosterDTO } from '../../../model/league/LeagueRosterDTO';
import { LeagueTeam } from '../../../model/league/LeagueTeam';
import { LeagueOwnerDTO } from '../../../model/league/LeagueOwnerDTO';
import { LeagueRawDraftOrderDTO } from '../../../model/league/LeagueRawDraftOrderDTO';
import { LeagueRawTradePicksDTO } from '../../../model/league/LeagueRawTradePicksDTO';
import { LeagueTeamTransactionDTO } from '../../../model/league/LeagueTeamTransactionDTO';
import { FantasyPlatformDTO, LeaguePlatform } from '../../../model/league/FantasyPlatformDTO';
import { CompletedDraft } from '../../../model/league/CompletedDraft';
import { DraftCapital } from '../../../model/assets/DraftCapital';

@Injectable({
  providedIn: 'root'
})
export class SleeperService {

  /** default sleeper icon for orphan teams */
  sleeperIcon: string = '15d7cf259bc30eab8f6120f45f652fb6';
  
  /** sleeper url for their avatars */
  sleeperAvatarBaseURL: string = 'https://sleepercdn.com/avatars/thumbs/';

  constructor(private sleeperApiService: SleeperApiService) {
  }

  /**
   * does this pick already exist
   * catches traded picks back to the original owner
   * @param tradedPick traded pick data
   * @param draftPicks player draft capital
   * @param pickNumber pick number
   * @private
   * returns true if pick already exists
   */
  static doesPickAlreadyExist(tradedPick: LeagueRawTradePicksDTO, draftPicks: DraftCapital[], pickNumber: number): boolean {
    for (const pick of draftPicks) {
      if (pick.round === tradedPick.round && pick.pick === pickNumber) {
        return true;
      }
    }
    return false;
  }

  /**
   * handles removing draft pick from draft capital
   * @param draftPicks
   * @param tradedPick
   * @private
   */
  static removeDraftPick(draftPicks: DraftCapital[], tradedPick: LeagueRawTradePicksDTO): DraftCapital[] {
    for (let i = 0; i < draftPicks.length; i++) {
      if (draftPicks[i].round === tradedPick.round && draftPicks[i].year === tradedPick.season) {
        draftPicks.splice(i, 1);
        return draftPicks;
      }
    }
    return draftPicks;
  }

  loadSleeperUser$(username: string, year: string): Observable<FantasyPlatformDTO> {
    return this.sleeperApiService.getSleeperUserInformation(username).pipe(mergeMap((userData) => {
      if (userData == null) {
        console.warn('User data could not be found. Try again!');
        return of(null);
      }
      return this.sleeperApiService.getSleeperLeaguesByUserID(userData.user_id, year).pipe(mergeMap(response => {
        const leagueUser = { leagues: response, userData, leaguePlatform: LeaguePlatform.SLEEPER };
        return of(leagueUser);
      }));
    }));
  }

  loadLeague$(league: LeagueWrapper): Observable<LeagueWrapper> {
    return this.sleeperApiService.getSleeperOwnersbyLeagueId(league.selectedLeague.leagueId).pipe(mergeMap((owners: LeagueOwnerDTO[]) => {
      if (league.selectedLeague.rosterPositions.filter(x => x === 'QB').length > 1) {
        league.selectedLeague.isSuperflex = true;
      }
      // fetch matchUps for league
      const leagueMatchUps = {};
      const leagueTransactions = {};
      const observe = [];
      for (let weekNum = league.selectedLeague.startWeek; weekNum < 19; weekNum++) {
        observe.push(this.sleeperApiService.getSleeperMatchUpsForWeekByLeagueId(league.selectedLeague.leagueId, weekNum)
          .pipe(mergeMap((weekMatchUps) => {
            const matchUpData: LeagueTeamMatchUpDTO[] = [];
            for (const matchup of weekMatchUps) {
              matchUpData.push(new LeagueTeamMatchUpDTO(matchup));
            }
            leagueMatchUps[weekNum] = matchUpData;
            return of(weekMatchUps);
          })));
        observe.push(this.sleeperApiService.getSleeperTransactionByLeagueIdForWeek(league.selectedLeague.leagueId, weekNum)
          .pipe(mergeMap((weekTransactions) => {
            const transactionsData: LeagueTeamTransactionDTO[] = [];
            for (const transaction of weekTransactions) {
              const picks = [];
              for (const pick of transaction.draft_picks) {
                picks.push(new LeagueRawTradePicksDTO(pick.owner_id, pick.previous_owner_id, pick.roster_id, pick.round, pick.season));
              }
              transactionsData.push(new LeagueTeamTransactionDTO(transaction, picks));
            }
            leagueTransactions[weekNum] = transactionsData;
            return of(weekTransactions);
          })));
      }
      observe.push(this.sleeperApiService.getSleeperPlayoffsByLeagueId(league.selectedLeague.leagueId).pipe(map((playoffs) => {
        league.playoffMatchUps = playoffs;
        return of(league.playoffMatchUps);
      }))
      );
      forkJoin(observe).subscribe(() => {
        league.selectedLeague.leagueMatchUps = leagueMatchUps;
        league.selectedLeague.leagueTransactions = leagueTransactions;
        return of(league);
      }
      );
      // fetch rosters and drafts picks
      return this.sleeperApiService.getSleeperRostersByLeagueId(league.selectedLeague.leagueId)
        .pipe(mergeMap((rosters: LeagueRosterDTO[]) => {
          league.leagueTeamDetails = [];
          rosters.map(roster => {
            // find existing owner or create a new one
            const owner = owners.find(o => o.userId === roster.ownerId)
              || new LeagueOwnerDTO(roster.rosterId.toString(), 'Retired Owner ' + roster.rosterId, 'Ophan Team ' + roster.rosterId, this.sleeperIcon);
            // if orphaned team add new owner and set new id
            if (!roster.ownerId) {
              owners.push(owner);
              roster.ownerId = owner.userId;
            }
            // set full avatar string for future reference
            owner.avatar = this.sleeperAvatarBaseURL + (owner.avatar || this.sleeperIcon);
            league.leagueTeamDetails.push(new LeagueTeam(owner, roster));
          });
          return this.sleeperApiService.getSleeperDraftbyLeagueId(league.selectedLeague.leagueId)
            .pipe(mergeMap((draftIds: string[]) => {
              draftIds.map((draftId: string) => {
                return this.loadDrafts$(draftId, league).subscribe();
              }
              );
              return this.generateFutureDraftCapital$(league);
            }));
        })
        );
    })
    );
  }


  // TODO clean up mock draft code... create separate object or use draft capital from team details
  private loadDrafts$(draftId: string, league: LeagueWrapper): Observable<LeagueWrapper> {
    return this.sleeperApiService.getSleeperDraftDetailsByDraftId(draftId).pipe(mergeMap((draft: LeagueRawDraftOrderDTO) => {
      if (draft.status === 'pre_draft' && draft.draftOrder) {
        return this.sleeperApiService.getSleeperTradedPicksByDraftId(draft.draftId)
          .pipe(mergeMap((tradedPicks: LeagueRawTradePicksDTO[]) => {
            league.leagueTeamDetails.map((team: LeagueTeam) => {
              const draftPicks: DraftCapital[] = [];
              const slot = draft.draftOrder[team.owner?.userId];
              for (let i = 0; i < draft.rounds; i++) {
                let slotPick = slot;
                if (draft.type === 'snake' && i + 1 % 2 === 0) {
                  slotPick = league.selectedLeague.totalRosters - slot;
                }
                draftPicks.push(new DraftCapital(i + 1, Number(slot), draft.season));
              }
              const rosterId = draft.slotToRosterId[slot];
              tradedPicks.reverse();
              tradedPicks.map((tradedPick: LeagueRawTradePicksDTO) => {
                if (tradedPick.rosterId === rosterId && tradedPick.ownerId !== rosterId) {
                  const index = draftPicks.map((i) => i.round).indexOf(tradedPick.round);
                  draftPicks.splice(index, 1);
                } else if (tradedPick.ownerId === rosterId) {
                  let pickSlot = Number(Object.keys(draft.slotToRosterId).find(key => draft.slotToRosterId[key] ===
                    tradedPick.rosterId));
                  if (draft.type === 'snake' && tradedPick.round % 2 === 0) {
                    pickSlot = league.selectedLeague.totalRosters - pickSlot;
                  }
                  if (!SleeperService.doesPickAlreadyExist(tradedPick, draftPicks, pickSlot)) {
                    draftPicks.push(new DraftCapital(tradedPick.round, pickSlot, tradedPick.season));
                  }
                }
              });
              team.upcomingDraftOrder = draftPicks;
            });
            league.upcomingDrafts.push(draft);
            return of(league);
          }));
      } else if (draft.status === 'complete' && draft.draftOrder) {
        forkJoin([
          this.sleeperApiService.getSleeperCompletedDraftsByDraftId(draft.draftId),
          this.sleeperApiService.getSleeperTradedPicksByDraftId(draft.draftId)]
        ).subscribe(([picks, tradedPicks]) => {
          tradedPicks.reverse().map((tradedPick: LeagueRawTradePicksDTO) => {
            picks.filter(pick => {
              if (pick.round === tradedPick.round && tradedPick.previousOwnerId === pick.rosterId) {
                pick.rosterId = tradedPick.previousOwnerId;
              }
            });
          });
          if (league.completedDrafts.filter(d => d.draft.draftId === draft.draftId).length === 0) {
            league.completedDrafts.push(new CompletedDraft(draft, picks));
          }
        }
        );
      }
      return of(league);
    }));
  }


  /**
   * generate future draft capital for teams
   * @private
   */
  private generateFutureDraftCapital$(league: LeagueWrapper): Observable<LeagueWrapper> {
    const draftPickOffset = league.completedDrafts.length > 0 ? 1 : 0;
    return this.sleeperApiService.getSleeperTradedPicksByLeagueId(league.selectedLeague.leagueId)
      .pipe(mergeMap((tradedPicks: LeagueRawTradePicksDTO[]) => {
        league.leagueTeamDetails.map((team: LeagueTeam) => {
          let draftPicks: DraftCapital[] = [];
          for (
            let year = Number(league.selectedLeague.season) + draftPickOffset;
            year < Number(league.selectedLeague.season) + 4;
            year++
          ) {
            for (let i = 0; i < league.selectedLeague.draftRounds; i++) {
              draftPicks.push(new DraftCapital(i + 1, league.selectedLeague.totalRosters / 2, year.toString(), team.roster.rosterId));
            }
          }
          // TODO repeated code here
          tradedPicks.map((tradedPick: LeagueRawTradePicksDTO) => {
            if (Number(tradedPick.season) >= Number(league.selectedLeague.season) + draftPickOffset
              && tradedPick.ownerId === team.roster.rosterId
              && tradedPick.rosterId !== team.roster.rosterId
            ) {
              draftPicks.push(new DraftCapital(tradedPick.round,
                league.selectedLeague.totalRosters / 2, tradedPick.season, tradedPick.rosterId));
            }
          });
          tradedPicks.map((tradedPick: LeagueRawTradePicksDTO) => {
            if (tradedPick.ownerId !== team.roster.rosterId
              && tradedPick.rosterId === team.roster.rosterId
            ) {
              draftPicks = SleeperService.removeDraftPick(draftPicks.slice(), tradedPick);
            }
          });
          team.futureDraftCapital = draftPicks;
        });
        return of(league);
      }));
  }
}
