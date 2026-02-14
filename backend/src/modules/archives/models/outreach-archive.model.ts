import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../utils/database.ts';

import OutreachEmail from '../../emails/models/outreach-email.model.ts';

export type ProcessingStatus = 'pending' | 'processing';

export interface OutreachArchiveAttributes {
  id?: number;
  original_prospecting_id: number;
  domain: string;
  campaign_name: string;
  domain_rating?: number | null;
  org_traffic?: number | null;
  org_keywords?: number | null;
  org_cost?: number | null;
  paid_cost?: number | null;
  paid_keywords?: number | null;
  paid_traffic?: number | null;
  org_traffic_top_by_country?: string | null;
  processing_status?: ProcessingStatus | null;
  error_message?: string | null;
  used?: number | null;
  archived?: number | null;
  original_created_at?: Date | null;
  original_updated_at?: Date | null;
  archived_at?: Date | null;
  archive_reason?: string | null;
}

export interface OutreachArchiveCreationAttributes extends Optional<
  OutreachArchiveAttributes,
  | 'id'
  | 'domain_rating'
  | 'org_traffic'
  | 'org_keywords'
  | 'org_cost'
  | 'paid_cost'
  | 'paid_keywords'
  | 'paid_traffic'
  | 'org_traffic_top_by_country'
  | 'processing_status'
  | 'error_message'
  | 'used'
  | 'archived'
  | 'original_created_at'
  | 'original_updated_at'
  | 'archived_at'
  | 'archive_reason'
> {}

class OutreachArchive
  extends Model<OutreachArchiveAttributes, OutreachArchiveCreationAttributes>
  implements OutreachArchiveAttributes
{
  public id!: number;

  public original_prospecting_id!: number;

  public domain!: string;

  public campaign_name!: string;

  public domain_rating!: number | null;

  public org_traffic!: number | null;

  public org_keywords!: number | null;

  public org_cost!: number | null;

  public paid_cost!: number | null;

  public paid_keywords!: number | null;

  public paid_traffic!: number | null;

  public org_traffic_top_by_country!: string | null;

  public processing_status!: ProcessingStatus | null;

  public error_message!: string | null;

  public used!: number | null;

  public archived!: number | null;

  public readonly original_created_at!: Date | null;

  public readonly original_updated_at!: Date | null;

  public readonly archived_at!: Date | null;

  public archive_reason!: string | null;
}

OutreachArchive.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    original_prospecting_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'original_prospecting_id',
    },
    domain: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'domain',
    },
    campaign_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'campaign_name',
    },
    domain_rating: { type: DataTypes.INTEGER, allowNull: true, field: 'domain_rating' },
    org_traffic: { type: DataTypes.INTEGER, allowNull: true, field: 'org_traffic' },
    org_keywords: { type: DataTypes.INTEGER, allowNull: true, field: 'org_keywords' },
    org_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'org_cost' },
    paid_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: true, field: 'paid_cost' },
    paid_keywords: { type: DataTypes.INTEGER, allowNull: true, field: 'paid_keywords' },
    paid_traffic: { type: DataTypes.INTEGER, allowNull: true, field: 'paid_traffic' },
    org_traffic_top_by_country: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      field: 'org_traffic_top_by_country',
    },
    processing_status: {
      type: DataTypes.ENUM('pending', 'processing'),
      allowNull: true,
      defaultValue: 'pending',
      field: 'processing_status',
    },
    error_message: { type: DataTypes.TEXT, allowNull: true, field: 'error_message' },
    used: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 0, field: 'used' },
    archived: { type: DataTypes.TINYINT, allowNull: true, defaultValue: 0, field: 'archived' },
    original_created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'original_created_at',
    },
    original_updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'original_updated_at',
    },
    archived_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: 'archived_at',
    },
    archive_reason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'blacklisted',
      field: 'archive_reason',
    },
  },
  {
    sequelize,
    tableName: 'outreach_archive',
    timestamps: false,
    indexes: [
      { name: 'idx_original_prospecting_id', fields: ['original_prospecting_id'] },
      { name: 'idx_domain', fields: ['domain'] },
      { name: 'idx_campaign_name', fields: ['campaign_name'] },
      { name: 'idx_archived_at', fields: ['archived_at'] },
    ],
  }
);

OutreachArchive.belongsTo(OutreachEmail, {
  foreignKey: 'original_prospecting_id',
  targetKey: 'original_prospecting_id',
});
OutreachEmail.hasOne(OutreachArchive, {
  foreignKey: 'original_prospecting_id',
  sourceKey: 'original_prospecting_id',
});

export default OutreachArchive;
