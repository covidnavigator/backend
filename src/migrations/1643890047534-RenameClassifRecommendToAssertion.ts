import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameClassifRecommendToAssertion1643890047534 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update articles set categories[(select array_position(categories, 'recommend'))] = 'assertion' where id IN (select id from articles where 'recommend' = ANY (categories))
   `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    update articles set categories[(select array_position(categories, 'assertion'))] = 'recommend' where id IN (select id from articles where 'assertion' = ANY (categories))
   `)
  }
}
