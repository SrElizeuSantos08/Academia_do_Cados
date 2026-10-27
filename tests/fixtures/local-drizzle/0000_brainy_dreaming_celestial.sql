CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`course` text DEFAULT '' NOT NULL,
	`scope` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`size` integer NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`action` text NOT NULL,
	`target` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `certificates` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`course` text NOT NULL,
	`module` text NOT NULL,
	`snapshot` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `certificate_once` ON `certificates` (`user`,`course`,`module`);--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`level` text DEFAULT 'Básico' NOT NULL,
	`folder` text DEFAULT 'Cyber' NOT NULL,
	`published` integer DEFAULT 0 NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`body` text DEFAULT '[]' NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`user` text NOT NULL,
	`course` text NOT NULL,
	`created` text NOT NULL,
	PRIMARY KEY(`user`, `course`),
	FOREIGN KEY (`user`) REFERENCES `people`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`course` text NOT NULL,
	`user` text NOT NULL,
	`parent` text DEFAULT '' NOT NULL,
	`text` text DEFAULT '' NOT NULL,
	`asset` text DEFAULT '' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text DEFAULT '' NOT NULL,
	`course` text DEFAULT '' NOT NULL,
	`title` text NOT NULL,
	`text` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `people` (
	`id` text PRIMARY KEY NOT NULL,
	`identity` text,
	`login_email` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`ra` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`photo` text DEFAULT '' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `people_identity_unique` ON `people` (`identity`);--> statement-breakpoint
CREATE UNIQUE INDEX `people_login_email_unique` ON `people` (`login_email`);--> statement-breakpoint
CREATE UNIQUE INDEX `people_ra_unique` ON `people` (`ra`);--> statement-breakpoint
CREATE TABLE `progress` (
	`user` text NOT NULL,
	`course` text NOT NULL,
	`lesson` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`done` integer DEFAULT 0 NOT NULL,
	`score` integer,
	`updated` text NOT NULL,
	PRIMARY KEY(`user`, `course`, `lesson`)
);
--> statement-breakpoint
CREATE TABLE `reads` (
	`user` text NOT NULL,
	`notice` text NOT NULL,
	PRIMARY KEY(`user`, `notice`)
);
--> statement-breakpoint
CREATE TABLE `replies` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket` text NOT NULL,
	`user` text NOT NULL,
	`text` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`teacher` text DEFAULT '' NOT NULL,
	`course` text NOT NULL,
	`subject` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created` text NOT NULL
);
