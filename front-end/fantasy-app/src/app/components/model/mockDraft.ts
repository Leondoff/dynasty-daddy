export class TeamMockDraftPick {
  constructor(num: number, display: string, ownerName: string, teamName: string, rosterId: number, originalRosterId: number) {
    this.pick = num;
    this.pickdisplay = display;
    this.pickOwner = ownerName;
    this.pickTeam = teamName;
    this.rosterId = rosterId;
    this.originalRosterId = originalRosterId;
  }

  pickOwner: string;
  pickTeam: string;
  pickdisplay: string;
  pick: number;
  rosterId: number;
  originalRosterId: number;
}
