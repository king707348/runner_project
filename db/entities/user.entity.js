const { EntitySchema } = require('typeorm');

/**
 * 使用者（會員）資料表 users。
 * 支援密碼登入與 Google OAuth 兩種驗證方式。
 */
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
    // 密碼雜湊；OAuth 帳號可為空。select: false 代表預設查詢不會取出，避免外洩
    passwordHash: {
      name: 'password_hash',
      type: 'varchar',
      length: 255,
      nullable: true,
      select: false,
    },
    // 角色：USER 一般會員 / ADMIN 管理員
    role: {
      type: 'enum',
      enum: ['USER', 'ADMIN'],
      enumName: 'user_role',
      default: 'USER',
    },
    // 主要登入方式：PASSWORD 或 GOOGLE
    authProvider: {
      name: 'auth_provider',
      type: 'enum',
      enum: ['PASSWORD', 'GOOGLE'],
      enumName: 'auth_provider',
      default: 'PASSWORD',
    },
    // 是否已綁定第三方登入
    hasOauth: {
      name: 'has_oauth',
      type: 'boolean',
      default: false,
    },
    // 第三方登入供應商名稱
    oauthProvider: {
      name: 'oauth_provider',
      type: 'varchar',
      length: 50,
      nullable: true,
    },
    // 第三方登入的使用者唯一識別碼
    oauthId: {
      name: 'oauth_id',
      type: 'varchar',
      length: 255,
      nullable: true,
      unique: true,
    },
    // 第三方登入帶回的 Email
    oauthEmail: {
      name: 'oauth_email',
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    // 加密後的 refresh token；select: false 代表預設查詢不會取出
    encryptedRefreshToken: {
      name: 'encrypted_refresh_token',
      type: 'text',
      nullable: true,
      select: false,
    },
    // 第三方 token 到期時間
    tokenExpiresAt: {
      name: 'token_expires_at',
      type: 'timestamptz',
      nullable: true,
    },
    // 第三方授權失效，需要使用者重新授權
    needsReauth: {
      name: 'needs_reauth',
      type: 'boolean',
      default: false,
    },
    // 是否強制下次登入時變更密碼
    mustChangePassword: {
      name: 'must_change_password',
      type: 'boolean',
      default: false,
    },
    // Token 版本號；遞增後可使先前核發的 JWT 全部失效
    tokenVersion: {
      name: 'token_version',
      type: 'int',
      default: 1,
    },
    // 建立時間（由 TypeORM 自動填入）
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
    },
    // 更新時間（由 TypeORM 自動填入；資料庫也有觸發器保底）
    updatedAt: {
      name: 'updated_at',
      type: 'timestamptz',
      updateDate: true,
    },
  },
});

module.exports = { UserSchema };
