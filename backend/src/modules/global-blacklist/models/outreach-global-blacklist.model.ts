import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../utils/database.ts';

export interface OutreachGlobalBlacklistAttributes {
  id?: number;
  domain: string;
  added_at?: Date;
}

export interface OutreachGlobalBlacklistCreationAttributes extends Optional<
  OutreachGlobalBlacklistAttributes,
  'id' | 'added_at'
> {}

class OutreachGlobalBlacklist
  extends Model<OutreachGlobalBlacklistAttributes, OutreachGlobalBlacklistCreationAttributes>
  implements OutreachGlobalBlacklistAttributes
{
  public id!: number;

  public domain!: string;

  public readonly added_at!: Date;
}

OutreachGlobalBlacklist.init(
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
      unique: true,
      field: 'domain',
    },
    added_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'added_at',
    },
  },
  {
    sequelize,
    tableName: 'outreach_global_blacklist',
    timestamps: true,
    createdAt: 'added_at',
    updatedAt: false,
    indexes: [{ unique: true, name: 'domain', fields: ['domain'] }],
  }
);

export default OutreachGlobalBlacklist;
