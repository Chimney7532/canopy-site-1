CREATE TABLE IF NOT EXISTS `forum_followers` (
	`user_id` text,
	`post_id` text,
	PRIMARY KEY(`user_id`, `post_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `forum_likes` (
	`user_id` text,
	`post_id` text,
	PRIMARY KEY(`user_id`, `post_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `forum_meta` (
	`post_id` text PRIMARY KEY NOT NULL,
	`board` text DEFAULT 'ideas' NOT NULL,
	`pinned` integer DEFAULT 0 NOT NULL,
	`locked` integer DEFAULT 0 NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL,
	`updated_at` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `forum_reply_meta` (
	`comment_id` text PRIMARY KEY NOT NULL,
	`parent_id` text,
	`deleted` integer DEFAULT 0 NOT NULL,
	`edited_at` text,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `forum_saved` (
	`user_id` text,
	`post_id` text,
	PRIMARY KEY(`user_id`, `post_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `join_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`organization` text DEFAULT '' NOT NULL,
	`introduction` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL,
	`profile_json` text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `join_applications_request_id_unique` ON `join_applications` (`request_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `join_applications_created` ON `join_applications` (`created_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `site_events` (
	`id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`url` text,
	`image_url` text,
	`image_x` real DEFAULT 50 NOT NULL,
	`image_y` real DEFAULT 50 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_sample` integer DEFAULT 0 NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`details_json` text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `site_events_date` ON `site_events` (`status`,`date`);