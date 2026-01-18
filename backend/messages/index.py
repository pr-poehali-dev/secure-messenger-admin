import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для работы с чатами и сообщениями в защищённом мессенджере'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        query_params = event.get('queryStringParameters')
        if query_params is None:
            query_params = {}
        
        body_params = {}
        if event.get('body'):
            try:
                body_params = json.loads(event.get('body', '{}'))
            except:
                pass
        
        action = query_params.get('action', '') if query_params else body_params.get('action', '')
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor()
        
        if action == 'get_chats':
            user_id = body_params.get('user_id') or query_params.get('user_id', '1')
            
            cur.execute('''
                SELECT DISTINCT
                    c.id,
                    c.name,
                    c.avatar_emoji,
                    c.is_group,
                    (
                        SELECT m.text
                        FROM messages m
                        WHERE m.chat_id = c.id
                        ORDER BY m.created_at DESC
                        LIMIT 1
                    ) as last_message,
                    (
                        SELECT COUNT(*)
                        FROM messages m
                        WHERE m.chat_id = c.id
                        AND m.created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour'
                        AND m.sender_id != %s
                    ) as unread,
                    (
                        SELECT MAX(m.created_at)
                        FROM messages m
                        WHERE m.chat_id = c.id
                    ) as last_message_time,
                    (
                        SELECT u.is_online
                        FROM chat_members cm
                        JOIN users u ON u.id = cm.user_id
                        WHERE cm.chat_id = c.id AND cm.user_id != %s
                        LIMIT 1
                    ) as is_online
                FROM chats c
                JOIN chat_members cm ON cm.chat_id = c.id
                WHERE cm.user_id = %s
                ORDER BY last_message_time DESC NULLS LAST
            ''', (user_id, user_id, user_id))
            
            chats = []
            for row in cur.fetchall():
                chat_id, name, avatar, is_group, last_msg, unread, last_time, is_online = row
                
                if last_time:
                    now = datetime.now()
                    diff = now - last_time
                    if diff.days == 0:
                        time_str = last_time.strftime('%H:%M')
                    elif diff.days == 1:
                        time_str = 'Вчера'
                    else:
                        time_str = last_time.strftime('%d.%m')
                else:
                    time_str = ''
                
                chats.append({
                    'id': chat_id,
                    'name': name or 'Чат',
                    'lastMessage': last_msg or 'Нет сообщений',
                    'time': time_str,
                    'unread': unread or 0,
                    'avatar': avatar or '💬',
                    'online': is_online or False
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'chats': chats}),
                'isBase64Encoded': False
            }
        
        elif action == 'get_messages':
            chat_id = body_params.get('chat_id') or query_params.get('chat_id', '1')
            
            cur.execute('''
                SELECT
                    m.id,
                    m.text,
                    m.sender_id,
                    m.is_encrypted,
                    m.created_at,
                    u.username
                FROM messages m
                JOIN users u ON u.id = m.sender_id
                WHERE m.chat_id = %s
                ORDER BY m.created_at ASC
            ''', (chat_id,))
            
            user_id = body_params.get('user_id') or query_params.get('user_id', '1')
            messages = []
            
            for row in cur.fetchall():
                msg_id, text, sender_id, encrypted, created, username = row
                messages.append({
                    'id': msg_id,
                    'text': text,
                    'sender': 'me' if str(sender_id) == str(user_id) else 'other',
                    'time': created.strftime('%H:%M'),
                    'encrypted': encrypted
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'messages': messages}),
                'isBase64Encoded': False
            }
        
        elif action == 'send_message':
            body = json.loads(event.get('body', '{}'))
            chat_id = body.get('chat_id')
            sender_id = body.get('sender_id', 1)
            text = body.get('text', '')
            
            if not text or not chat_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing text or chat_id'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                INSERT INTO messages (chat_id, sender_id, text, is_encrypted, created_at)
                VALUES (%s, %s, %s, true, CURRENT_TIMESTAMP)
                RETURNING id, created_at
            ''', (chat_id, sender_id, text))
            
            msg_id, created = cur.fetchone()
            conn.commit()
            
            cur.execute('UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = %s', (chat_id,))
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'id': msg_id,
                    'text': text,
                    'sender': 'me',
                    'time': created.strftime('%H:%M'),
                    'encrypted': True
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'get_contacts':
            user_id = body_params.get('user_id') or query_params.get('user_id', '1')
            
            cur.execute('''
                SELECT
                    u.id,
                    u.display_name,
                    u.avatar_emoji,
                    u.is_online,
                    u.status,
                    u.last_seen
                FROM users u
                WHERE u.id != %s
                ORDER BY u.is_online DESC, u.display_name ASC
            ''', (user_id,))
            
            contacts = []
            for row in cur.fetchall():
                uid, name, avatar, online, status, last_seen = row
                
                if not online and last_seen:
                    now = datetime.now()
                    diff = now - last_seen
                    if diff.days == 0:
                        if diff.seconds < 3600:
                            status_text = f'Был {diff.seconds // 60} мин назад'
                        else:
                            status_text = f'Был {diff.seconds // 3600} часа назад'
                    elif diff.days == 1:
                        status_text = 'Был вчера'
                    else:
                        status_text = f'Был {diff.days} дней назад'
                else:
                    status_text = 'В сети'
                
                contacts.append({
                    'id': uid,
                    'name': name,
                    'status': status_text,
                    'avatar': avatar or '👤',
                    'online': online
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'contacts': contacts}),
                'isBase64Encoded': False
            }
        
        elif action == 'create_channel':
            body = json.loads(event.get('body', '{}'))
            name = body.get('name')
            description = body.get('description', '')
            avatar_emoji = body.get('avatar_emoji', '📢')
            creator_id = body.get('creator_id', 1)
            is_channel = body.get('is_channel', True)
            
            if not name:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing name'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                INSERT INTO chats (name, is_group, is_channel, avatar_emoji, description, created_by, subscribers_count)
                VALUES (%s, true, %s, %s, %s, %s, 1)
                RETURNING id
            ''', (name, is_channel, avatar_emoji, description, creator_id))
            
            chat_id = cur.fetchone()[0]
            
            cur.execute('INSERT INTO chat_members (chat_id, user_id) VALUES (%s, %s)', (chat_id, creator_id))
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': chat_id, 'name': name, 'success': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'get_all_users':
            cur.execute('''
                SELECT
                    u.id,
                    u.display_name,
                    u.username,
                    u.avatar_emoji,
                    u.is_online,
                    u.is_admin,
                    u.created_at,
                    EXISTS(SELECT 1 FROM user_blocks WHERE user_id = u.id AND is_active = true) as is_blocked
                FROM users u
                ORDER BY u.created_at DESC
            ''')
            
            users = []
            for row in cur.fetchall():
                uid, name, username, avatar, online, is_admin, created, is_blocked = row
                users.append({
                    'id': uid,
                    'name': name,
                    'username': username,
                    'avatar': avatar or '👤',
                    'online': online,
                    'isAdmin': is_admin,
                    'isBlocked': is_blocked,
                    'createdAt': created.strftime('%Y-%m-%d')
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'users': users}),
                'isBase64Encoded': False
            }
        
        elif action == 'block_user':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            blocked_by = body.get('blocked_by', 1)
            reason = body.get('reason', 'Нарушение правил')
            
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing user_id'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                INSERT INTO user_blocks (user_id, blocked_by, reason, is_active)
                VALUES (%s, %s, %s, true)
            ''', (user_id, blocked_by, reason))
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'User blocked'}),
                'isBase64Encoded': False
            }
        
        elif action == 'unblock_user':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id')
            
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing user_id'}),
                    'isBase64Encoded': False
                }
            
            cur.execute('''
                UPDATE user_blocks
                SET is_active = false, unblocked_at = CURRENT_TIMESTAMP
                WHERE user_id = %s AND is_active = true
            ''', (user_id,))
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'User unblocked'}),
                'isBase64Encoded': False
            }
        
        elif action == 'get_user_rating':
            user_id = body_params.get('user_id') or query_params.get('user_id', '1')
            
            cur.execute('''
                SELECT
                    messages_sent,
                    messages_received,
                    calls_made,
                    files_shared,
                    rating_score,
                    last_activity
                FROM user_activity
                WHERE user_id = %s
            ''', (user_id,))
            
            row = cur.fetchone()
            if row:
                msgs_sent, msgs_recv, calls, files, rating, last_act = row
                rating_data = {
                    'messagesSent': msgs_sent,
                    'messagesReceived': msgs_recv,
                    'callsMade': calls,
                    'filesShared': files,
                    'ratingScore': rating,
                    'lastActivity': last_act.strftime('%Y-%m-%d %H:%M') if last_act else ''
                }
            else:
                rating_data = {
                    'messagesSent': 0,
                    'messagesReceived': 0,
                    'callsMade': 0,
                    'filesShared': 0,
                    'ratingScore': 100,
                    'lastActivity': ''
                }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(rating_data),
                'isBase64Encoded': False
            }
        
        elif action == 'create_invite':
            body = json.loads(event.get('body', '{}'))
            inviter_id = body.get('inviter_id', 1)
            
            import random
            import string
            invite_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            
            cur.execute('''
                INSERT INTO friend_invites (inviter_id, invite_code)
                VALUES (%s, %s)
                RETURNING id
            ''', (inviter_id, invite_code))
            
            invite_id = cur.fetchone()[0]
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'inviteCode': invite_code, 'id': invite_id}),
                'isBase64Encoded': False
            }
        
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Not found', 'action': action, 'query_params': query_params}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }