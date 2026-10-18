DROP TABLE IF EXISTS users CASCADE;

-- ユーザー情報
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS user_work_hours CASCADE;

-- 曜日ごとの稼働時間
CREATE TABLE user_work_hours (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0:日曜，6：土曜
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    PRIMARY KEY (user_id, day_of_week)
);

DROP TABLE IF EXISTS recurring_events CASCADE;

-- 毎週繰り返すイベント
CREATE TABLE recurring_events (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0:日曜，6：土曜
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    generated_until DATE
);

DROP TABLE IF EXISTS fixed_events CASCADE;

-- 固定イベント（recurring_eventsから生成，または単発イベント）
CREATE TABLE fixed_events (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    recurring_event_id BIGINT REFERENCES recurring_events(id),
    date DATE NOT NULL,
    UNIQUE (recurring_event_id, date),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

DROP TABLE IF EXISTS tasks CASCADE;

-- タスク
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    position INT NOT NULL,
    minutes INT NOT NULL,
    scheduled_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('todo', 'done', 'carryover')) DEFAULT 'todo',
    created_at TIMESTAMP NOT NULL DEFAULT now()
);