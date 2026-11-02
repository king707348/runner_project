const { EntitySchema } = require('typeorm');

const UserSchema = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'bigint',
      generated: 'identity',
    },
    email: {
      type: 'varchar',
      length: 255,
      unique: true,
    },
    nickname: {
      type: 'varchar',
      length: 50,
    },
    password_hash: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    role: {
      type: 'enum',
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
    auth_provider: {
      type: 'enum',
      enum: ['PASSWORD', 'GOOGLE'],
      default: 'PASSWORD',
    },
    has_oauth: {
      type: 'boolean',
      default: false,
    },
    oauth_provider: {
      type: 'varchar',
      length: 50,
      nullable: true,
    },
    oauth_id: {
      type: 'varchar',
      length: 255,
      nullable: true,
      unique: true,
    },
    oauth_email: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    encrypted_refresh_token: {
      type: 'text',
      nullable: true,
    },
    token_expires_at: {
      type: 'timestamptz',
      nullable: true,
    },
    needs_reauth: {
      type: 'boolean',
      default: false,
    },
    must_change_password: {
      type: 'boolean',
      default: false,
    },
    token_version: {
      type: 'int',
      default: 1,
    },
    created_at: {
      type: 'timestamptz',
      createDate: true,
    },
    updated_at: {
      type: 'timestamptz',
      updateDate: true,
    },
  },
});

module.exports = { UserSchema };
