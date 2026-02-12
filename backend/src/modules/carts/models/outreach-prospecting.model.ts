import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../utils/database.ts';
import OutreachCampaign from '../../campaigns/models/outreach-campaign.model.ts';

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface OutreachProspectingAttributes {
  id?: number;
  domain: string;
  campaign_name?: string | null;
  campaign_id?: number | null;
  domain_rating?: number | null;
  org_traffic?: number | null;
  org_keywords?: number | null;
  org_cost?: number | null;
  paid_cost?: number | null;
  paid_keywords?: number | null;
  paid_traffic?: number | null;
  org_traffic_top_by_country?: unknown;
  processing_status?: ProcessingStatus;
  error_message?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface OutreachProspectingCreationAttributes extends Optional<
  OutreachProspectingAttributes,
  | 'id'
  | 'campaign_name'
  | 'campaign_id'
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
  | 'created_at'
  | 'updated_at'
> {}

class OutreachProspecting
  extends Model<OutreachProspectingAttributes, OutreachProspectingCreationAttributes>
  implements OutreachProspectingAttributes
{
  public id!: number;

  public domain!: string;

  public campaign_name!: string | null;

  public campaign_id!: number | null;

  public domain_rating!: number | null;

  public org_traffic!: number | null;

  public org_keywords!: number | null;

  public org_cost!: number | null;

  public paid_cost!: number | null;

  public paid_keywords!: number | null;

  public paid_traffic!: number | null;

  public org_traffic_top_by_country!: unknown;

  public processing_status!: ProcessingStatus;

  public error_message!: string | null;

  public readonly created_at!: Date;

  public readonly updated_at!: Date;
}

OutreachProspecting.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    domain: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'domain',
    },
    campaign_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'campaign_name',
    },
    campaign_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'campaign_id',
      references: { model: 'outreach_campaigns', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    domain_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'domain_rating',
    },
    org_traffic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'org_traffic',
    },
    org_keywords: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'org_keywords',
    },
    org_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'org_cost',
      get() {
        const value = this.getDataValue('org_cost');
        return value != null ? Number(value) : null;
      },
    },
    paid_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'paid_cost',
      get() {
        const value = this.getDataValue('paid_cost');
        return value != null ? Number(value) : null;
      },
    },
    paid_keywords: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'paid_keywords',
    },
    paid_traffic: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'paid_traffic',
    },
    org_traffic_top_by_country: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'org_traffic_top_by_country',
    },
    processing_status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      allowNull: true,
      defaultValue: 'pending',
      field: 'processing_status',
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'error_message',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'outreach_prospecting',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { name: 'idx_prospecting_campaign', fields: ['campaign_name'] },
      { name: 'idx_prospecting_status', fields: ['processing_status'] },
      { name: 'idx_prospecting_campaign_id', fields: ['campaign_id'] },
      { unique: true, fields: ['domain', 'campaign_id'] },
    ],
  }
);

OutreachProspecting.belongsTo(OutreachCampaign, { foreignKey: 'campaign_id' });

export default OutreachProspecting;
