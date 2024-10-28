ALTER TABLE "auth_links" RENAME COLUMN "users_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "auth_links" DROP CONSTRAINT "auth_links_users_id_users_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_links" ADD CONSTRAINT "auth_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
