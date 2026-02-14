import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../utils/database.ts';

export interface OutreachEmailGenerationAttributes {
  id?: number;
  email_id: number;
  domain: string;
  prompt_used: string;
  generated_email: string;
  generated_at?: Date;
}

export interface OutreachEmailGenerationCreationAttributes extends Optional<
  OutreachEmailGenerationAttributes,
  'id' | 'generated_at'
> {}

class OutreachEmailGeneration
  extends Model<OutreachEmailGenerationAttributes, OutreachEmailGenerationCreationAttributes>
  implements OutreachEmailGenerationAttributes
{
  public id!: number;

  public email_id!: number;

  public domain!: string;

  public prompt_used!: string;

  public generated_email!: string;

  public readonly generated_at!: Date;
}

OutreachEmailGeneration.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      field: 'id',
    },
    email_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: 'email_id',
    },
    domain: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'domain',
    },
    prompt_used: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'prompt_used',
    },
    generated_email: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'generated_email',
    },
    generated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'generated_at',
    },
  },
  {
    sequelize,
    tableName: 'outreach_email_generations',
    timestamps: false,
    indexes: [
      { name: 'idx_email_id', fields: ['email_id'] },
      { name: 'idx_domain', fields: ['domain'] },
    ],
  }
);

export default OutreachEmailGeneration;
