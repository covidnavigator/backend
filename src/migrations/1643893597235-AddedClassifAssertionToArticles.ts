import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddedClassifAssertionToArticles1643893597235 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection.query(`
      ALTER TYPE "articles_categories_enum" ADD VALUE IF NOT EXISTS 'assertion';
   `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
   `)
  }
}