import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../utils/database.ts';

export type OutreachEmailStatus = 'pending_analysis';
export type OutreachPriority = 'Low' | 'Medium' | 'High';
export type OutreachStatus = 'APPROVE' | 'REJECT';

export interface OutreachEmailAttributes {
  id?: number;
  domain: string;
  campaign_name: string;
  original_prospecting_id: number;
  status?: OutreachEmailStatus | null;
  downloaded_at?: Date | null;
  downloaded_by_session?: string | null;
  analysis_json?: string | null;
  analyzed_at?: Date | null;
  analysis_error?: string | null;
  accepts_guest_posts?: number | null;
  primary_email?: string | null;
  link_value_score?: number | null;
  outreach_priority?: OutreachPriority | null;
  outreach_status?: OutreachStatus | null;
  contacted_at?: Date | null;
  response_received_at?: Date | null;
  notes?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface OutreachEmailCreationAttributes extends Optional<
  OutreachEmailAttributes,
  | 'id'
  | 'status'
  | 'downloaded_at'
  | 'downloaded_by_session'
  | 'analysis_json'
  | 'analyzed_at'
  | 'analysis_error'
  | 'accepts_guest_posts'
  | 'primary_email'
  | 'link_value_score'
  | 'outreach_priority'
  | 'outreach_status'
  | 'contacted_at'
  | 'response_received_at'
  | 'notes'
  | 'created_at'
  | 'updated_at'
> {}

class OutreachEmail
  extends Model<OutreachEmailAttributes, OutreachEmailCreationAttributes>
  implements OutreachEmailAttributes
{
  public id!: number;

  public domain!: string;

  public campaign_name!: string;

  public original_prospecting_id!: number;

  public status!: OutreachEmailStatus | null;

  public downloaded_at!: Date | null;

  public downloaded_by_session!: string | null;

  public analysis_json!: string | null;

  public analyzed_at!: Date | null;

  public analysis_error!: string | null;

  public accepts_guest_posts!: number | null;

  public primary_email!: string | null;

  public link_value_score!: number | null;

  public outreach_priority!: OutreachPriority | null;

  public outreach_status!: OutreachStatus | null;

  public contacted_at!: Date | null;

  public response_received_at!: Date | null;

  public notes!: string | null;

  public readonly created_at!: Date;

  public readonly updated_at!: Date;
}

OutreachEmail.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
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
      allowNull: false,
      field: 'campaign_name',
    },
    original_prospecting_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'original_prospecting_id',
    },
    status: {
      type: DataTypes.ENUM('pending_analysis'),
      allowNull: true,
      defaultValue: 'pending_analysis',
      field: 'status',
    },
    downloaded_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'downloaded_at',
    },
    downloaded_by_session: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'downloaded_by_session',
    },
    analysis_json: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      field: 'analysis_json',
    },
    analyzed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'analyzed_at',
    },
    analysis_error: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      field: 'analysis_error',
    },
    accepts_guest_posts: {
      type: DataTypes.TINYINT,
      allowNull: true,
      field: 'accepts_guest_posts',
    },
    primary_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'primary_email',
    },
    link_value_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'link_value_score',
    },
    outreach_priority: {
      type: DataTypes.ENUM('Low', 'Medium', 'High'),
      allowNull: true,
      field: 'outreach_priority',
    },
    outreach_status: {
      type: DataTypes.ENUM('APPROVE', 'REJECT'),
      allowNull: true,
      field: 'outreach_status',
    },
    contacted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'contacted_at',
    },
    response_received_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'response_received_at',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'notes',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'outreach_emails',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { name: 'idx_domain', fields: ['domain'] },
      { name: 'idx_campaign_name', fields: ['campaign_name'] },
      { name: 'idx_original_prospecting_id', fields: ['original_prospecting_id'] },
      { name: 'idx_status', fields: ['status'] },
      { name: 'idx_analyzed_at', fields: ['analyzed_at'] },
    ],
  }
);

export default OutreachEmail;
