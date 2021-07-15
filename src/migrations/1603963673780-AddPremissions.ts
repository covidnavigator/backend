import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPremissions1603963673780 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "permissions"( id, permission) VALUES 
          (1, 'UNCLASSIFIED_ASSETS_VIEW'),
          (2, 'UNCLASSIFIED_ASSETS_EDIT'),
          (3, 'CLASSIFIED_ASSETS_VIEW'),
          (4, 'CLASSIFIED_ASSETS_EDIT'),
          (5, 'VERIFIED_ASSETS_VIEW'),
          (6, 'VERIFIED_ASSETS_EDIT'),
          (7, 'ALL_USERS_VIEW'),
          (8, 'All_USERS_EDIT'),            
          (9, 'ROLE_PERMISSIONS_VIEW'),
          (10, 'ROLE_PERMISSIONS_EDIT'),
          (11, 'PRECLASSIFIED_ASSETS_VIEW'),
          (12, 'PRECLASSIFIED_ASSETS_EDIT');`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE "permissions";`)
  }
}
