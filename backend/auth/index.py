import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создает подключение к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    """Хеширует пароль"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    """Генерирует случайный токен"""
    return secrets.token_urlsafe(32)

def handler(event: dict, context) -> dict:
    """API для регистрации и авторизации пользователей"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if action == 'register':
            email = body.get('email')
            username = body.get('username')
            password = body.get('password')
            
            if not email or not username or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email, username и password обязательны'})
                }
            
            password_hash = hash_password(password)
            
            try:
                cur.execute(
                    "INSERT INTO users (email, username, password_hash) VALUES (%s, %s, %s) RETURNING id, email, username, created_at",
                    (email, username, password_hash)
                )
                user = cur.fetchone()
                conn.commit()
                
                token = generate_token()
                expires_at = datetime.now() + timedelta(days=30)
                
                cur.execute(
                    "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
                    (user['id'], token, expires_at)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'token': token,
                        'user': {
                            'id': user['id'],
                            'email': user['email'],
                            'username': user['username'],
                            'avatar_url': None
                        }
                    })
                }
            except psycopg2.IntegrityError:
                conn.rollback()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким email или username уже существует'})
                }
        
        elif action == 'login':
            email = body.get('email')
            password = body.get('password')
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email и password обязательны'})
                }
            
            password_hash = hash_password(password)
            
            cur.execute(
                "SELECT id, email, username, avatar_url FROM users WHERE email = %s AND password_hash = %s",
                (email, password_hash)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный email или пароль'})
                }
            
            token = generate_token()
            expires_at = datetime.now() + timedelta(days=30)
            
            cur.execute(
                "INSERT INTO sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
                (user['id'], token, expires_at)
            )
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'username': user['username'],
                        'avatar_url': user['avatar_url']
                    }
                })
            }
        
        elif action == 'verify':
            token = body.get('token')
            
            if not token:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Token обязателен'})
                }
            
            cur.execute(
                """
                SELECT u.id, u.email, u.username, u.avatar_url 
                FROM users u
                JOIN sessions s ON s.user_id = u.id
                WHERE s.token = %s AND s.expires_at > NOW()
                """,
                (token,)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Невалидный или истекший токен'})
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'username': user['username'],
                        'avatar_url': user['avatar_url']
                    }
                })
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие. Используйте action: register, login или verify'})
            }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
