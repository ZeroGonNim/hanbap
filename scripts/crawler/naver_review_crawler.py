import asyncio
import random
import time
import json
import os
from datetime import datetime
from playwright.async_api import async_playwright

async def run_crawler(url):
    async with async_playwright() as p:
        # 브라우저 실행 (Headless 모드)
        browser = await p.chromium.launch(headless=True)
        
        # 자연스러운 User-Agent 설정 및 컨텍스트 생성
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            viewport={'width': 1920, 'height': 1080}
        )
        
        page = await context.new_page()
        
        print(f"[*] 페이지 접속 중: {url}")
        await page.goto(url)
        
        # 1. iframe 컨텍스트 전환
        print("[*] entryIframe 대기 중...")
        try:
            await page.wait_for_selector("#entryIframe", timeout=10000)
            iframe_element = page.frame_locator("#entryIframe")
            print("[+] entryIframe 진입 성공")
        except Exception as e:
            print(f"[-] entryIframe을 찾을 수 없습니다: {e}")
            # 4. 데이터 저장 및 인스타그램 홍보 자동 연동
            if reviews_list:
                output_file = os.path.join(os.path.dirname(__file__), "../../frontend/src/data/reviews.json")
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(reviews_list, f, ensure_ascii=False, indent=2)
                print(f"[+] {len(reviews_list)}개의 리뷰가 {output_file}에 저장되었습니다.")

                # 인스타그램 홍보 스크립트 실행 (새로운 고득점 리뷰 자동 생성)
                print("[*] 인스타그램 홍보 이미지 생성을 시작합니다...")
                try:
                    import subprocess
                    subprocess.run(["python", "scripts/instagram_automation/batch_generate_reviews.py"], check=False)
                except Exception as e:
                    print(f"[-] 인스타그램 연동 중 오류 발생: {e}")

            await browser.close()
            return reviews_list
        await asyncio.sleep(random.uniform(2, 4))

        # 2. 동적 로딩 처리
        print("[*] 리뷰 로딩 대기 및 더보기 버튼 탐색 중...")
        
        # '더보기' 버튼을 최대 5회 클릭하여 더 많은 리뷰 로드 (약 50개+)
        max_clicks = 5
        print(f"[*] 더보기 버튼 최대 {max_clicks}회 클릭 시도...")
        
        for i in range(max_clicks):
            try:
                # 네이버 지도의 더보기 버튼(클래스 a.fvwqf 등) 탐색
                more_btn = iframe_element.locator("a.fvwqf").first
                
                # 버튼이 존재하고 화면에 보일 때만 클릭
                if await more_btn.count() > 0 and await more_btn.is_visible(timeout=3000):
                    print(f"[*] 더보기 클릭 ({i+1}/{max_clicks})")
                    await more_btn.click()
                    await asyncio.sleep(random.uniform(1.5, 2.5))
                else:
                    print("[*] 더보기 버튼이 더 이상 없거나 화면에 보이지 않습니다.")
                    break
            except Exception as e:
                print(f"[*] 더보기 버튼 처리 종료: {e}")
                break

        print("[*] 로드된 전체 리뷰 데이터 추출 중...")
        
        try:
            review_elements = []
            reviews_list = []
            
            # 리뷰 리스트 아이템(보통 <li> 요소)을 찾습니다.
            li_selectors = ["li.pui__X35jYm", "li.place_review_item", "div.pui__vn15t2", "li.owAeM"]
            
            for selector in li_selectors:
                try:
                    await iframe_element.locator(selector).first.wait_for(timeout=5000)
                    review_elements = await iframe_element.locator(selector).all()
                    if review_elements:
                        print(f"[+] 셀렉터 '{selector}'로 {len(review_elements)}개의 리뷰 블록을 찾았습니다.")
                        break
                except:
                    continue
            
            # 3. 데이터 상세 추출
            for item in review_elements:
                try:
                    # 작성자 이름 추출 시도
                    author = "네이버 방문자"
                    author_selectors = [".pui__wnfHj p", ".z_p_x", ".ApAxy"]
                    for a_sel in author_selectors:
                        if await item.locator(a_sel).count() > 0:
                            author = await item.locator(a_sel).first.inner_text()
                            break
                            
                    # 내용 텍스트 추출
                    content = ""
                    content_selectors = [".pui__vn15t2", "span.z_p_x[-1]", ".z_p_x", ".K_o_c"]
                    for c_sel in content_selectors:
                         content_loc = item.locator(c_sel)
                         if await content_loc.count() > 0:
                             # 보통 내용이 제일 마지막 span이거나 z_p_x임
                             content = await content_loc.last.inner_text()
                             if len(content) > 5:
                                 break
                                 
                    if not content or len(content.strip()) < 5:
                        continue # 너무 짧거나 빈 리뷰 생략
                        
                    # 날짜 추출
                    # 네이버는 "yy.mm.dd.", "1주 전", "어제" 등으로 표기
                    date_str = datetime.now().strftime("%Y.%m.%d")
                    date_selectors = [".pui__gZulv time", ".YkUXs", ".ckuP4 span time", ".ckuP4"]
                    for d_sel in date_selectors:
                        if await item.locator(d_sel).count() > 0:
                            raw_date = await item.locator(d_sel).first.inner_text()
                            raw_date = raw_date.replace("방문일", "").strip()
                            
                            # 정규식이나 간단한 조작으로 날짜 포맷 맞추기 (예: 24.12.08. -> 2024.12.08)
                            if raw_date.endswith("."):
                                raw_date = raw_date[:-1]
                            parts = raw_date.split(".")
                            if len(parts) == 3 and len(parts[0]) == 2:
                                date_str = f"20{parts[0]}.{parts[1].strip()}.{parts[2].strip()}"
                            else:
                                date_str = raw_date
                            break

                    reviews_list.append({
                        "author": author.strip(),
                        "platform": "Naver",
                        "rating": 5, # 네이버는 현재 별점 제도가 폐지되어 기본 5점으로 세팅
                        "content": content.strip().replace("\n", " "),
                        "date": date_str
                    })
                except Exception as inner_e:
                    print(f"[-] 개별 리뷰 파싱 에러 (생략함): {inner_e}")
                    
        except Exception as e:
            print(f"[-] 리뷰 데이터 목록화 중 오류 발생: {e}")

        # JSON 파일로 저장
        if reviews_list:
            output_path = os.path.join(os.path.dirname(__file__), "../../frontend/src/data/reviews.json")
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(reviews_list, f, ensure_ascii=False, indent=2)
            
            print(f"\n[+] {len(reviews_list)}개의 리뷰를 {output_path}에 저장했습니다.")
        else:
            print("[-] 저장할 리뷰가 없습니다.")

        await browser.close()
        return reviews_list

if __name__ == "__main__":
    TARGET_URL = "https://map.naver.com/p/search/%ED%95%9C%EB%A7%88%EC%9D%8C%20%EC%8B%9D%EB%8B%B9/place/86727483?c=15.00,0,0,0,dh&placePath=/review?bk_query=%ED%95%9C%EB%A7%88%EC%9D%8C%20%EC%8B%9D%EB%8B%B9&from=map&fromPanelNum=2&locale=ko&searchText=%ED%95%9C%EB%A7%88%EC%9D%8C%20%EC%8B%9D%EB%8B%B9&svcName=map_pcv5&timestamp=202603112243&entry=bmp"
    
    asyncio.run(run_crawler(TARGET_URL))
