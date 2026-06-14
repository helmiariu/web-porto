CREATE TABLE `album_metadata` (
	`album_slug` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`software_list` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `software_tools` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`icon_type` text NOT NULL,
	`icon_value` text NOT NULL,
	`color` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `software_tools_slug_unique` ON `software_tools` (`slug`);