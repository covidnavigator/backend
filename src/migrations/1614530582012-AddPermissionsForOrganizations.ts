import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPermissionsForOrganizations1614530582012
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "permissions"( id, permission) VALUES 
    (13, 'ORGANIZATIONS_VIEW'),
    (14, 'ORGANIZATIONS_EDIT');
`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "permissions" WHERE id=13 OR id=14;`)
  }
}
