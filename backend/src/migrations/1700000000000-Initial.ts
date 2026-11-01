import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1700000000000 implements MigrationInterface {
  name = "Initial1700000000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "admins" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_admins_id" PRIMARY KEY ("id"), CONSTRAINT "UQ_admins_email" UNIQUE ("email"))`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "content" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "key" character varying NOT NULL, "value" jsonb NOT NULL DEFAULT '{}', "visible" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT 0, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_content_id" PRIMARY KEY ("id"), CONSTRAINT "UQ_content_key" UNIQUE ("key"))`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "projects" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "title" character varying NOT NULL, "description" text NOT NULL DEFAULT '', "image" character varying NOT NULL DEFAULT '', "githubUrl" character varying NOT NULL DEFAULT '', "liveUrl" character varying NOT NULL DEFAULT '', "technologies" text NOT NULL DEFAULT '', "visible" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT 0, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_projects_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "inquiries" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "email" character varying NOT NULL, "subject" character varying NOT NULL, "message" text NOT NULL, "status" character varying NOT NULL DEFAULT 'new', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_inquiries_id" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_inquiries_status" ON "inquiries" ("status")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "inquiries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "projects"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "content"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admins"`);
  }
}
