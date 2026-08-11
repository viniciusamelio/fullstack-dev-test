CREATE TABLE `prompt_runs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`occasion` text NOT NULL,
	`relationship` text NOT NULL,
	`prompt_version` text NOT NULL,
	`model` text NOT NULL,
	`status` text NOT NULL,
	`error_message` text,
	`latency_ms` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `suggestion_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prompt_run_id` integer,
	`occasion` text NOT NULL,
	`relationship` text NOT NULL,
	`prompt_version` text NOT NULL,
	`messages` text NOT NULL,
	`source` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`prompt_run_id`) REFERENCES `prompt_runs`(`id`) ON UPDATE no action ON DELETE no action
);
