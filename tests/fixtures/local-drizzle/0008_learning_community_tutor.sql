CREATE TABLE IF NOT EXISTS `forum_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`message` text NOT NULL,
	`course` text NOT NULL,
	`user` text NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `report_per_person` ON `forum_reports` (`user`,`message`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `message_topics` (
	`message` text PRIMARY KEY NOT NULL,
	`topic` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `moderation` (
	`message` text PRIMARY KEY NOT NULL,
	`hidden` integer DEFAULT 1 NOT NULL,
	`reason` text NOT NULL,
	`user` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `topics` (
	`id` text PRIMARY KEY NOT NULL,
	`course` text NOT NULL,
	`user` text NOT NULL,
	`title` text NOT NULL,
	`pinned` integer DEFAULT 0 NOT NULL,
	`closed` integer DEFAULT 0 NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tutor` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`course` text NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`needs_teacher` integer DEFAULT 0 NOT NULL,
	`sources` text DEFAULT '[]' NOT NULL,
	`ticket` text DEFAULT '' NOT NULL,
	`created` text NOT NULL
);

--> statement-breakpoint
INSERT INTO settings(key,value) VALUES('robot','on') ON CONFLICT(key) DO UPDATE SET value='on';
INSERT INTO settings(key,value) VALUES('agent:auto_support','on') ON CONFLICT(key) DO UPDATE SET value='on';
INSERT INTO settings(key,value) VALUES('agent:auto_forum','on') ON CONFLICT(key) DO UPDATE SET value='on';
