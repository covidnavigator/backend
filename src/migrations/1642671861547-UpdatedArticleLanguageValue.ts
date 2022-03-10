import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdatedArticleLanguageValue1642671861547 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE articles SET language = 'en' WHERE language = 'English';
   `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE articles SET language = 'English' WHERE language = 'en';
   `)
  }
}