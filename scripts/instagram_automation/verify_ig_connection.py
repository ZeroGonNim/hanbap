import os
import requests
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

def verify_connection():
    access_token = os.getenv('ACCESS_TOKEN')
    ig_user_id = os.getenv('IG_USER_ID')
    
    print("--- Instagram API Connection Test ---")
    print(f"IG_USER_ID: {ig_user_id}")
    
    # 1. 토큰 유효성 및 기본 정보 확인 (Facebook Me)
    url = f"https://graph.facebook.com/v19.0/me?fields=id,name&access_token={access_token}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Token is valid. Connected as: {data.get('name')} (ID: {data.get('id')})")
    else:
        print(f"❌ Token validation failed: {response.text}")
        return

    # 2. Instagram Business Account 정보 확인
    url = f"https://graph.facebook.com/v19.0/{ig_user_id}?fields=username,name,biography&access_token={access_token}"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Instagram Account found: @{data.get('username')} ({data.get('name')})")
        print(f"   Bio: {data.get('biography')}")
    else:
        print(f"❌ Failed to fetch Instagram account info: {response.text}")

if __name__ == "__main__":
    verify_connection()
