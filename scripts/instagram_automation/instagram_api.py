import os
import requests
import json
from dotenv import load_dotenv

# .env 파일에서 설정 로드
load_dotenv()

class InstagramAPI:
    def __init__(self):
        self.ig_user_id = os.getenv('IG_USER_ID')
        self.access_token = os.getenv('ACCESS_TOKEN')
        self.base_url = "https://graph.facebook.com/v19.0"

    def create_media_container(self, image_url, caption):
        """1단계: 인스타그램 서버에 이미지를 업로드하고 컨테이너 ID를 발급받습니다."""
        url = f"{self.base_url}/{self.ig_user_id}/media"
        payload = {
            'image_url': image_url,
            'caption': caption,
            'access_token': self.access_token
        }
        response = requests.post(url, data=payload)
        
        if response.status_code == 200:
            return response.json().get('id')
        else:
            print(f"Error creating container: {response.text}")
            return None

    def publish_media(self, creation_id):
        """2단계: 발급받은 컨테이너 ID를 사용하여 실제 피드에 게시합니다."""
        url = f"{self.base_url}/{self.ig_user_id}/media_publish"
        payload = {
            'creation_id': creation_id,
            'access_token': self.access_token
        }
        response = requests.post(url, data=payload)
        
        if response.status_code == 200:
            print("Successfully published to Instagram!")
            return response.json()
        else:
            print(f"Error publishing media: {response.text}")
            return None

    def post_image(self, image_url, caption):
        """이미지 URL과 캡션을 받아 원스톱으로 포스팅을 수행합니다."""
        print(f"Starting Instagram post for: {image_url}")
        container_id = self.create_media_container(image_url, caption)
        
        if container_id:
            return self.publish_media(container_id)
        return None

if __name__ == "__main__":
    # 테스트 실행 (토큰이 설정되어 있을 때만 동작)
    ig = InstagramAPI()
    # test_url = "https://example.com/test_image.jpg"
    # ig.post_image(test_url, "API 테스트 포스팅입니다. #HnaBap #인스타자동화")
