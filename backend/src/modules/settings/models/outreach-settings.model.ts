import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../utils/database.ts';

export interface OutreachSettingsAttributes {
  id?: number;
  setting_key: string;
  setting_value?: string | null;
  updated_at?: Date;
}

export interface OutreachSettingsCreationAttributes extends Optional<
  OutreachSettingsAttributes,
  'id' | 'setting_value' | 'updated_at'
> {}

class OutreachSettings
  extends Model<OutreachSettingsAttributes, OutreachSettingsCreationAttributes>
  implements OutreachSettingsAttributes
{
  public id!: number;

  public setting_key!: string;

  public setting_value!: string | null;

  public readonly updated_at!: Date;
}

OutreachSettings.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    setting_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'setting_key',
    },
    setting_value: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'setting_value',
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
    tableName: 'outreach_settings',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at',
    indexes: [{ unique: true, name: 'idx_setting_key', fields: ['setting_key'] }],
  }
);

export default OutreachSettings;
