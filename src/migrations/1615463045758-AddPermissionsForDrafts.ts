import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPermissionsForDrafts1615463045758
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "permissions"( id, permission) VALUES 
    (15, 'DRAFTS_VIEW'),
    (16, 'DRAFTS_EDIT');
`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "permissions" WHERE id=15 OR id=16;`)
  }
}
