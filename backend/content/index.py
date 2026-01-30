import json
import os
import base64
import uuid
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3

def get_db_connection():
    """Создает подключение к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_s3_client():
    """Создает S3 клиент"""
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )

def get_user_from_token(token: str, cur) -> dict:
    """Получает пользователя по токену"""
    cur.execute(
        """
        SELECT u.id, u.email, u.username 
        FROM users u
        JOIN sessions s ON s.user_id = u.id
        WHERE s.token = %s AND s.expires_at > NOW()
        """,
        (token,)
    )
    return cur.fetchone()

def handler(event: dict, context) -> dict:
    """API для загрузки и получения контента"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': ''
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            content_type = query_params.get('type')
            user_id = query_params.get('user_id')
            
            query = "SELECT c.*, u.username as author FROM content c JOIN users u ON c.user_id = u.id WHERE 1=1"
            params = []
            
            if content_type:
                query += " AND c.type = %s"
                params.append(content_type)
            
            if user_id:
                query += " AND c.user_id = %s"
                params.append(int(user_id))
            
            query += " ORDER BY c.created_at DESC LIMIT 100"
            
            cur.execute(query, params)
            content_list = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(item) for item in content_list], default=str)
            }
        
        elif method == 'POST':
            auth_header = event.get('headers', {}).get('authorization', '')
            token = auth_header.replace('Bearer ', '') if auth_header else None
            
            if not token:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Требуется авторизация'})
                }
            
            user = get_user_from_token(token, cur)
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Невалидный токен'})
                }
            
            body = json.loads(event.get('body', '{}'))
            
            content_type = body.get('type')
            title = body.get('title')
            description = body.get('description', '')
            category = body.get('category', '')
            price = body.get('price', 0)
            file_data = body.get('file_data')
            file_name = body.get('file_name')
            
            if not content_type or not title or not file_data or not file_name:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'type, title, file_data и file_name обязательны'})
                }
            
            if content_type not in ['game', 'music', 'video', 'short_video', 'image']:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный тип контента'})
                }
            
            try:
                file_bytes = base64.b64decode(file_data)
            except Exception:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный формат file_data (ожидается base64)'})
                }
            
            s3 = get_s3_client()
            unique_filename = f"{content_type}s/{uuid.uuid4()}_{file_name}"
            
            content_type_map = {
                'game': 'application/zip',
                'music': 'audio/mpeg',
                'video': 'video/mp4',
                'short_video': 'video/mp4',
                'image': 'image/jpeg'
            }
            
            s3.put_object(
                Bucket='files',
                Key=unique_filename,
                Body=file_bytes,
                ContentType=content_type_map.get(content_type, 'application/octet-stream')
            )
            
            file_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{unique_filename}"
            
            cur.execute(
                """
                INSERT INTO content (user_id, type, title, description, file_url, category, price)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, user_id, type, title, description, file_url, category, price, created_at
                """,
                (user['id'], content_type, title, description, file_url, category, price)
            )
            new_content = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(new_content), default=str)
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
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
