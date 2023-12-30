export class ArticlePreview {
    articleId: number;
    category: string;
    keywords: string[];
    linkedPlayers: string[];
    status: string;
    title: string;
    titleImg: string;
    post: string;
    firstName: string;
    lastName: string;
    twitterHandle: string;
    description: string;
    isLiked: boolean = false;
    likes: number = 0;
    isTrending: boolean = false;
    wordCount: number;
    postedAt: string;
    updatedAt: string;
    authorImg: string;

    constructor(article: any) {
        this.articleId = article.article_id;
        this.category = article.category;
        this.keywords = article.keywords;
        this.linkedPlayers = article.linked_players;
        this.status = article.status;
        this.title = article.title;
        this.likes = article.total_likes;
        this.titleImg = article.title_img;
        this.post = article.post;
        this.firstName = article.first_name;
        this.lastName = article.last_name;
        this.isLiked = article.has_liked;
        this.wordCount = article.word_count;
        this.isTrending = article.is_trending;
        this.postedAt = article.posted_at;
        this.updatedAt = article.updated_at;
        this.authorImg = article.image_url;
        this.twitterHandle = article.twitter_handle;
        this.description = article.description;
    }
}
