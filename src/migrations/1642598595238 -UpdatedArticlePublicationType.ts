import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdatedArticlePublicationType1642598595238 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE articles SET publication_type = 'review' WHERE publication_type = 'Systematic Review';
      UPDATE articles SET publication_type = 'consensus' WHERE publication_type = 'Consensus Opinion';
      UPDATE articles SET publication_type = 'paper' WHERE publication_type = 'Paper';
      UPDATE articles SET publication_type = 'editorial' WHERE publication_type = 'Editorial';
      UPDATE articles SET publication_type = 'letter' WHERE publication_type = 'Letter to the Editor';
      UPDATE articles SET publication_type = 'news' WHERE publication_type = 'News';
      UPDATE articles SET publication_type = 'web' WHERE publication_type = 'Web';
      UPDATE articles SET publication_type = 'other' WHERE publication_type = 'Other';
   `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE articles SET publication_type = 'Systematic Review' WHERE publication_type = 'review';
      UPDATE articles SET publication_type = 'Consensus Opinion' WHERE publication_type = 'consensus';
      UPDATE articles SET publication_type = 'Paper' WHERE publication_type = 'paper';
      UPDATE articles SET publication_type = 'Editorial' WHERE publication_type = 'editorial';
      UPDATE articles SET publication_type = 'Letter to the Editor' WHERE publication_type = 'letter';
      UPDATE articles SET publication_type = 'News' WHERE publication_type = 'news';
      UPDATE articles SET publication_type = 'Web' WHERE publication_type = 'web';
      UPDATE articles SET publication_type = 'Other' WHERE publication_type = 'other';
   `)
  }
}