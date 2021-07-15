import { MigrationInterface, QueryRunner } from 'typeorm'

export class NewArchitecture1623054592057 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "articles" RENAME "roleNew" TO "role";
      ALTER TABLE "articles" RENAME "formalismNew" TO "formalism";
      ALTER TABLE "articles" RENAME "categoriesNew" TO "categories";
      ALTER TABLE "activity" RENAME "categoriesNew" TO "categories";
      ALTER TABLE "activity" RENAME "knowledgeStagesNew" TO "knowledgeStages";
   `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "articles" RENAME "role" TO "roleNew"
      ALTER TABLE "articles" RENAME "formalism" TO "formalismNew"
      ALTER TABLE "articles" RENAME "categories" TO "categoriesNew"
      ALTER TABLE "activity" RENAME "categories" TO "categoriesNew"
      ALTER TABLE "activity" RENAME "knowledgeStages" TO "knowledgeStagesNew"
   `)
  }
}
