export class DraftCapital {
  constructor(b: boolean, round: number, pick: number, year: string) {
    this.isFirstOwner = b;
    this.round = round;
    this.pick = pick;
    this.year = year;
  }

  isFirstOwner: boolean;
  round: number;
  pick: number;
  year: string;
}
