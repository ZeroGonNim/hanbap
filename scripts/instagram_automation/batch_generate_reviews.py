import os
import re
import json
from generate_review_card import create_review_card

# 파일 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REVIEW_DATA_PATH = os.path.join(BASE_DIR, "../../frontend/src/data/reviewData.ts")

def extract_reviews_from_ts():
    """reviewData.ts 파일에서 리뷰 배열을 추출합니다."""
    try:
        with open(REVIEW_DATA_PATH, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # TypeScript 파일에서 JSON 형태의 배열 부분만 정규식으로 추출
        # 예: export const reviewData: Review[] = [ ... ];
        match = re.search(r'\[.*\]', content, re.DOTALL)
        if not match:
            print("Could not find review array in reviewData.ts")
            return []
            
        # 간단한 파싱을 위해 따옴표 및 주석 처리 (실제 환경에 따라 보정 필요)
        # 여기서는 가장 단순한 형태의 추출을 시도합니다.
        # 실제 운영시에는 정적인 JSON 파일을 사용하는 것이 더 안정적입니다.
        json_str = match.group(0)
        # TypeScript 문법 제거 (trailing commas 등)
        json_str = re.sub(r',\s*\]', ']', json_str)
        json_str = re.sub(r'(\w+):', r'"\1":', json_str) # 키값에 쌍따옴표 추가
        json_str = json_str.replace("'", '"') # 홑따옴표를 쌍따옴표로
        
        return json.loads(json_str)
    except Exception as e:
        print(f"Error parsing reviewData.ts: {e}")
        return []

def run_batch():
    reviews = extract_reviews_from_ts()
    print(f"Found {len(reviews)} reviews to process.")
    
    for i, review in enumerate(reviews):
        # 리뷰 텍스트, 평점, 작성자 정보를 사용하여 카드 생성
        text = review.get('comment', review.get('text', ''))
        rating = review.get('rating', 5)
        author = review.get('author', '익명')
        
        output_name = f"review_post_{i+1}"
        create_review_card(text, rating, author, output_name)

if __name__ == "__main__":
    run_batch()
