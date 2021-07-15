import { MigrationInterface, QueryRunner } from 'typeorm'

export class TablesRenaming1623665044713 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE articles_countries_new_country RENAME TO articles_countries_country;
        ALTER TABLE articles_localities_new_locality RENAME TO articles_localities_locality;
        ALTER TABLE articles_pan_countries_new_pancountry RENAME TO articles_pan_countries_pancountry;
        ALTER TABLE articles_regions_new_region RENAME TO articles_regions_region;
        ALTER TABLE articles_state_or_provinces_new_state RENAME TO articles_state_or_provinces_state;
      `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE articles_countries_country RENAME TO articles_countries_new_country;
        ALTER TABLE articles_localities_locality RENAME TO articles_localities_new_locality;
        ALTER TABLE articles_pan_countries_pancountry RENAME TO articles_pan_countries_new_pancountry;
        ALTER TABLE articles_regions_region RENAME TO articles_regions_new_region;
        ALTER TABLE articles_state_or_provinces_state RENAME TO articles_state_or_provinces_new_state;
      `)
  }
}
