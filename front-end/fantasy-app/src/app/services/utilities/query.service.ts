import { Injectable } from '@angular/core';
import { FantasyPlayer } from 'src/app/model/assets/FantasyPlayer';
import { PlayerService } from '../player.service';
import { PortfolioService } from 'src/app/components/services/portfolio.service';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  /** football stats prefix value */
  FOOTBALL_STAT_PREFIX = 'ff_'

  /** portfolio league prefix value */
  PORTFOLIO_LEAGUE_PREFIX = 'fl_'

  constructor(
    private playerService: PlayerService,
    private portfolioService: PortfolioService) {
  }

  /**
   * helper that handles ruleset
   * @param playersSubset players to apply ruleset to
   * @param ruleset ruleset from query builder
   * @return list of players filtered
   */
  public processRulesetForPlayer(playersSubset: FantasyPlayer[], ruleset: any): FantasyPlayer[] {
    const ruleResults = [];
    let rulesetResults: FantasyPlayer[] = [];
    for (const rule of ruleset.rules) {
      ruleResults.push(this.processRuleForPlayer(playersSubset.slice(), rule));
    }
    if (ruleset.condition === 'or') {
      for (const players of ruleResults) {
        players.map(player => {
          if (!rulesetResults.includes(player)) {
            rulesetResults.push(player);
          }
        });
      }
    } else {
      rulesetResults = ruleResults[0]?.slice();
      for (const players of ruleResults.slice(1)) {
        rulesetResults = rulesetResults.filter(player => {
          return players.includes(player);
        });
      }
    }
    return rulesetResults;
  }

  /**
   * processes rule operators and returns results
   * @param players list of players to apply filters on
   * @param rule rule from query builder
   */
  private processRuleForPlayer(players: FantasyPlayer[], rule: any): FantasyPlayer[] {
    if (rule.condition !== undefined) {
      return this.processRulesetForPlayer(players, rule);
    } else {
      return players.filter(player => {
        switch (rule.operator) {
          case 'contains': {
            return (player[rule.field] as string).toString().toLowerCase().includes(rule.value.toString().toLowerCase());
          }
          case 'like': {
            return (player[rule.field] as string).toString().toLowerCase().includes(rule.value.toString().toLowerCase());
          }
          case 'in': {
            switch (rule.field.slice(0, 3)) {
              case this.PORTFOLIO_LEAGUE_PREFIX:
                const portfolioLeagueValues = this.getPortfolioPlayerLeagueValues(player.name_id, rule.field.slice(3));
                return portfolioLeagueValues.includes(rule.value);
              default:
                return rule.value.includes(player[rule.field]);
            }
          }
          case 'not in': {
            switch (rule.field.slice(0, 3)) {
              case this.PORTFOLIO_LEAGUE_PREFIX:
                const portfolioLeagueValues = this.getPortfolioPlayerLeagueValues(player.name_id, rule.field.slice(3));
                return !portfolioLeagueValues.includes(rule.value);
              default:
                return !rule.value.includes(player[rule.field]);
            }
          }
          case '!=': {
            switch (rule.field.slice(0, 3)) {
              case this.FOOTBALL_STAT_PREFIX:
                return (this.playerService.playerStats[player.sleeper_id]?.[rule.field.slice(3)] || 0) !== rule.value;
              case this.PORTFOLIO_LEAGUE_PREFIX:
                const portfolioLeagueValues = this.getPortfolioPlayerLeagueValues(player.name_id, rule.field.slice(3));
                return !portfolioLeagueValues.includes(rule.value);
              default:
                return player[rule.field] !== rule.value;
            }
          }
          case '<=': {
            return rule.field.slice(0, 3) === this.FOOTBALL_STAT_PREFIX ? (this.playerService.playerStats[player.sleeper_id]?.[rule.field.slice(3)] || 0) <= rule.value
              : player[rule.field] <= rule.value;
          }
          case '>=': {
            return rule.field.slice(0, 3) === this.FOOTBALL_STAT_PREFIX ? (this.playerService.playerStats[player.sleeper_id]?.[rule.field.slice(3)] || 0) >= rule.value
              : player[rule.field] >= rule.value;
          }
          case '<': {
            return rule.field.slice(0, 3) === this.FOOTBALL_STAT_PREFIX ? (this.playerService.playerStats[player.sleeper_id]?.[rule.field.slice(3)] || 0) < rule.value
              : player[rule.field] < rule.value;
          }
          case '>': {
            return rule.field.slice(0, 3) === this.FOOTBALL_STAT_PREFIX ? (this.playerService.playerStats[player.sleeper_id]?.[rule.field.slice(3)] || 0) > rule.value
              : player[rule.field] > rule.value;
          }
          default: {
            switch (rule.field.slice(0, 3)) {
              case this.FOOTBALL_STAT_PREFIX:
                return (this.playerService.playerStats[player.sleeper_id]?.[rule.field.slice(3)] || 0) === rule.value;
              case this.PORTFOLIO_LEAGUE_PREFIX:
                const portfolioLeagueValues = this.getPortfolioPlayerLeagueValues(player.name_id, rule.field.slice(3));
                return portfolioLeagueValues.includes(rule.value);
              default:
                return player[rule.field] === rule.value;
            }
          }
        }
      });
    }
  }

  /**
   * get values from all leagues assigned to a player
   * @param nameId player name id
   * @param field field to fetch
   * @returns 
   */
  private getPortfolioPlayerLeagueValues(nameId: string, field: string): any[] {
    const leagueValues = [];
    let leagueIds = this.portfolioService.playerHoldingMap[nameId].leagues
    leagueIds?.forEach(leagueId => {
      leagueValues.push(this.portfolioService.leagueIdMap[leagueId][field])
    });
    return leagueValues;
  }
}
