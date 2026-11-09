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
    passwordHash: {
      name: 'password_hash',
      type: 'varchar',
      length: 255,
      nullable: true,
      select: false,
    },
    role: {
      type: 'enum',
      enum: ['USER', 'ADMIN'],
      enumName: 'user_role',
      default: 'USER',
    },
    authProvider: {
      name: 'auth_provider',
      type: 'enum',
      enum: ['PASSWORD', 'GOOGLE'],
      enumName: 'auth_provider',
      default: 'PASSWORD',
    },
    hasOauth: {
      name: 'has_oauth',
      type: 'boolean',
      default: false,
    },
    oauthProvider: {
      name: 'oauth_provider',
      type: 'varchar',
      length: 50,
      nullable: true,
    },
    oauthId: {
      name: 'oauth_id',
      type: 'varchar',
      length: 255,
      nullable: true,
      unique: true,
    },
    oauthEmail: {
      name: 'oauth_email',
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    encryptedRefreshToken: {
      name: 'encrypted_refresh_token',
      type: 'text',
      nullable: true,
      select: false,
    },
    tokenExpiresAt: {
      name: 'token_expires_at',
      type: 'timestamptz',
      nullable: true,
    },
    needsReauth: {
      name: 'needs_reauth',
      type: 'boolean',
      default: false,
    },
    mustChangePassword: {
      name: 'must_change_password',
      type: 'boolean',
      default: false,
    },
    tokenVersion: {
      name: 'token_version',
      type: 'int',
      default: 1,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamptz',
      updateDate: true,
    },
  },
});

module.exports = { UserSchema };
