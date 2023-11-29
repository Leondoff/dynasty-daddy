export class PatreonUser {
    firstName: string;
    lastName: string;
    imageUrl: string;
    leagues: any[] = [];
    prPresets: any[] = [];
    lfPresets: any[] = [];
    userId: string;
    createdAt: string;

    constructor(user: any) {
        this.firstName = user.first_name;
        this.lastName = user.last_name;
        this.imageUrl = user.image_url;
        this.leagues = user.leagues || [];
        this.userId = user.user_id;
        this.createdAt = user.created_at;
        this.prPresets = user.pr_presets || [];
        this.lfPresets = user.lf_presets || [];
    }
}
 