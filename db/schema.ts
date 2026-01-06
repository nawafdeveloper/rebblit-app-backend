import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, varchar, integer, decimal, pgEnum, uniqueIndex, foreignKey } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
    twoFactorEnabled: boolean("two_factor_enabled").default(false),
    username: text("username").unique(),
    displayUsername: text("display_username"),
});

export const session = pgTable(
    "session",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
    },
    (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
    "account",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const twoFactor = pgTable(
    "two_factor",
    {
        id: text("id").primaryKey(),
        secret: text("secret").notNull(),
        backupCodes: text("backup_codes").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
    },
    (table) => [
        index("twoFactor_secret_idx").on(table.secret),
        index("twoFactor_userId_idx").on(table.userId),
    ],
);

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
    twoFactors: many(twoFactor),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
    user: one(user, {
        fields: [twoFactor.userId],
        references: [user.id],
    }),
}));


// Enums
export const profileTypeEnum = pgEnum('profile_type', ['private', 'public']);
export const followStatusEnum = pgEnum('follow_status', ['active', 'pending', 'blocked', 'muted']);
export const followRequestStatusEnum = pgEnum('follow_request_status', ['pending', 'accepted', 'rejected', 'cancelled']);
export const postStatusEnum = pgEnum('post_status', ['draft', 'scheduled', 'published', 'archived', 'removed', 'under_review']);
export const postVisibilityEnum = pgEnum('post_visibility', ['public', 'friends', 'private', 'unlisted']);
export const notificationTypeEnum = pgEnum('notification_type', ['like', 'comment', 'reply', 'follow', 'follow_request', 'system']);
export const reportReasonEnum = pgEnum('report_reason', ['spam', 'harassment', 'hate_speech', 'violence', 'nudity', 'misinformation', 'copyright', 'impersonation', 'minor_safety', 'other']);
export const reportStatusEnum = pgEnum('report_status', ['pending', 'under_review', 'resolved', 'dismissed']);
export const searchTypeEnum = pgEnum('search_type', ['users', 'videos', 'all']);
export const reportedItemTypeEnum = pgEnum('reported_item_type', ['post', 'comment', 'user']);

// Thumbnails Table
export const thumbnails = pgTable('thumbnails', {
    thumbId: text('thumb_id').primaryKey(),
    thumbUri: text('thumb_uri').notNull(),
    thumbW: integer('thumb_w').notNull(),
    thumbH: integer('thumb_h').notNull(),
});

// Videos Table
export const videos = pgTable('videos', {
    videoId: text('video_id').primaryKey(),
    lengthInMilliSeconds: integer('length_in_milli_seconds').notNull(),
    userId: text('user_id').notNull(),
    postId: text('post_id'),
    thumbnailId: text('thumbnail_id').notNull().references(() => thumbnails.thumbId, { onDelete: 'cascade' }),
    memeType: varchar('meme_type', { length: 100 }),
    videoUri: text('video_uri').notNull(),
    videoCodecType: varchar('video_codec_type', { length: 50 }),
    videoFormat: varchar('video_format', { length: 50 }),
    videoH: integer('video_h').notNull(),
    videoW: integer('video_w').notNull(),
    videoBitRate: integer('video_bit_rate'),
    videoRatio: varchar('video_ratio', { length: 20 }),
    videoSize: integer('video_size').notNull(),
    videoTitle: varchar('video_title', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    videoFps: integer('video_fps'),
}, (table) => ({
    userIdIdx: index('videos_user_id_idx').on(table.userId),
    postIdIdx: index('videos_post_id_idx').on(table.postId),
    createdAtIdx: index('videos_created_at_idx').on(table.createdAt),
}));

// User Profiles Table
export const userProfiles = pgTable('user_profiles', {
    profileId: text('profile_id').primaryKey(),
    userId: text('user_id').notNull().unique(),
    displayName: varchar('display_name', { length: 100 }).notNull(),
    biography: text('biography'),
    profileType: profileTypeEnum('profile_type').default('public').notNull(),
    avatarUrl: text('avatar_url'),
    websiteUrl: text('website_url'),
    location: varchar('location', { length: 200 }),
    followerCount: integer('follower_count').default(0).notNull(),
    followingCount: integer('following_count').default(0).notNull(),
    postsCount: integer('posts_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: uniqueIndex('user_profiles_user_id_idx').on(table.userId),
    displayNameIdx: index('user_profiles_display_name_idx').on(table.displayName),
    createdAtIdx: index('user_profiles_created_at_idx').on(table.createdAt),
}));

// Posts Table
export const posts = pgTable('posts', {
    postId: text('post_id').primaryKey(),
    userId: text('user_id').notNull(),
    profileId: text('profile_id').notNull().references(() => userProfiles.profileId, { onDelete: 'cascade' }),
    videoId: text('video_id').notNull().references(() => videos.videoId, { onDelete: 'cascade' }),
    caption: text('caption'),
    status: postStatusEnum('status').default('draft').notNull(),
    visibility: postVisibilityEnum('visibility').default('public').notNull(),
    allowComments: boolean('allow_comments').default(true).notNull(),
    allowLikes: boolean('allow_likes').default(true).notNull(),
    allowDislikes: boolean('allow_dislikes').default(true).notNull(),
    allowSaves: boolean('allow_saves').default(true).notNull(),
    isAds: boolean('is_ads').default(false).notNull(),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
    viewCount: integer('view_count').default(0).notNull(),
    likeCount: integer('like_count').default(0).notNull(),
    dislikeCount: integer('dislike_count').default(0).notNull(),
    saveCount: integer('save_count').default(0).notNull(),
}, (table) => ({
    userIdIdx: index('posts_user_id_idx').on(table.userId),
    profileIdIdx: index('posts_profile_id_idx').on(table.profileId),
    statusIdx: index('posts_status_idx').on(table.status),
    visibilityIdx: index('posts_visibility_idx').on(table.visibility),
    publishedAtIdx: index('posts_published_at_idx').on(table.publishedAt),
    createdAtIdx: index('posts_created_at_idx').on(table.createdAt),
    deletedAtIdx: index('posts_deleted_at_idx').on(table.deletedAt),
    // Composite indexes for common queries
    userStatusIdx: index('posts_user_status_idx').on(table.userId, table.status),
    statusPublishedIdx: index('posts_status_published_idx').on(table.status, table.publishedAt),
}));

// Replies Table
export const replies = pgTable('replies', {
    replyId: text('reply_id').primaryKey(),
    commentId: text('comment_id').notNull(),
    replyContent: text('reply_content').notNull(),
    userId: text('user_id').notNull(),
    likeCount: integer('like_count').default(0).notNull(),
    dislikeCount: integer('dislike_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    commentIdIdx: index('replies_comment_id_idx').on(table.commentId),
    userIdIdx: index('replies_user_id_idx').on(table.userId),
    createdAtIdx: index('replies_created_at_idx').on(table.createdAt),
}));

// Comments Table
export const comments = pgTable('comments', {
    commentId: text('comment_id').primaryKey(),
    postId: text('post_id').notNull().references(() => posts.postId, { onDelete: 'cascade' }),
    profileId: text('profile_id').notNull().references(() => userProfiles.profileId, { onDelete: 'cascade' }),
    commentContent: text('comment_content').notNull(),
    userId: text('user_id').notNull(),
    likeCount: integer('like_count').default(0).notNull(),
    dislikeCount: integer('dislike_count').default(0).notNull(),
    replyCount: integer('reply_count').default(0).notNull(),
    isPostOwner: boolean('is_post_owner').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    postIdIdx: index('comments_post_id_idx').on(table.postId),
    userIdIdx: index('comments_user_id_idx').on(table.userId),
    profileIdIdx: index('comments_profile_id_idx').on(table.profileId),
    createdAtIdx: index('comments_created_at_idx').on(table.createdAt),
    // Composite index for post comments
    postCreatedIdx: index('comments_post_created_idx').on(table.postId, table.createdAt),
}));

// User Follows Table
export const userFollows = pgTable('user_follows', {
    id: text('id').primaryKey(),
    followerId: text('follower_id').notNull(),
    followingId: text('following_id').notNull(),
    status: followStatusEnum('status').default('active').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
}, (table) => ({
    followerIdIdx: index('user_follows_follower_id_idx').on(table.followerId),
    followingIdIdx: index('user_follows_following_id_idx').on(table.followingId),
    statusIdx: index('user_follows_status_idx').on(table.status),
    // Unique constraint to prevent duplicate follows
    uniqueFollowIdx: uniqueIndex('user_follows_unique_idx').on(table.followerId, table.followingId),
    // Composite index for follow queries
    followerStatusIdx: index('user_follows_follower_status_idx').on(table.followerId, table.status),
}));

// Follow Requests Table
export const followRequests = pgTable('follow_requests', {
    id: text('id').primaryKey(),
    requesterUserId: text('requester_user_id').notNull(),
    targetUserId: text('target_user_id').notNull(),
    status: followRequestStatusEnum('status').default('pending').notNull(),
    message: text('message'),
    requestedAt: timestamp('requested_at').defaultNow().notNull(),
    respondedAt: timestamp('responded_at'),
    expiresAt: timestamp('expires_at'),
}, (table) => ({
    requesterIdx: index('follow_requests_requester_idx').on(table.requesterUserId),
    targetIdx: index('follow_requests_target_idx').on(table.targetUserId),
    statusIdx: index('follow_requests_status_idx').on(table.status),
    // Composite indexes
    targetStatusIdx: index('follow_requests_target_status_idx').on(table.targetUserId, table.status),
    expiresAtIdx: index('follow_requests_expires_at_idx').on(table.expiresAt),
}));

// User Blocks Table
export const userBlocks = pgTable('user_blocks', {
    id: text('id').primaryKey(),
    blockerId: text('blocker_id').notNull(),
    blockedId: text('blocked_id').notNull(),
    reason: text('reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    blockerIdIdx: index('user_blocks_blocker_id_idx').on(table.blockerId),
    blockedIdIdx: index('user_blocks_blocked_id_idx').on(table.blockedId),
    // Unique constraint
    uniqueBlockIdx: uniqueIndex('user_blocks_unique_idx').on(table.blockerId, table.blockedId),
}));

// User Preferences Table
export const userPreferences = pgTable('user_preferences', {
    preferenceId: text('preference_id').primaryKey(),
    userId: text('user_id').notNull().unique(),
    preferedLanguage: varchar('prefered_language', { length: 10 }).default('en').notNull(),
    autoPlayVideo: boolean('auto_play_video').default(true).notNull(),
    autoMuteVideo: boolean('auto_mute_video').default(false).notNull(),
    enableHdr: boolean('enable_hdr').default(false).notNull(),
    accountPrivacy: profileTypeEnum('account_privacy').default('public').notNull(),
    showActivityStatus: boolean('show_activity_status').default(true).notNull(),
    allowComments: boolean('allow_comments').default(true).notNull(),
    newCommentNotification: boolean('new_comment_notification').default(true).notNull(),
    newFollowNotification: boolean('new_follow_notification').default(true).notNull(),
    newLikeNotification: boolean('new_like_notification').default(true).notNull(),
    newDislikeNotification: boolean('new_dislike_notification').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: uniqueIndex('user_preferences_user_id_idx').on(table.userId),
}));

// Post Likes Table
export const postLikes = pgTable('post_likes', {
    likeId: text('like_id').primaryKey(),
    postId: text('post_id').notNull().references(() => posts.postId, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    profileId: text('profile_id').notNull().references(() => userProfiles.profileId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    postIdIdx: index('post_likes_post_id_idx').on(table.postId),
    userIdIdx: index('post_likes_user_id_idx').on(table.userId),
    // Unique constraint to prevent duplicate likes
    uniqueLikeIdx: uniqueIndex('post_likes_unique_idx').on(table.postId, table.userId),
    createdAtIdx: index('post_likes_created_at_idx').on(table.createdAt),
}));

// Post Dislikes Table
export const postDislikes = pgTable('post_dislikes', {
    dislikeId: text('dislike_id').primaryKey(),
    postId: text('post_id').notNull().references(() => posts.postId, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    profileId: text('profile_id').notNull().references(() => userProfiles.profileId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    postIdIdx: index('post_dislikes_post_id_idx').on(table.postId),
    userIdIdx: index('post_dislikes_user_id_idx').on(table.userId),
    uniqueDislikeIdx: uniqueIndex('post_dislikes_unique_idx').on(table.postId, table.userId),
}));

// Post Saves Table
export const postSaves = pgTable('post_saves', {
    saveId: text('save_id').primaryKey(),
    postId: text('post_id').notNull().references(() => posts.postId, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    profileId: text('profile_id').notNull().references(() => userProfiles.profileId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    postIdIdx: index('post_saves_post_id_idx').on(table.postId),
    userIdIdx: index('post_saves_user_id_idx').on(table.userId),
    uniqueSaveIdx: uniqueIndex('post_saves_unique_idx').on(table.postId, table.userId),
    createdAtIdx: index('post_saves_created_at_idx').on(table.createdAt),
}));

// Post Interest Table
export const postInterests = pgTable('post_interests', {
    interestId: text('interest_id').primaryKey(),
    postId: text('post_id').notNull().references(() => posts.postId, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    profileId: text('profile_id').notNull().references(() => userProfiles.profileId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    postIdIdx: index('post_interests_post_id_idx').on(table.postId),
    userIdIdx: index('post_interests_user_id_idx').on(table.userId),
    uniqueInterestIdx: uniqueIndex('post_interests_unique_idx').on(table.postId, table.userId),
}));

// Post Not Interest Table
export const postNotInterests = pgTable('post_not_interests', {
    notInterestId: text('not_interest_id').primaryKey(),
    postId: text('post_id').notNull().references(() => posts.postId, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    profileId: text('profile_id').notNull().references(() => userProfiles.profileId, { onDelete: 'cascade' }),
    reason: text('reason'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    postIdIdx: index('post_not_interests_post_id_idx').on(table.postId),
    userIdIdx: index('post_not_interests_user_id_idx').on(table.userId),
    uniqueNotInterestIdx: uniqueIndex('post_not_interests_unique_idx').on(table.postId, table.userId),
}));

// Comment Likes Table
export const commentLikes = pgTable('comment_likes', {
    likeId: text('like_id').primaryKey(),
    commentId: text('comment_id').notNull().references(() => comments.commentId, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    profileId: text('profile_id').notNull().references(() => userProfiles.profileId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    commentIdIdx: index('comment_likes_comment_id_idx').on(table.commentId),
    userIdIdx: index('comment_likes_user_id_idx').on(table.userId),
    uniqueLikeIdx: uniqueIndex('comment_likes_unique_idx').on(table.commentId, table.userId),
}));

// Reply Likes Table
export const replyLikes = pgTable('reply_likes', {
    likeId: text('like_id').primaryKey(),
    replyId: text('reply_id').notNull().references(() => replies.replyId, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(),
    profileId: text('profile_id').notNull().references(() => userProfiles.profileId, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    replyIdIdx: index('reply_likes_reply_id_idx').on(table.replyId),
    userIdIdx: index('reply_likes_user_id_idx').on(table.userId),
    uniqueLikeIdx: uniqueIndex('reply_likes_unique_idx').on(table.replyId, table.userId),
}));

// Post Views Table
export const postViews = pgTable('post_views', {
    viewId: text('view_id').primaryKey(),
    postId: text('post_id').notNull().references(() => posts.postId, { onDelete: 'cascade' }),
    userId: text('user_id'),
    profileId: text('profile_id').references(() => userProfiles.profileId, { onDelete: 'set null' }),
    deviceId: varchar('device_id', { length: 255 }).notNull(),
    watchDurationMs: integer('watch_duration_ms').default(0).notNull(),
    completed: boolean('completed').default(false).notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    referrer: text('referrer'),
    countryCode: varchar('country_code', { length: 2 }),
    region: varchar('region', { length: 100 }),
    city: varchar('city', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    postIdIdx: index('post_views_post_id_idx').on(table.postId),
    userIdIdx: index('post_views_user_id_idx').on(table.userId),
    deviceIdIdx: index('post_views_device_id_idx').on(table.deviceId),
    createdAtIdx: index('post_views_created_at_idx').on(table.createdAt),
    // Composite indexes for analytics
    postCreatedIdx: index('post_views_post_created_idx').on(table.postId, table.createdAt),
    countryCodeIdx: index('post_views_country_code_idx').on(table.countryCode),
}));

// Notifications Table
export const notifications = pgTable('notifications', {
    notificationId: text('notification_id').primaryKey(),
    userId: text('user_id').notNull(),
    actorId: text('actor_id'),
    notificationType: notificationTypeEnum('notification_type').notNull(),
    postId: text('post_id').references(() => posts.postId, { onDelete: 'cascade' }),
    commentId: text('comment_id').references(() => comments.commentId, { onDelete: 'cascade' }),
    message: text('message').notNull(),
    isRead: boolean('is_read').default(false).notNull(),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    actionUrl: text('action_url'),
}, (table) => ({
    userIdIdx: index('notifications_user_id_idx').on(table.userId),
    actorIdIdx: index('notifications_actor_id_idx').on(table.actorId),
    isReadIdx: index('notifications_is_read_idx').on(table.isRead),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
    // Composite indexes for notification queries
    userIsReadIdx: index('notifications_user_is_read_idx').on(table.userId, table.isRead),
    userCreatedIdx: index('notifications_user_created_idx').on(table.userId, table.createdAt),
}));

// Reports Table
export const reports = pgTable('reports', {
    reportId: text('report_id').primaryKey(),
    reporterUserId: text('reporter_user_id').notNull(),
    reportedItemType: reportedItemTypeEnum('reported_item_type').notNull(),
    reportedItemId: text('reported_item_id').notNull(),
    reason: reportReasonEnum('reason').notNull(),
    description: text('description'),
    status: reportStatusEnum('status').default('pending').notNull(),
    reviewedBy: text('reviewed_by'),
    reviewedAt: timestamp('reviewed_at'),
    actionTaken: text('action_taken'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    reporterIdx: index('reports_reporter_idx').on(table.reporterUserId),
    reportedItemIdx: index('reports_reported_item_idx').on(table.reportedItemType, table.reportedItemId),
    statusIdx: index('reports_status_idx').on(table.status),
    createdAtIdx: index('reports_created_at_idx').on(table.createdAt),
    reviewedByIdx: index('reports_reviewed_by_idx').on(table.reviewedBy),
}));

// Post Analytics Table
export const postAnalytics = pgTable('post_analytics', {
    analyticsId: text('analytics_id').primaryKey(),
    postId: text('post_id').notNull().references(() => posts.postId, { onDelete: 'cascade' }),
    date: timestamp('date').notNull(),
    viewCount: integer('view_count').default(0).notNull(),
    uniqueViewers: integer('unique_viewers').default(0).notNull(),
    likeCount: integer('like_count').default(0).notNull(),
    commentCount: integer('comment_count').default(0).notNull(),
    shareCount: integer('share_count').default(0).notNull(),
    averageWatchTimeMs: integer('average_watch_time_ms').default(0).notNull(),
    completionRate: decimal('completion_rate', { precision: 5, scale: 2 }).default('0').notNull(),
    trafficSourceExplore: integer('traffic_source_explore').default(0).notNull(),
    trafficSourceFollowing: integer('traffic_source_following').default(0).notNull(),
    trafficSourceFeed: integer('traffic_source_feed').default(0).notNull(),
    trafficSourceProfile: integer('traffic_source_profile').default(0).notNull(),
    audienceMalePercentage: decimal('audience_male_percentage', { precision: 5, scale: 2 }).default('0').notNull(),
    audienceFemalePercentage: decimal('audience_female_percentage', { precision: 5, scale: 2 }).default('0').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    postIdIdx: index('post_analytics_post_id_idx').on(table.postId),
    dateIdx: index('post_analytics_date_idx').on(table.date),
    // Unique constraint for daily analytics per post
    uniquePostDateIdx: uniqueIndex('post_analytics_post_date_idx').on(table.postId, table.date),
}));

// Search History Table
export const searchHistory = pgTable('search_history', {
    searchId: text('search_id').primaryKey(),
    userId: text('user_id').notNull(),
    query: text('query').notNull(),
    searchType: searchTypeEnum('search_type').notNull(),
    resultsCount: integer('results_count').default(0).notNull(),
    clickedResultId: text('clicked_result_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('search_history_user_id_idx').on(table.userId),
    queryIdx: index('search_history_query_idx').on(table.query),
    createdAtIdx: index('search_history_created_at_idx').on(table.createdAt),
    // Composite index for user search history
    userCreatedIdx: index('search_history_user_created_idx').on(table.userId, table.createdAt),
}));

// Search Suggestions Table
export const searchSuggestions = pgTable('search_suggestions', {
    suggestionId: text('suggestion_id').primaryKey(),
    query: varchar('query', { length: 255 }).notNull(),
    suggestionText: varchar('suggestion_text', { length: 255 }).notNull(),
    searchCount: integer('search_count').default(0).notNull(),
    isTrending: boolean('is_trending').default(false).notNull(),
    region: varchar('region', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    queryIdx: index('search_suggestions_query_idx').on(table.query),
    isTrendingIdx: index('search_suggestions_is_trending_idx').on(table.isTrending),
    regionIdx: index('search_suggestions_region_idx').on(table.region),
    searchCountIdx: index('search_suggestions_search_count_idx').on(table.searchCount),
}));

export const schema = {
    user,
    session,
    account,
    verification,
    twoFactor,
    thumbnails,
    videos,
    userProfiles,
    posts,
    replies,
    comments,
    userFollows,
    followRequests,
    userBlocks,
    userPreferences,
    postLikes,
    postDislikes,
    postSaves,
    postInterests,
    postNotInterests,
    commentLikes,
    replyLikes,
    postViews,
    notifications,
    reports,
    postAnalytics,
    searchHistory,
    searchSuggestions,
}