CREATE TABLE `exam_assets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`exam_set_id` integer NOT NULL,
	`owner_email` text NOT NULL,
	`kind` text NOT NULL,
	`filename` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`size_bytes` integer DEFAULT 0 NOT NULL,
	`extraction_status` text DEFAULT 'queued' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`exam_set_id`) REFERENCES `exam_sets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exam_assets_object_key_unique` ON `exam_assets` (`object_key`);--> statement-breakpoint
CREATE INDEX `exam_assets_exam_idx` ON `exam_assets` (`exam_set_id`);--> statement-breakpoint
CREATE TABLE `exam_questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`exam_set_id` integer NOT NULL,
	`section` text NOT NULL,
	`question_number` integer NOT NULL,
	`prompt_ko` text NOT NULL,
	`passage_ko` text,
	`options_json` text DEFAULT '[]' NOT NULL,
	`answer_index` integer,
	`explanation_zh` text,
	`sentence_analysis_json` text DEFAULT '[]' NOT NULL,
	`audio_start_ms` integer,
	`audio_end_ms` integer,
	`source_page` integer,
	`ocr_confidence` integer,
	FOREIGN KEY (`exam_set_id`) REFERENCES `exam_sets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exam_questions_exam_number_idx` ON `exam_questions` (`exam_set_id`,`section`,`question_number`);--> statement-breakpoint
CREATE TABLE `exam_sets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`session_number` integer NOT NULL,
	`exam_date` text,
	`title` text NOT NULL,
	`status` text DEFAULT 'processing' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exam_sets_owner_session_idx` ON `exam_sets` (`owner_email`,`session_number`);--> statement-breakpoint
CREATE TABLE `question_attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`question_id` integer NOT NULL,
	`selected_index` integer,
	`is_correct` integer,
	`elapsed_seconds` integer DEFAULT 0 NOT NULL,
	`mistake_reason` text,
	`note` text,
	`flagged` integer DEFAULT false NOT NULL,
	`attempted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `exam_questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `question_attempts_owner_idx` ON `question_attempts` (`owner_email`);--> statement-breakpoint
CREATE INDEX `question_attempts_question_idx` ON `question_attempts` (`question_id`);