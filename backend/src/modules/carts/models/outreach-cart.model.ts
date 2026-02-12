import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../utils/database.ts';

export interface OutreachCartAttributes {
  id?: number;
  session_id: string;
  domain: string;
  keywords?: string | null;
  similarity_score?: number | null;
  spider_id?: number | null;
  campaign_id?: number | null;
  added_at?: Date;
}

export interface OutreachCartCreationAttributes extends Optional<
  OutreachCartAttributes,
  'id' | 'keywords' | 'similarity_score' | 'spider_id' | 'campaign_id' | 'added_at'
> {}

class OutreachCart
  extends Model<OutreachCartAttributes, OutreachCartCreationAttributes>
  implements OutreachCartAttributes
{
  public id!: number;

  public session_id!: string;

  public domain!: string;

  public keywords!: string | null;

  public similarity_score!: number | null;

  public spider_id!: number | null;

  public campaign_id!: number | null;

  public readonly added_at!: Date;
}

OutreachCart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'session_id',
    },
    domain: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'domain',
    },
    keywords: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'keywords',
    },
    similarity_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'similarity_score',
      get() {
        const value = this.getDataValue('similarity_score');
        return value != null ? Number(value) : null;
      },
    },
    spider_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'spider_id',
    },
    campaign_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'campaign_id',
      references: { model: 'outreach_campaigns', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    added_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: 'added_at',
    },
  },
  {
    sequelize,
    tableName: 'outreach_cart',
    timestamps: false,
    indexes: [
      { name: 'idx_cart_session', fields: ['session_id'] },
      { name: 'unique_session_domain', unique: true, fields: ['session_id', 'domain'] },
    ],
  }
);

export default OutreachCart;
