import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddRolesToRolesTable1603784223376 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "roles"( id, role) VALUES 
        (1, 'Superuser'),
        (2, 'Role Administrator'),
        (3, 'System Administrator'),
        (4, 'Content Contributor'),
        (5, 'Content Administrator'),
        (6, 'Content Approver');`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE "roles";`)
  }
}
