import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddedClassifAssertionToActivity1643893819783 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection.query(`
      ALTER TYPE "activity_categories_enum" ADD VALUE IF NOT EXISTS 'assertion';
   `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
   `)
  }
}
