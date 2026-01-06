export type Thumbnail = {
    thumb_id: string;
    thumb_uri: string;
    thumb_w: number;
    thumb_h: number;
}

export type Video = {
    video_id: string;
    length_in_milli_seconds: number;
    user_id: string;
    post_id: string;
    thumbnail: Thumbnail;
    meme_type: string;
    video_uri: string;
    video_codec_type: string;
    video_format: string;
    video_h: number;
    video_w: number;
    video_bit_rate: number;
    video_ratio: string;
    video_size: number;
    video_title: string;
    created_at: Date;
    updated_at: Date;
    video_fps: number;
}

export type Reply = {
    reply_id: string;
    reply_content: string;
    user_id: string;
    like_count: number;
    dislike_count: number;
    created_at: Date;
    updated_at: Date;
};

export type Comment = {
    comment_id: string;
    post_id: Post;
    profile_id: UserProfile;
    comment_content: string;
    user_id: string;
    like_count: number;
    dislike_count: number;
    reply_count: number;
    is_post_owner: boolean;
    reply_content: Reply;
    created_at: Date;
    updated_at: Date;
};

type FollowStatus =
    | 'active'
    | 'pending'
    | 'blocked'
    | 'muted';

type FollowRequestStatus =
    | 'pending'
    | 'accepted'
    | 'rejected'
    | 'cancelled';

export type UserFollow = {
    id: string;
    follower_id: string;
    following_id: string;
    status: FollowStatus;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
}

export type FollowRequest = {
    id: string;
    requester_user_id: string;
    target_user_id: string;
    status: FollowRequestStatus;
    message: string | null;
    requested_at: Date;
    responded_at: Date | null;
    expires_at: Date | null;
}

export type UserBlock = {
    id: string;
    blocker_id: string;
    blocked_id: string;
    reason: string | null;
    created_at: Date;
}

type ProfileType = 'private' | 'public';

export type UserProfile = {
    profile_id: string;
    user_id: string;
    display_name: string;
    biography: string | null;
    profile_type: ProfileType;
    avatar_url: string | null;
    website_url: string | null;
    location: string | null;
    follower_count: number;
    following_count: number;
    posts_count: number;
    created_at: Date;
    updated_at: Date;
}

export type UserPreference = {
    preference_id: string;
    user_id: string;
    prefered_language: string;
    auto_play_video: boolean;
    auto_mute_video: boolean;
    enable_hdr: boolean;
    account_privacy: ProfileType;
    show_activity_status: boolean;
    allow_comments: boolean;
    new_comment_notification: boolean;
    new_follow_notification: boolean;
    new_like_notification: boolean;
    new_dislike_notification: boolean;
    created_at: Date;
    updated_at: Date;
}

type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived' | 'removed' | 'under_review';

type PostVisibility = 'public' | 'friends' | 'private' | 'unlisted';

export type Post = {
    post_id: string;
    user_id: string;
    profile_id: UserProfile;
    video_id: Video;
    caption: string | null;
    status: PostStatus;
    visibility: PostVisibility;
    allow_comments: boolean;
    allow_likes: boolean;
    allow_dislikes: boolean;
    allow_saves: boolean;
    is_ads: boolean;
    published_at: Date | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
    view_count: number;
    like_count: number;
    dislike_count: number;
    save_count: number;
    commets: Comment[];
}

export type PostLike = {
    like_id: string;
    post_id: Post;
    user_id: string;
    profile_id: UserProfile;
    created_at: Date;
}

export type PostDislike = {
    dislike_id: string;
    post_id: Post;
    user_id: string;
    profile_id: UserProfile;
    created_at: Date;
}

export type PostSave = {
    save_id: string;
    post_id: Post;
    user_id: string;
    profile_id: UserProfile;
    created_at: Date;
}

export type PostInterest = {
    interest_id: string;
    post_id: Post;
    user_id: string;
    profile_id: UserProfile;
    created_at: Date;
}

export type PostNotInterest = {
    not_interest_id: string;
    post_id: Post;
    user_id: string;
    profile_id: UserProfile;
    reason: string | null;
    created_at: Date;
}

export type CommentLike = {
    like_id: string;
    comment_id: Comment;
    user_id: string;
    profile_id: UserProfile;
    created_at: Date;
}

export type ReplyLike = {
    like_id: string;
    reply_id: Reply;
    user_id: string;
    profile_id: UserProfile;
    created_at: Date;
}

export type PostView = {
    view_id: string;
    post_id: string;
    user_id: string | null;
    profile_id: UserProfile | null;
    device_id: string;
    watch_duration_ms: number;
    completed: boolean;
    ip_address: string | null;
    user_agent: string | null;
    referrer: string | null;
    country_code: string | null;
    region: string | null;
    city: string | null;
    created_at: Date;
}

type NotificationType =
    | 'like'
    | 'comment'
    | 'reply'
    | 'follow'
    | 'follow_request'
    | 'system';

export type Notification = {
    notification_id: string;
    user_id: string;
    actor_id: string | null;
    notification_type: NotificationType;
    post_id: string | null;
    comment_id: string | null;
    message: string;
    is_read: boolean;
    read_at: Date | null;
    created_at: Date;
    action_url: string | null;
}

export type ReportReason =
    | 'spam'
    | 'harassment'
    | 'hate_speech'
    | 'violence'
    | 'nudity'
    | 'misinformation'
    | 'copyright'
    | 'impersonation'
    | 'minor_safety'
    | 'other';

type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';

export type Report = {
    report_id: string;
    reporter_user_id: string;
    reported_item_type: 'post' | 'comment' | 'user';
    reported_item_id: string;
    reason: ReportReason;
    description: string | null;
    status: ReportStatus;
    reviewed_by: string | null;
    reviewed_at: Date | null;
    action_taken: string | null;
    created_at: Date;
    updated_at: Date;
}

export type PostAnalytics = {
    analytics_id: string;
    post_id: Post;
    date: Date;
    view_count: number;
    unique_viewers: number;
    like_count: number;
    comment_count: number;
    share_count: number;
    average_watch_time_ms: number;
    completion_rate: number;
    traffic_source_explore: number;
    traffic_source_following: number;
    traffic_source_feed: number;
    traffic_source_profile: number;
    audience_male_percentage: number;
    audience_female_percentage: number;
    created_at: Date;
}

export type SearchHistory = {
    search_id: string;
    user_id: string;
    query: string;
    search_type: 'users' | 'videos' | 'all';
    results_count: number;
    clicked_result_id: string | null;
    created_at: Date;
}

export type SearchSuggestion = {
    suggestion_id: string;
    query: string;
    suggestion_text: string;
    search_count: number;
    is_trending: boolean;
    region: string | null;
    created_at: Date;
    updated_at: Date;
}
