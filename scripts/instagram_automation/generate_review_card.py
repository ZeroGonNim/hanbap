import os
import textwrap
from PIL import Image, ImageDraw, ImageFont

# 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "../../frontend/public/assets/generated")

# 한글 폰트 경로 (Windows 기준 '맑은 고딕' 우선 사용)
FONT_PATHS = [
    "C:/Windows/Fonts/malgun.ttf",       # 맑은 고딕 (Win)
    "C:/Windows/Fonts/malgunbd.ttf",     # 맑은 고딕 Bold (Win)
    "/usr/share/fonts/truetype/nanum/NanumGothic.ttf", # Linux (Docker/CI 환경 대응)
]

def get_font(is_bold=False, size=30):
    path = FONT_PATHS[1] if is_bold else FONT_PATHS[0]
    # 폰트 파일 존재 여부 확인 후 로드
    for p in FONT_PATHS:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                continue
    # 폰트 없을 시 기본 폰트 사용
    return ImageFont.load_default()

def create_review_card(review_text, rating, author, output_name):
    # 1. 1080x1080 정방형 캔버스 생성 (Instagram 권장 사이즈)
    # 배경색: 브랜드 컬러 또는 부드러운 베이지/화이트 계열 추천
    bg_color = (255, 255, 255) # White
    img = Image.new('RGB', (1080, 1080), color=bg_color)
    draw = ImageDraw.Draw(img)

    # 2. 장식 요소 (테두리 등)
    border_color = (240, 150, 50) # 브랜드 포인트 컬러 (임의: 오렌지/옐로우)
    draw.rectangle([40, 40, 1040, 1040], outline=border_color, width=15)

    # 3. 별점 (Stars) - 텍스트로 대체 (예: ★★★★★)
    stars = "★" * int(rating) + "☆" * (5 - int(rating))
    star_font = get_font(is_bold=True, size=60)
    draw.text((540, 200), stars, fill=border_color, font=star_font, anchor="mm")

    # 4. 리뷰 텍스트 (자동 줄바꿈)
    text_font = get_font(is_bold=False, size=45)
    margin = 150
    # 한 줄당 약 20자 내외로 조절
    wrapped_text = textwrap.fill(review_text, width=22) 
    
    # 텍스트 세로 중앙 정렬을 위한 계산
    draw.multiline_text((540, 500), wrapped_text, fill=(50, 50, 50), font=text_font, anchor="mm", align="center", spacing=20)

    # 5. 작성자 및 브랜드명
    author_font = get_font(is_bold=True, size=35)
    draw.text((540, 850), f"- {author} 고객님 -", fill=(100, 100, 100), font=author_font, anchor="mm")
    
    brand_font = get_font(is_bold=True, size=50)
    draw.text((540, 950), "HnaBap", fill=border_color, font=brand_font, anchor="mm")

    # 6. 저장
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    
    file_path = os.path.join(OUTPUT_DIR, f"{output_name}.jpg")
    img.save(file_path, "JPEG", quality=95)
    print(f"Review card saved to: {file_path}")
    return file_path

if __name__ == "__main__":
    # 테스트용 데이터
    test_review = "여기 진짜 맛있어요! 사장님도 너무 친절하시고 인테리어가 깔끔해서 사진 찍기도 좋네요. 강력 추천합니다!"
    create_review_card(test_review, 5, "홍길동", "test_review_1")
