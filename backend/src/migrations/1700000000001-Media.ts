import { MigrationInterface, QueryRunner } from "typeorm";

export class Media1700000000001 implements MigrationInterface {
  name = "Media1700000000001";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "media" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "filename" character varying NOT NULL, "mimeType" character varying NOT NULL, "data" bytea NOT NULL, "size" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_media_id" PRIMARY KEY ("id"))`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "media"`);
  }
}
