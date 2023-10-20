export class PatreonUser {
    firstName: string;
    lastName: string;
    imageUrl: string;
    leagues: any[] = [];
    userId: string;
    createdAt: string;

    constructor(user: any) {
        this.firstName = user.first_name;
        this.lastName = user.last_name;
        this.imageUrl = user.image_url;
        this.leagues = user.leagues || [];
        this.userId = user.user_id;
        this.createdAt = user.created_at;
    }
}
 