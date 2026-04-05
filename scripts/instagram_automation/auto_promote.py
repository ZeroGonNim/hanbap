import os
import random
from instagram_api import InstagramAPI
from batch_generate_reviews import extract_reviews_from_ts
from generate_review_card import create_review_card
from generate_menu_card import create_menu_card

def get_production_url(filename):
    """Vercel 등 배포된 사이트의 이미지 URL을 생성합니다."""
    base_url = os.getenv('PRODUCTION_URL', 'https://your-deployed-site.com')
    return f"{base_url}/assets/generated/{filename}.jpg"

def promote_random_review():
    """랜덤한 리뷰 하나를 인스타그램에 홍보합니다."""
    reviews = extract_reviews_from_ts()
    if not reviews:
        return
        
    review = random.choice(reviews)
    text = review.get('comment', review.get('text', ''))
    author = review.get('author', '익명')
    
    # 이미지 생성
    output_name = f"auto_review_{random.randint(1000, 9999)}"
    create_review_card(text, review.get('rating', 5), author, output_name)
    
    # 인스타그램 포스팅
    ig = InstagramAPI()
    image_url = get_production_url(output_name)
    caption = f"'{author}' 고객님의 소중한 후기입니다! ✨\n\n{text}\n\n#HnaBap #나베밥맛집 #고객후기 #맛집추천"
    
    print(f"Promoting review: {author}")
    return ig.post_image(image_url, caption)

def promote_menu(menu_name, price, description, image_file):
    """특정 메뉴를 인스타그램에 홍보합니다."""
    output_name = f"auto_menu_{menu_name.replace(' ', '_')}"
    create_menu_card(menu_name, price, description, image_file, output_name)
    
    # 인스타그램 포스팅
    ig = InstagramAPI()
    image_url = get_production_url(output_name)
    caption = f"오늘의 추천 메뉴: {menu_name}! 🍱\n\n{description}\n\n가격: ₩{price:,}\n\n지금 바로 HnaBap에서 만나보세요! #HnaBap #시그니처메뉴 #오늘의추천"
    
    print(f"Promoting menu: {menu_name}")
    return ig.post_image(image_url, caption)

if __name__ == "__main__":
    # 실행 시 시나리오 선택 (예: 리뷰 홍보)
    # 실제 운영 시에는 인자값(argv)을 받아 처리하거나 스케줄러에 등록
    promote_random_review()
