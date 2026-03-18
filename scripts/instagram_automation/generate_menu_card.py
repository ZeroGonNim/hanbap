import os
from PIL import Image, ImageDraw, ImageFont
from generate_review_card import get_font

# 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "../../frontend/public/assets")
OUTPUT_DIR = os.path.join(ASSETS_DIR, "generated")

def create_menu_card(menu_name, price, description, image_filename, output_name):
    """메뉴 이미지와 정보를 결합한 홍보 카드를 생성합니다."""
    # 1. 1080x1080 배경 생성 (브랜드 포인트 컬러: 오렌지 계열 배경)
    bg_color = (255, 248, 240)
    img = Image.new('RGB', (1080, 1080), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # 2. 메뉴 원본 이미지 합성 (상단 500px 영역)
    try:
        menu_img_path = os.path.join(ASSETS_DIR, image_filename)
        if os.path.exists(menu_img_path):
            menu_img = Image.open(menu_img_path).convert("RGB")
            # 비율에 맞춰 리사이징
            menu_img = menu_img.resize((800, 500))
            img.paste(menu_img, (140, 100)) # 중앙 상단 배치
        else:
            print(f"Warning: Menu image {menu_img_path} not found.")
    except Exception as e:
        print(f"Error loading menu image: {e}")

    # 3. 장식 및 텍스트
    accent_color = (240, 150, 50)
    draw.rectangle([50, 650, 1030, 1030], outline=accent_color, width=10)
    
    # 메뉴명
    title_font = get_font(is_bold=True, size=70)
    draw.text((540, 750), menu_name, fill=accent_color, font=title_font, anchor="mm")
    
    # 가격
    price_font = get_font(is_bold=True, size=50)
    draw.text((540, 830), f"₩{price:,}", fill=(50, 50, 50), font=price_font, anchor="mm")
    
    # 설명
    desc_font = get_font(is_bold=False, size=35)
    draw.text((540, 910), description, fill=(100, 100, 100), font=desc_font, anchor="mm")
    
    # 브랜드 로고
    brand_font = get_font(is_bold=True, size=40)
    draw.text((540, 980), "HnaBap Signature", fill=accent_color, font=brand_font, anchor="mm")

    # 4. 저장
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    
    file_path = os.path.join(OUTPUT_DIR, f"{output_name}.jpg")
    img.save(file_path, "JPEG", quality=95)
    print(f"Menu card saved to: {file_path}")
    return file_path

if __name__ == "__main__":
    # 테스트용 데이터
    create_menu_card("특제 나베밥", 12000, "신선한 야채와 비법 소스로 맛을 낸 시그니처 메뉴", "food_thumbnails.png", "menu_promo_1")
