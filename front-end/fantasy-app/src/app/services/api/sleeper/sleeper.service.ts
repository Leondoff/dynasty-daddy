import { Injectable, OnDestroy } from '@angular/core';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { map, switchMap, concatMap, delay, catchError, retry, tap, takeUntil } from 'rxjs/operators';
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
import { Status } from 'src/app/components/model/status';
import { DraftOrderType } from 'src/app/components/services/draft.service';
import { LeaguePickDTO } from 'src/app/model/league/LeaguePickDTO';

@Injectable({
  providedIn: 'root'
})
export class SleeperService implements OnDestroy {

  /** default sleeper icon for orphan teams */
  sleeperIcon: string = '15d7cf259bc30eab8f6120f45f652fb6';

  /** sleeper url for their avatars */
  sleeperAvatarBaseURL: string = 'https://sleepercdn.com/avatars/thumbs/';

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(private sleeperApiService: SleeperApiService) {
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
    return this.sleeperApiService.getSleeperUserInformation(username).pipe(switchMap((userData) => {
      if (userData == null) {
        console.warn('User data could not be found. Try again!');
        return of(null);
      }
      return this.sleeperApiService.getSleeperLeaguesByUserID(userData.user_id, year).pipe(switchMap(response => {
        const leagueUser = { leagues: response, userData, leaguePlatform: LeaguePlatform.SLEEPER };
        return of(leagueUser);
      }));
    }));
  }

  loadLeague$(league: LeagueWrapper): Observable<LeagueWrapper> {
    return this.sleeperApiService.getSleeperOwnersbyLeagueId(league.selectedLeague.leagueId).pipe(
      takeUntil(this.unsubscribe$),
      switchMap((owners: LeagueOwnerDTO[]) => {
        if (league.selectedLeague.rosterPositions.filter(x => x === 'QB').length > 1) {
          league.selectedLeague.isSuperflex = true;
        }
        // fetch matchUps for league
        const leagueMatchUps = {};
        const leagueTransactions = {};
        const observe = [];
        for (let weekNum = league.selectedLeague.startWeek; weekNum < 19; weekNum++) {
          observe.push(this.sleeperApiService.getSleeperMatchUpsForWeekByLeagueId(league.selectedLeague.leagueId, weekNum)
            .pipe(switchMap((weekMatchUps) => {
              const matchUpData: LeagueTeamMatchUpDTO[] = [];
              for (const matchup of weekMatchUps) {
                matchUpData.push(new LeagueTeamMatchUpDTO().createMatchUpFromSleeper(matchup));
              }
              leagueMatchUps[weekNum] = matchUpData.filter(m => m.matchupId != null);
              return of(weekMatchUps);
            })));
          observe.push(this.sleeperApiService.getSleeperTransactionByLeagueIdForWeek(league.selectedLeague.leagueId, weekNum)
            .pipe(switchMap((weekTransactions) => {
              const transactionsData: LeagueTeamTransactionDTO[] = [];
              for (const transaction of weekTransactions) {
                const picks = [];
                for (const pick of transaction.draft_picks) {
                  picks.push(new LeagueRawTradePicksDTO(pick.owner_id, pick.previous_owner_id, pick.roster_id, pick.round, pick.season));
                }
                transactionsData.push(new LeagueTeamTransactionDTO().fromSleeper(transaction, picks));
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
          .pipe(
            takeUntil(this.unsubscribe$),
            switchMap((rosters: LeagueRosterDTO[]) => {
              league.leagueTeamDetails = [];
              rosters.map(roster => {
                // find existing owner or create a new one
                const owner = owners.find(o => o.userId === roster.ownerId)
                  || new LeagueOwnerDTO(roster.rosterId.toString(), 'Retired Owner ' + roster.rosterId, 'Orphan Team ' + roster.rosterId, this.sleeperIcon);
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
                .pipe(
                  takeUntil(this.unsubscribe$),
                  switchMap((draftIds: string[]) => {
                    const draftObservables = draftIds.map((draftId: string) => {
                      return this.loadDrafts$(draftId, league);
                    });
                    return forkJoin(draftObservables).pipe(
                      tap((leagues: LeagueWrapper[]) => {
                        leagues.forEach((league: LeagueWrapper) => {
                          league.leagueTeamDetails?.forEach(team => {
                            league.selectedLeague?.metadata?.upcomingDraftOrder?.[team?.roster?.rosterId].forEach(pick => {
                              const ind = team.futureDraftCapital.findIndex(p => p.pick === -1 && p.round === pick.round && p.year === pick.year);
                              if (ind >= 0) {
                                team.futureDraftCapital[ind].pick = pick.pick;
                                pick.originalRosterId = team.futureDraftCapital[ind].originalRosterId;
                              }
                            });
                          });
                        });
                      }),
                      switchMap(() => this.generateFutureDraftCapital$(league))
                    );
                  })
                );
            })
          );
      })
    );
  }

  /**
 * Fetch all leagues for user and load rosters
 * This is used for the portfolio functionality
 * @param username string
 * @param year string
 * @returns 
 */
  fetchAllLeaguesForUser$(username: string, year: string): Observable<FantasyPlatformDTO> {
    return this.loadSleeperUser$(username, year).pipe(
      takeUntil(this.unsubscribe$),
      switchMap(leagueUser => {
        const observableList = leagueUser.leagues.map(league => {
          return this.sleeperApiService.getSleeperRostersByLeagueId(league.leagueId).pipe(
            retry(2),
            catchError(error => {
              console.error('Failed to fetch data:', error);
              return of([]);
            }),
            switchMap(rosters => {
              const team = rosters.find(it => it.ownerId === leagueUser?.userData?.user_id);
              league.metadata['roster'] = team?.players?.concat(...(team.reserve || []), ...(team.taxi || [])) || [];
              league.metadata['status'] = Status.DONE;
              league.leaguePlatform = LeaguePlatform.SLEEPER;
              return of(league);
            })
          );
        })
        return forkJoin(observableList).pipe(
          takeUntil(this.unsubscribe$),
          concatMap(() => of(leagueUser).pipe(delay(1000))));
      })
    );
  }

  // TODO clean up mock draft code... create separate object or use draft capital from team details
  private loadDrafts$(draftId: string, league: LeagueWrapper): Observable<LeagueWrapper> {
    let upcomingDraftOrder = {};
    return this.sleeperApiService.getSleeperDraftDetailsByDraftId(draftId).pipe(switchMap((draft: LeagueRawDraftOrderDTO) => {
      if (draft.status === 'pre_draft' && draft.draftOrder) {
        return this.sleeperApiService.getSleeperTradedPicksByDraftId(draft.draftId)
          .pipe(switchMap((tradedPicks: LeagueRawTradePicksDTO[]) => {
            // map pick order for orphaned teams
            if (Object.keys(draft.draftOrder).length != league.leagueTeamDetails.length) {
              league.leagueTeamDetails?.forEach(team => {
                if (!draft.draftOrder[team.owner?.userId]) {
                  draft.draftOrder[team.owner?.userId] = Number(Object.keys(draft.slotToRosterId)
                    .find(key => draft.slotToRosterId[key] === Number(team.owner?.userId)));;
                }
              });
            }
            league.leagueTeamDetails.map((team: LeagueTeam) => {
              const draftPicks: DraftCapital[] = [];
              const slot = draft.draftOrder[team.owner?.userId];
              for (let i = 0; i < draft.rounds; i++) {
                let slotPick = slot;
                if (draft.type !== DraftOrderType.Linear && i + 1 % 2 === 0) {
                  slotPick = league.selectedLeague.totalRosters - slot;
                }
                draftPicks.push(new DraftCapital(i + 1, Number(slot), draft.season, team.roster.rosterId));
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
                  if (draft.type !== DraftOrderType.Linear && tradedPick.round % 2 === 0) {
                    pickSlot = league.selectedLeague.totalRosters - pickSlot;
                  }
                  if (!SleeperService.doesPickAlreadyExist(tradedPick, draftPicks, pickSlot)) {
                    draftPicks.push(new DraftCapital(tradedPick.round, pickSlot, tradedPick.season, tradedPick.rosterId));
                  }
                }
              });
              draftPicks.sort((a, b) => a.round - b.round || a.pick - b.pick);
              upcomingDraftOrder[team.roster.rosterId] = draftPicks || [];
              team.futureDraftCapital.push(...draftPicks);
            });
            const picks: LeaguePickDTO[] = [];
            league.leagueTeamDetails?.forEach(t => {
              picks.push(...upcomingDraftOrder[t.roster.rosterId].map(pick =>
                new LeaguePickDTO().fromMockDraft(((pick.round - 1) * league.leagueTeamDetails.length) + pick.pick,
                  pick.round.toString() + '.' + (pick.pick > 9 ? pick.pick.toString() : '0' + pick.pick.toString()),
                  t.owner?.ownerName,
                  t.owner?.teamName,
                  t.roster.rosterId,
                  pick.originalRosterId || t.roster.rosterId,
                  pick.round))
              )
            });
            league.upcomingDrafts.push(new CompletedDraft(draft, picks));
            league.selectedLeague.metadata['upcomingDraftOrder'] = upcomingDraftOrder;
            return of(league);
          }));
      } else if (draft.draftOrder) {
        this.sleeperApiService.getSleeperCompletedDraftsByDraftId(draft.draftId, league?.selectedLeague?.totalRosters || 12).subscribe(picks => {
          picks.forEach(pick => {
            pick.originalRosterId = draft.slotToRosterId[pick.draftSlot];
          });
          if (league.completedDrafts.filter(d => d.draft.draftId === draft.draftId).length === 0) {
            const draftObj = new CompletedDraft(draft, picks);
            if (draft.status === 'complete') {
              draftObj.draft.status = 'completed';
              league.completedDrafts.push(draftObj)
            } else {
              draftObj.draft.status = 'in_progress';
              league.upcomingDrafts.push(draftObj);
            }
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
    return this.sleeperApiService.getSleeperTradedPicksByLeagueId(league.selectedLeague.leagueId)
      // delay in order to pick up process drafts
      .pipe(delay(2000))
      .pipe(switchMap((tradedPicks: LeagueRawTradePicksDTO[]) => {
        const isUpcomingSet = league.selectedLeague?.metadata?.upcomingDraftOrder ? true : false;
        const yearOffset = isUpcomingSet ? 1 : 0;
        league.leagueTeamDetails.map((team: LeagueTeam) => {
          let draftPicks: DraftCapital[] = [];
          for (
            let year = Number(league.selectedLeague.season) + yearOffset;
            year < Number(league.selectedLeague.season) + 4;
            year++
          ) {
            for (let i = 0; i < league.selectedLeague.draftRounds; i++) {
              const pick = new DraftCapital(i + 1, -1, year.toString(), team.roster.rosterId);
              if (pick && pick !== undefined)
                draftPicks.push(pick);
            }
          }
          team.futureDraftCapital = isUpcomingSet ?
            [...(league.selectedLeague?.metadata?.upcomingDraftOrder?.[team?.roster?.rosterId] || []), ...draftPicks] :
            draftPicks;
        });
        // filter out current season traded picks because the upcoming draft already has them
        const futureTradedPicks = isUpcomingSet ?
          tradedPicks.filter(p => p.season !== league.selectedLeague.season) : tradedPicks;
        league.leagueTeamDetails.map((team: LeagueTeam) => {
          futureTradedPicks.forEach((tradedPick: LeagueRawTradePicksDTO) => {
            if (tradedPick.ownerId !== team.roster.rosterId
              && tradedPick.rosterId === team.roster.rosterId
            ) {
              const pickInd = team.futureDraftCapital.findIndex(p => p && p.round === tradedPick.round && p.year === tradedPick.season);
              const tPick = team.futureDraftCapital.splice(pickInd, 1);
              const teamInd = league.leagueTeamDetails.findIndex(t => t.roster.rosterId === tradedPick.ownerId);
              if (tPick[0] && tPick[0] !== undefined)
                league.leagueTeamDetails[teamInd].futureDraftCapital.push(tPick[0]);
            }
          });
        });
        return of(league);
      }));
  }
}
