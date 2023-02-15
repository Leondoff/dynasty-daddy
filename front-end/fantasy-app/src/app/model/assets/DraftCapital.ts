export class DraftCapital {
  constructor(round: number, pick: number, year: string, originalRosterId: number = null) {
    this.round = round;
    this.pick = pick;
    this.year = year;
    this.originalRosterId = originalRosterId;
  }

  isFirstOwner: boolean;
  round: number;
  pick: number;
  year: string;
  originalRosterId: number;
}
