-- Создание таблиц для защищённого мессенджера

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_emoji VARCHAR(10) DEFAULT '👤',
    status TEXT DEFAULT 'Привет! Я использую Messenger',
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица чатов
CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    is_group BOOLEAN DEFAULT false,
    avatar_emoji VARCHAR(10) DEFAULT '💬',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Участники чатов
CREATE TABLE IF NOT EXISTS chat_members (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id),
    user_id INTEGER REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chat_id, user_id)
);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id),
    sender_id INTEGER REFERENCES users(id),
    text TEXT NOT NULL,
    is_encrypted BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user_id ON chat_members(user_id);

-- Тестовые данные
INSERT INTO users (username, display_name, avatar_emoji, is_online, is_admin) VALUES
    ('ivan_ivanov', 'Иван Иванов', '👤', true, true),
    ('anna_smirnova', 'Анна Смирнова', '👩', true, false),
    ('ivan_petrov', 'Иван Петров', '👨', false, false),
    ('maria_kuznetsova', 'Мария Кузнецова', '👱‍♀️', false, false),
    ('alex_novikov', 'Алексей Новиков', '🧑', true, false)
ON CONFLICT (username) DO NOTHING;

-- Создаём чаты между пользователями
INSERT INTO chats (name, is_group, avatar_emoji) VALUES
    ('Анна Смирнова', false, '👩'),
    ('Иван Петров', false, '👨'),
    ('Команда разработки', true, '👥'),
    ('Мария Кузнецова', false, '👱‍♀️'),
    ('Алексей Новиков', false, '🧑')
ON CONFLICT DO NOTHING;

-- Добавляем участников в чаты
INSERT INTO chat_members (chat_id, user_id)
SELECT 1, id FROM users WHERE username IN ('ivan_ivanov', 'anna_smirnova')
ON CONFLICT DO NOTHING;

INSERT INTO chat_members (chat_id, user_id)
SELECT 2, id FROM users WHERE username IN ('ivan_ivanov', 'ivan_petrov')
ON CONFLICT DO NOTHING;

INSERT INTO chat_members (chat_id, user_id)
SELECT 3, id FROM users WHERE username IN ('ivan_ivanov', 'anna_smirnova', 'alex_novikov')
ON CONFLICT DO NOTHING;

INSERT INTO chat_members (chat_id, user_id)
SELECT 4, id FROM users WHERE username IN ('ivan_ivanov', 'maria_kuznetsova')
ON CONFLICT DO NOTHING;

INSERT INTO chat_members (chat_id, user_id)
SELECT 5, id FROM users WHERE username IN ('ivan_ivanov', 'alex_novikov')
ON CONFLICT DO NOTHING;

-- Добавляем тестовые сообщения
INSERT INTO messages (chat_id, sender_id, text, is_encrypted)
SELECT 1, u.id, 'Привет! Как твой проект?', true
FROM users u WHERE u.username = 'anna_smirnova';

INSERT INTO messages (chat_id, sender_id, text, is_encrypted)
SELECT 1, u.id, 'Отлично! Почти закончил', true
FROM users u WHERE u.username = 'ivan_ivanov';

INSERT INTO messages (chat_id, sender_id, text, is_encrypted)
SELECT 1, u.id, 'Привет! Как дела?', true
FROM users u WHERE u.username = 'anna_smirnova';

INSERT INTO messages (chat_id, sender_id, text, is_encrypted)
SELECT 2, u.id, 'Отправил файлы', true
FROM users u WHERE u.username = 'ivan_petrov';

INSERT INTO messages (chat_id, sender_id, text, is_encrypted)
SELECT 3, u.id, 'Созвон в 15:00', true
FROM users u WHERE u.username = 'alex_novikov';

INSERT INTO messages (chat_id, sender_id, text, is_encrypted)
SELECT 4, u.id, 'Спасибо за помощь!', true
FROM users u WHERE u.username = 'maria_kuznetsova';

INSERT INTO messages (chat_id, sender_id, text, is_encrypted)
SELECT 5, u.id, 'Встречаемся завтра', true
FROM users u WHERE u.username = 'alex_novikov';