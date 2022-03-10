import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddedClassifSystemRevToArticles1643892591372 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection.query(`
      ALTER TYPE "articles_categories_enum" ADD VALUE IF NOT EXISTS 'systemrev';
   `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
   `)
  }
}
