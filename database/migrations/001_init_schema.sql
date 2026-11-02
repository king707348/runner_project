-- =============================================================================
-- PACER Platform PostgreSQL Initial Schema (10/28 定案重構版)
-- =============================================================================

-- 1. 列舉型別定義 (ENUMs)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_provider') THEN
        CREATE TYPE auth_provider AS ENUM ('PASSWORD', 'GOOGLE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_category') THEN
        CREATE TYPE event_category AS ENUM ('MARATHON', 'ROAD_RUN', 'TRAIL', 'RELAY');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE event_status AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED', 'CLOSED', 'CANCELLED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_source') THEN
        CREATE TYPE event_source AS ENUM ('MANUAL', 'MANUAL_CRAWL', 'SCHEDULED_CRAWL');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crawl_status') THEN
        CREATE TYPE crawl_status AS ENUM ('SUCCESS', 'NO_NEW', 'FAILED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crawl_trigger') THEN
        CREATE TYPE crawl_trigger AS ENUM ('MANUAL', 'SCHEDULED');
    END IF;
END $$;

-- 2. 會員與第三方認證主表 (users)
-- 10/28 拍板：併入 user_oauth_accounts；採硬刪除 (移除 deleted_at)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NULL,
    role user_role NOT NULL DEFAULT 'USER',
    auth_provider auth_provider NOT NULL DEFAULT 'PASSWORD',
    has_oauth BOOLEAN NOT NULL DEFAULT FALSE,
    oauth_provider VARCHAR(50) NULL,
    oauth_id VARCHAR(255) NULL UNIQUE,
    oauth_email VARCHAR(255) NULL,
    encrypted_refresh_token TEXT NULL,
    token_expires_at TIMESTAMPTZ NULL,
    needs_reauth BOOLEAN NOT NULL DEFAULT FALSE,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    token_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 賽事主表 (events)
-- 10/28 拍板：併入組別欄位；賽事資料保留 (以 status 管理，移除 deleted_at)；venue, organizer, cover_url 均為 NOT NULL
CREATE TABLE IF NOT EXISTS events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category event_category NOT NULL,
    county VARCHAR(30) NOT NULL,
    district VARCHAR(30) NULL,
    venue VARCHAR(150) NOT NULL,
    organizer VARCHAR(150) NOT NULL,
    event_date DATE NOT NULL,
    registration_start DATE NULL,
    registration_end DATE NOT NULL,
    registration_url VARCHAR(500) NOT NULL,
    cover_url VARCHAR(500) NOT NULL,
    description TEXT NULL,
    distance_km NUMERIC(6, 2) NOT NULL,
    division_name VARCHAR(100) NULL,
    fee_ntd INTEGER NULL,
    start_time TIME NULL,
    status event_status NOT NULL DEFAULT 'PENDING',
    source event_source NOT NULL DEFAULT 'MANUAL_CRAWL',
    source_name VARCHAR(50) NULL DEFAULT '運動筆記',
    source_url VARCHAR(500) NULL,
    fingerprint VARCHAR(100) NULL UNIQUE,
    created_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    updated_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. 爬蟲任務紀錄表 (crawl_jobs)
CREATE TABLE IF NOT EXISTS crawl_jobs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    trigger crawl_trigger NOT NULL DEFAULT 'MANUAL',
    operator_id BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    status crawl_status NOT NULL,
    source_name VARCHAR(50) NOT NULL DEFAULT '運動筆記',
    fetched_count INTEGER NOT NULL DEFAULT 0,
    submitted_count INTEGER NOT NULL DEFAULT 0,
    failure_reason TEXT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    finished_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. 高效查詢索引 (Indexes)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_oauth_id ON users(oauth_id);
CREATE INDEX IF NOT EXISTS idx_events_status_reg_end ON events(status, registration_end);
CREATE INDEX IF NOT EXISTS idx_events_county_date ON events(county, event_date);
CREATE INDEX IF NOT EXISTS idx_events_distance ON events(distance_km);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_created_at ON crawl_jobs(created_at DESC);

-- 6. updated_at 自動維護觸發器 (Trigger)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_events_updated_at ON events;
CREATE TRIGGER trg_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
