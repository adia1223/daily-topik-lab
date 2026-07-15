import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const examSets = sqliteTable("exam_sets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerEmail: text("owner_email").notNull(),
  sessionNumber: integer("session_number").notNull(),
  examDate: text("exam_date"),
  title: text("title").notNull(),
  status: text("status").notNull().default("processing"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("exam_sets_owner_session_idx").on(table.ownerEmail, table.sessionNumber)]);

export const examAssets = sqliteTable("exam_assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  examSetId: integer("exam_set_id").notNull().references(() => examSets.id, { onDelete: "cascade" }),
  ownerEmail: text("owner_email").notNull(),
  kind: text("kind").notNull(),
  filename: text("filename").notNull(),
  objectKey: text("object_key").notNull().unique(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull().default(0),
  extractionStatus: text("extraction_status").notNull().default("queued"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("exam_assets_exam_idx").on(table.examSetId)]);

export const examQuestions = sqliteTable("exam_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  examSetId: integer("exam_set_id").notNull().references(() => examSets.id, { onDelete: "cascade" }),
  section: text("section").notNull(),
  questionNumber: integer("question_number").notNull(),
  promptKo: text("prompt_ko").notNull(),
  passageKo: text("passage_ko"),
  optionsJson: text("options_json").notNull().default("[]"),
  answerIndex: integer("answer_index"),
  explanationZh: text("explanation_zh"),
  sentenceAnalysisJson: text("sentence_analysis_json").notNull().default("[]"),
  audioStartMs: integer("audio_start_ms"),
  audioEndMs: integer("audio_end_ms"),
  sourcePage: integer("source_page"),
  ocrConfidence: integer("ocr_confidence"),
}, (table) => [uniqueIndex("exam_questions_exam_number_idx").on(table.examSetId, table.section, table.questionNumber)]);

export const questionAttempts = sqliteTable("question_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerEmail: text("owner_email").notNull(),
  questionId: integer("question_id").notNull().references(() => examQuestions.id, { onDelete: "cascade" }),
  selectedIndex: integer("selected_index"),
  isCorrect: integer("is_correct", { mode: "boolean" }),
  elapsedSeconds: integer("elapsed_seconds").notNull().default(0),
  mistakeReason: text("mistake_reason"),
  note: text("note"),
  flagged: integer("flagged", { mode: "boolean" }).notNull().default(false),
  attemptedAt: text("attempted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("question_attempts_owner_idx").on(table.ownerEmail),
  index("question_attempts_question_idx").on(table.questionId),
]);
