import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../utils/database.ts';

export type OutreachCampaignStatus = 'active' | 'paused' | 'completed';

export interface OutreachCampaignAttributes {
  id?: number;
  name: string;
  original_keywords: string;
  expanded_keywords: string;
  created_at?: Date;
  updated_at?: Date;
  is_active?: boolean;
  status?: OutreachCampaignStatus;
  blacklist_campaign_enabled?: boolean;
  blacklist_global_enabled?: boolean;
  cron_add_count?: number;
}

export interface OutreachCampaignCreationAttributes extends Optional<
  OutreachCampaignAttributes,
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'is_active'
  | 'status'
  | 'blacklist_campaign_enabled'
  | 'blacklist_global_enabled'
  | 'cron_add_count'
> {}

class OutreachCampaign
  extends Model<OutreachCampaignAttributes, OutreachCampaignCreationAttributes>
  implements OutreachCampaignAttributes
{
  public id!: number;

  public name!: string;

  public original_keywords!: string;

  public expanded_keywords!: string;

  public readonly created_at!: Date;

  public readonly updated_at!: Date;

  public is_active!: boolean;

  public status!: OutreachCampaignStatus;

  public blacklist_campaign_enabled!: boolean;

  public blacklist_global_enabled!: boolean;

  public cron_add_count!: number;
}

OutreachCampaign.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'name',
    },
    original_keywords: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'original_keywords',
    },
    expanded_keywords: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'expanded_keywords',
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
    is_active: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0,
      field: 'is_active',
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'completed'),
      allowNull: true,
      defaultValue: 'active',
      field: 'status',
    },
    blacklist_campaign_enabled: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1,
      field: 'blacklist_campaign_enabled',
    },
    blacklist_global_enabled: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1,
      field: 'blacklist_global_enabled',
    },
    cron_add_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      field: 'cron_add_count',
    },
  },
  {
    sequelize,
    tableName: 'outreach_campaigns',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ name: 'idx_campaigns_active', fields: ['is_active'] }],
  }
);

export default OutreachCampaign;
