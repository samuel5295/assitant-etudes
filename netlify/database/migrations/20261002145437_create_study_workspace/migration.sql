CREATE TABLE "ai_usage" (
	"owner_id" text,
	"day" date,
	"count" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "ai_usage_pkey" PRIMARY KEY("owner_id","day")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner_id" text NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"kind" text DEFAULT 'course' NOT NULL,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"size" integer NOT NULL,
	"text_content" text,
	"favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner_id" text NOT NULL,
	"document_id" uuid,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"owner_id" text NOT NULL,
	"document_id" uuid,
	"title" text NOT NULL,
	"kind" text NOT NULL,
	"content" text NOT NULL,
	"prompt" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "documents_owner_idx" ON "documents" ("owner_id");--> statement-breakpoint
CREATE INDEX "messages_owner_document_idx" ON "messages" ("owner_id","document_id");--> statement-breakpoint
CREATE INDEX "notes_owner_idx" ON "notes" ("owner_id");--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_document_id_documents_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_document_id_documents_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE;