import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddedClassifSystemRevToActivity1643893115342 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.connection.query(`
      ALTER TYPE "activity_categories_enum" ADD VALUE IF NOT EXISTS 'systemrev';
   `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
   `)
  }
}