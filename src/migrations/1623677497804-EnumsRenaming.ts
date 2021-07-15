import { MigrationInterface, QueryRunner } from 'typeorm'

export class EnumsRenaming1623677497804 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TYPE "articles_rolenew_enum" RENAME TO "articles_role_enum";
        ALTER TYPE "articles_formalismnew_enum" RENAME TO "articles_formalism_enum";
        ALTER TYPE "articles_categoriesnew_enum" RENAME TO "articles_categories_enum";
        ALTER TYPE "activity_categoriesnew_enum" RENAME TO "activity_categories_enum";
        ALTER TYPE "activity_knowledgestagesnew_enum" RENAME TO "activity_knowledgestages_enum";
      `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TYPE "articles_role_enum" RENAME TO "articles_rolenew_enum";
        ALTER TYPE "articles_formalism_enum" RENAME TO "articles_formalismnew_enum";
        ALTER TYPE "articles_categories_enum" RENAME TO "articles_categoriesnew_enum";
        ALTER TYPE "activity_categories_enum" RENAME TO "activity_categoriesnew_enum";
        ALTER TYPE "activity_knowledgestages_enum" RENAME TO "activity_knowledgestagesnew_enum";
    `)
  }
}
