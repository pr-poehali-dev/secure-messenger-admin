-- Добавляем поля для каналов и групп в таблицу chats
ALTER TABLE chats ADD COLUMN IF NOT EXISTS is_channel BOOLEAN DEFAULT false;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
ALTER TABLE chats ADD COLUMN IF NOT EXISTS subscribers_count INTEGER DEFAULT 0;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Таблица для хранения вложений (файлов, изображений)
CREATE TABLE IF NOT EXISTS message_attachments (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id),
    file_type VARCHAR(50),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для блокировок пользователей
CREATE TABLE IF NOT EXISTS user_blocks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    blocked_by INTEGER REFERENCES users(id),
    reason TEXT,
    is_active BOOLEAN DEFAULT true,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unblocked_at TIMESTAMP
);

-- Таблица для отслеживания активности пользователей
CREATE TABLE IF NOT EXISTS user_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    messages_sent INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0,
    calls_made INTEGER DEFAULT 0,
    files_shared INTEGER DEFAULT 0,
    rating_score INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для приглашений друзей
CREATE TABLE IF NOT EXISTS friend_invites (
    id SERIAL PRIMARY KEY,
    inviter_id INTEGER REFERENCES users(id),
    invite_code VARCHAR(50) UNIQUE NOT NULL,
    used_by INTEGER REFERENCES users(id),
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_user ON user_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_invites_code ON friend_invites(invite_code);

-- Добавляем активность для существующих пользователей
INSERT INTO user_activity (user_id, messages_sent, rating_score)
SELECT id, 0, 100 FROM users
ON CONFLICT DO NOTHING;

-- Обновляем существующие чаты
UPDATE chats SET is_channel = false WHERE is_channel IS NULL;
UPDATE chats SET subscribers_count = (SELECT COUNT(*) FROM chat_members WHERE chat_id = chats.id);

-- Добавляем тестовые каналы
INSERT INTO chats (name, is_group, is_channel, avatar_emoji, description, created_by, subscribers_count) VALUES
('Новости Tech', true, true, '📱', 'Последние новости из мира технологий', 1, 1234),
('Дизайн и UI/UX', true, true, '🎨', 'Обсуждаем дизайн и интерфейсы', 1, 567),
('Программирование', true, true, '💻', 'Советы и лайфхаки для разработчиков', 1, 890);

-- Добавляем администратора в каналы
INSERT INTO chat_members (chat_id, user_id)
SELECT id, 1 FROM chats WHERE is_channel = true
ON CONFLICT DO NOTHING;