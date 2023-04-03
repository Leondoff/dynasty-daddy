import { FantasyPlatformDTO, LeaguePlatform } from "src/app/model/league/FantasyPlatformDTO"

export class Portfolio {
    leagues: FantasyPlatformDTO[] = [];
    selectedLeagues: {
        leagueId: string,
        platform: LeaguePlatform
    }[]
}
