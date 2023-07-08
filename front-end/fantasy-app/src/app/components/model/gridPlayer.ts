export class GridPlayer {
    id: number;
    name: string;
    pos: string;
    start_year: string;
    end_year: string
    teams: string[] = [];
    headshot_url: string = '';
    jersey_numbers: string[] = [];
    college: string = null;;
    stats_json: {} = null;
    awards_json: {} = null;;
}
