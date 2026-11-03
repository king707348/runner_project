-- =============================================================================
-- PACER Platform Comprehensive Mock Seed Data (豐富測試假資料集)
-- 包含各類角色會員、多樣化賽事（涵蓋全部狀態、分類、縣市、距離）與爬蟲任務紀錄
-- =============================================================================

-- 1. 假會員資料集（密碼皆為 Password123!，Hash 值固定）
INSERT INTO users (
    email, nickname, password_hash, role, auth_provider, 
    has_oauth, oauth_provider, oauth_id, oauth_email, 
    must_change_password, needs_reauth, token_version
)
VALUES 
-- 1.1 系統管理員
(
    'admin@pacer.com', 
    '系統管理員 (James)', 
    '$2b$10$wE9mG.V0zW8N1wD7kLp8x.a8iO0G9J1L8e2C4F6h8J0k2M4N6P8R.', 
    'ADMIN', 
    'PASSWORD', 
    FALSE, NULL, NULL, NULL, FALSE, FALSE, 1
),
-- 1.2 一般密碼會員（正常狀態）
(
    'runner1@pacer.com', 
    '阿明愛慢跑', 
    '$2b$10$wE9mG.V0zW8N1wD7kLp8x.a8iO0G9J1L8e2C4F6h8J0k2M4N6P8R.', 
    'USER', 
    'PASSWORD', 
    FALSE, NULL, NULL, NULL, FALSE, FALSE, 1
),
-- 1.3 一般密碼會員（臨時密碼情境，強制改密碼）
(
    'temp_pass_user@pacer.com', 
    '待改密碼跑者', 
    '$2b$10$wE9mG.V0zW8N1wD7kLp8x.a8iO0G9J1L8e2C4F6h8J0k2M4N6P8R.', 
    'USER', 
    'PASSWORD', 
    FALSE, NULL, NULL, NULL, TRUE, FALSE, 1
),
-- 1.4 Google 第三方綁定會員（正常授權）
(
    'google_runner@gmail.com', 
    '小皮跑跑 (Google)', 
    NULL, 
    'USER', 
    'GOOGLE', 
    TRUE, 'GOOGLE', 'google-oauth2-sub-998877665544332211', 'google_runner@gmail.com', 
    FALSE, FALSE, 1
),
-- 1.5 Google 第三方綁定會員（授權過期需重新授權情境）
(
    'reauth_runner@gmail.com', 
    '授權失效會員', 
    NULL, 
    'USER', 
    'GOOGLE', 
    TRUE, 'GOOGLE', 'google-oauth2-sub-112233445566778899', 'reauth_runner@gmail.com', 
    FALSE, TRUE, 1
)
ON CONFLICT (email) DO UPDATE SET 
    nickname = EXCLUDED.nickname,
    has_oauth = EXCLUDED.has_oauth,
    role = EXCLUDED.role;

-- 2. 假賽事資料集（涵蓋所有狀態、分類、距離、主辦方與封面圖情境）
INSERT INTO events (
    name, category, county, district, venue, organizer, 
    event_date, registration_start, registration_end, registration_url, cover_url, 
    description, distance_km, division_name, fee_ntd, start_time, status, source, source_name, fingerprint
)
VALUES 
-- 2.1 臺北市 - 已發布全馬（金標籤、熱門）
(
    '2026 臺北馬拉松 (Taipei Marathon)',
    'MARATHON',
    '臺北市',
    '信義區',
    '臺北市政府前市民廣場',
    '臺北市政府體育局',
    '2026-12-20',
    '2026-08-01',
    '2026-10-31',
    'https://www.taipeicitymarathon.com/',
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
    '世界田總金標籤認證！平坦優質的城市賽道，經過各大經典地標，是全台指標性年終大拜拜馬拉松。',
    42.19,
    '全馬組 (42.195K) / 半馬組 (21.0975K)',
    1800,
    '06:30:00',
    'PUBLISHED',
    'MANUAL',
    '官方發布',
    'mock_taipei_marathon_2026'
),
-- 2.2 臺北市 - 已發布 10K 路跑（公益、親民）
(
    '2027 渣打臺北公益馬拉松',
    'ROAD_RUN',
    '臺北市',
    '中山區',
    '大佳河濱公園噴泉廣場',
    '渣打國際商業銀行',
    '2027-01-10',
    '2026-09-15',
    '2026-11-30',
    'https://scbmarathon.com/',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
    '最適合冬季突破個人最佳紀錄 (PB) 的筆直平坦河濱賽道，為公益與信念而跑！',
    10.00,
    '挑戰組 (10K) / 呼吸組 (3K)',
    900,
    '07:00:00',
    'PUBLISHED',
    'MANUAL_CRAWL',
    '運動筆記',
    'mock_scb_taipei_2027'
),
-- 2.3 臺北市 - 已發布 5K 夜跑（短距離、新手推薦）
(
    '2026 臺北大佳河濱星光夜跑',
    'ROAD_RUN',
    '臺北市',
    '中山區',
    '大佳河濱公園大直橋下',
    '中華民國路跑協會',
    '2026-11-28',
    '2026-09-01',
    '2026-11-15',
    'https://running.biji.co/index.php?q=competition&act=info&cid=dajia_night',
    'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?auto=format&fit=crop&w=1200&q=80',
    '涼爽宜人的初冬夜跑，伴隨大直橋光雕與美麗華摩天輪夜景，適合下班後好友與家庭同樂。',
    5.00,
    '星光休閒組 (5K)',
    600,
    '18:30:00',
    'PUBLISHED',
    'MANUAL_CRAWL',
    '運動筆記',
    'mock_dajia_night_2026'
),
-- 2.4 新北市 - 已發布越野賽（TRAIL 分類測試）
(
    '2026 烏來峽谷超級越野挑戰賽',
    'TRAIL',
    '新北市',
    '烏來區',
    '烏來綜合體育場',
    '台灣戶外越野協會',
    '2026-12-06',
    '2026-08-15',
    '2026-11-10',
    'https://running.biji.co/index.php?q=competition&act=info&cid=wulai_trail',
    'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=1200&q=80',
    '穿梭於原始林道與清涼溪谷之間，高低落差 650 公尺，考驗腳力與山徑跑技巧的經典越野賽事。',
    15.00,
    '山林挑戰組 (15K) / 越野健行組 (7K)',
    1300,
    '07:00:00',
    'PUBLISHED',
    'MANUAL_CRAWL',
    '伊貝特報名網',
    'mock_wulai_trail_2026'
),
-- 2.5 宜蘭縣 - 已發布接力賽（RELAY 分類測試）
(
    '2026 冬山河水岸超級馬拉松五人接力賽',
    'RELAY',
    '宜蘭縣',
    '五結鄉',
    '冬山河親水公園司令台',
    '宜蘭縣體育會',
    '2026-11-21',
    '2026-08-01',
    '2026-10-31',
    'https://running.biji.co/index.php?q=competition&act=info&cid=dongshan_relay',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
    '沿著冬山河兩岸筆直自行車道接力奔馳，考驗團隊默契與棒次配速戰略，最歡樂的團體賽事。',
    50.00,
    '五人接力公開組 (5 x 10K)',
    3000,
    '06:30:00',
    'PUBLISHED',
    'MANUAL',
    '官方發布',
    'mock_dongshan_relay_2026'
),
-- 2.6 南投縣 - 待審核賽事（PENDING，供後台審核功能測試）
(
    '2026 第十一屆日月潭環湖馬拉松',
    'MARATHON',
    '南投縣',
    '魚池鄉',
    '向山遊客中心大草坪',
    '南投縣政府',
    '2026-11-15',
    '2026-07-01',
    '2026-10-15',
    'https://running.biji.co/index.php?q=competition&act=info&cid=sunmoonlake2026',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    '環繞日月潭湖光山色，沿途風景秀麗但上下坡挑戰極大，為待審核上架賽事範例。',
    21.10,
    '環湖半馬組 (21.1K) / 健走組 (6K)',
    1200,
    '06:00:00',
    'PENDING',
    'MANUAL_CRAWL',
    '運動筆記',
    'mock_sunmoonlake_2026'
),
-- 2.7 花蓮縣 - 待審核賽事 2（PENDING，供後台審核功能測試）
(
    '2026 雲朗觀光太魯閣峽谷馬拉松',
    'MARATHON',
    '花蓮縣',
    '秀林鄉',
    '太魯閣國家公園錦文橋南端',
    '花蓮縣馬拉松路跑協會',
    '2026-11-07',
    '2026-07-15',
    '2026-09-30',
    'https://running.biji.co/index.php?q=competition&act=info&cid=taroko2026',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    '跑在鬼斧神工的太魯閣大理石峽谷之中，一生必跑一次的壯闊視覺饗宴。（待審核賽事）',
    42.19,
    '全程馬拉松 (42.195K) / 逍遙馬 (12K)',
    1600,
    '06:45:00',
    'PENDING',
    'MANUAL_CRAWL',
    '運動筆記',
    'mock_taroko_2026'
),
-- 2.8 桃園市 - 已拒絕審核賽事（REJECTED，供後台查看退件紀錄）
(
    '2026 桃園航空城創意路跑嘉年華',
    'ROAD_RUN',
    '桃園市',
    '大園區',
    '大園國小操場',
    '民間活動行銷工作室',
    '2026-10-25',
    '2026-08-01',
    '2026-10-10',
    'https://example.com/rejected_race',
    '/images/default-event-cover.jpg',
    '活動簡章未完備、交管計畫審查未通過，經管理員後台退件駁回之賽事範例。',
    10.00,
    '歡樂組 (10K)',
    500,
    '08:00:00',
    'REJECTED',
    'MANUAL',
    '手動提報',
    'mock_taoyuan_rejected_2026'
),
-- 2.9 新北市 - 已截止賽事（CLOSED，無封面圖 ➔ 輸出預設圖，測試自動過濾）
(
    '2026 新北市萬金石馬拉松',
    'MARATHON',
    '新北市',
    '萬里區',
    '太平洋翡翠灣美崙飯店前',
    '新北市政府體育局',
    '2026-03-15',
    '2025-10-15',
    '2025-11-20',
    'https://wanjinshi-marathon.com.tw/',
    '/images/default-event-cover.jpg',
    '世界田總金標籤北海岸維納斯海岸賽道。報名截止日已過，狀態為 CLOSED；封面圖使用預設圖。',
    42.19,
    '全馬組 (42.195K) / 挑戰組 (10K)',
    1600,
    '06:30:00',
    'CLOSED',
    'MANUAL_CRAWL',
    '運動筆記',
    'mock_wanjinshi_2026'
),
-- 2.10 嘉義縣 - 已取消賽事（CANCELLED，測試停辦狀態展示）
(
    '2026 阿里山日出雲海高山越野路跑',
    'TRAIL',
    '嘉義縣',
    '阿里山鄉',
    '阿里山森林遊樂區旅客服務中心',
    '高山路跑推廣協會',
    '2026-10-18',
    '2026-06-01',
    '2026-09-01',
    'https://example.com/alishan_cancelled',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    '因近期山區連續強降雨導致步道坍方，為顧及跑者安全經主辦單位決議停辦。',
    12.00,
    '日出組 (12K)',
    1100,
    '05:30:00',
    'CANCELLED',
    'MANUAL',
    '官方發布',
    'mock_alishan_cancelled_2026'
)
ON CONFLICT (fingerprint) DO UPDATE SET 
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    status = EXCLUDED.status,
    distance_km = EXCLUDED.distance_km,
    cover_url = EXCLUDED.cover_url;

-- 3. 假爬蟲任務紀錄集（供後台 A16 總覽儀表板測試多樣化狀態）
INSERT INTO crawl_jobs (
    trigger, status, source_name, fetched_count, submitted_count, failure_reason,
    started_at, finished_at
)
VALUES 
-- 3.1 定時排程成功
(
    'SCHEDULED',
    'SUCCESS',
    '運動筆記',
    42,
    18,
    NULL,
    NOW() - INTERVAL '2 hour',
    NOW() - INTERVAL '1 hour 58 minute'
),
-- 3.2 手動觸發成功
(
    'MANUAL',
    'SUCCESS',
    '伊貝特報名網',
    25,
    10,
    NULL,
    NOW() - INTERVAL '5 hour',
    NOW() - INTERVAL '4 hour 59 minute'
),
-- 3.3 手動觸發 - 無新賽事
(
    'MANUAL',
    'NO_NEW',
    '運動筆記',
    20,
    0,
    NULL,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day' + INTERVAL '1 minute'
),
-- 3.4 手動觸發 - 外部網路連線逾時失敗
(
    'MANUAL',
    'FAILED',
    '運動筆記',
    0,
    0,
    '連線逾時：外部來源伺服器超過 30 秒未回應 (ETIMEDOUT)',
    NOW() - INTERVAL '2 day',
    NOW() - INTERVAL '2 day' + INTERVAL '30 second'
);
