#!/usr/bin/env python3
"""
Notion Database 자동 생성 및 데이터 입력 스크립트
"""

import os
import re
import subprocess
from pathlib import Path
from datetime import datetime

try:
    from notion_client import Client
except ImportError:
    print("notion-client 설치 중...")
    subprocess.run(["pip", "install", "notion-client"], check=True)
    from notion_client import Client

# Notion 토큰
NOTION_TOKEN = "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"
notion = Client(auth=NOTION_TOKEN)

# 프로젝트 경로
PROJECT_ROOT = Path("/Users/choehyeogsun/Desktop/projects/logged/prototype")
FRONTEND_DIR = PROJECT_ROOT / "frontend"

def analyze_code():
    """코드 분석: 컴포넌트, 파일, 라인 수"""
    components = {}

    # components 디렉토리 탐색
    components_dir = FRONTEND_DIR / "components"
    if components_dir.exists():
        for tsx_file in components_dir.rglob("*.tsx"):
            relative_path = tsx_file.relative_to(FRONTEND_DIR)

            # 라인 수 계산
            try:
                with open(tsx_file, 'r', encoding='utf-8') as f:
                    lines = len(f.readlines())
            except:
                lines = 0

            # 컴포넌트 이름 (파일명)
            component_name = tsx_file.stem

            components[str(relative_path)] = {
                'name': component_name,
                'path': str(relative_path),
                'lines': lines,
                'full_path': str(tsx_file),
            }

    return components

def create_features_database(parent_id: str):
    """Features Database 생성"""
    print("Features Database 생성 중...")

    database = notion.databases.create(
        parent={"type": "page_id", "page_id": parent_id},
        title="Features",
        properties={
            "Name": {"title": {}},
            "Epic": {
                "select": {
                    "options": [
                        {"name": "EP01", "color": "blue"},
                        {"name": "EP02", "color": "green"},
                        {"name": "EP03", "color": "purple"},
                        {"name": "EP04", "color": "red"},
                        {"name": "EP05", "color": "orange"},
                    ]
                }
            },
            "Story": {"rich_text": {}},
            "Status": {
                "status": {
                    "options": [
                        {"name": "Draft", "color": "gray"},
                        {"name": "Approved", "color": "yellow"},
                        {"name": "In Progress", "color": "blue"},
                        {"name": "Review", "color": "purple"},
                        {"name": "Done", "color": "green"},
                    ]
                }
            },
            "Description": {"rich_text": {}},
            "Code Files": {"multi_select": {"options": []}},
            "Code Analysis": {"rich_text": {}},
            "PRD Link": {"url": {}},
            "Story Link": {"url": {}},
            "Design Spec": {"url": {}},
            "Progress": {"number": {}},
            "Start Date": {"date": {}},
            "End Date": {"date": {}},
            "Checklist": {"rich_text": {}},
            "Notes": {"rich_text": {}},
        }
    )

    return database['id']

def create_components_database(parent_id: str):
    """Components Database 생성"""
    print("Components Database 생성 중...")

    database = notion.databases.create(
        parent={"type": "page_id", "page_id": parent_id},
        title="Components",
        properties={
            "Name": {"title": {}},
            "File Path": {"rich_text": {}},
            "Lines": {"number": {}},
            "Technologies": {"multi_select": {"options": [
                {"name": "React", "color": "blue"},
                {"name": "TypeScript", "color": "purple"},
                {"name": "Tailwind CSS", "color": "cyan"},
                {"name": "Next.js", "color": "gray"},
                {"name": "Supabase", "color": "green"},
                {"name": "Framer Motion", "color": "red"},
            ]}},
            "Props": {"code": {}},
            "Used In": {"multi_select": {"options": []}},
            "Status": {
                "select": {
                    "options": [
                        {"name": "Done", "color": "green"},
                        {"name": "In Progress", "color": "blue"},
                        {"name": "Draft", "color": "gray"},
                    ]
                }
            },
        }
    )

    return database['id']

def create_sprints_database(parent_id: str):
    """Sprints Database 생성"""
    print("Sprints Database 생성 중...")

    database = notion.databases.create(
        parent={"type": "page_id", "page_id": parent_id},
        title="Sprints",
        properties={
            "Name": {"title": {}},
            "Number": {"number": {}},
            "Status": {
                "select": {
                    "options": [
                        {"name": "Done", "color": "green"},
                        {"name": "In Progress", "color": "blue"},
                        {"name": "Planned", "color": "gray"},
                    ]
                }
            },
            "Start Date": {"date": {}},
            "End Date": {"date": {}},
            "Goal": {"rich_text": {}},
            "Features": {"rich_text": {}},
        }
    )

    return database['id']

def add_ep04_features(features_db_id: str):
    """EP04 스토리 데이터 추가"""
    print("EP04 스토리 데이터 입력 중...")

    features = [
        {
            "name": "EP04-S01: 알림 시스템",
            "epic": "EP04",
            "story": "EP04-S01",
            "status": "Done",
            "description": "사용자의 활동 알림을 표시하는 피드 페이지. 팔로우, 좋아요, 댓글 등의 활동을 시간 역순으로 표시.",
            "code_files": ["components/notifications/NotificationFeed.tsx", "components/notifications/NotificationItem.tsx"],
            "code_analysis": "실시간 Supabase 구독, RPC: get_notifications(), Realtime 기술 사용. ~120줄",
            "prd_link": "https://github.com/chs98412/prototype/blob/main/docs/prd.md",
            "story_link": "https://github.com/chs98412/prototype/blob/main/docs/stories/EP04-S01.md",
            "design_spec": "https://github.com/chs98412/prototype/blob/main/docs/design-specs/P1-NotificationFeed.md",
            "progress": 100,
            "checklist": "- [x] NotificationFeed 구현\n- [x] NotificationItem 구현\n- [x] Realtime 구독\n- [x] 삭제 기능\n- [ ] E2E 테스트",
        },
        {
            "name": "EP04-S02: 검색 그리드",
            "epic": "EP04",
            "story": "EP04-S02",
            "status": "Done",
            "description": "검색 결과를 그리드 뷰로 표시. 2/3/4 컬럼 반응형 레이아웃.",
            "code_files": ["components/search/SearchGridView.tsx", "components/search/MovieGridCard.tsx"],
            "code_analysis": "그리드 레이아웃 (Tailwind CSS), 9:16 포스터 비율. ~100줄",
            "prd_link": "https://github.com/chs98412/prototype/blob/main/docs/prd.md",
            "story_link": "https://github.com/chs98412/prototype/blob/main/docs/stories/EP04-S02.md",
            "design_spec": "https://github.com/chs98412/prototype/blob/main/docs/design-specs/P2-SearchGridView.md",
            "progress": 100,
            "checklist": "- [x] SearchGridView 구현\n- [x] MovieGridCard 구현\n- [x] 반응형 레이아웃\n- [ ] 뷰 전환 애니메이션\n- [ ] LocalStorage 저장",
        },
        {
            "name": "EP04-S03: 피드 에디토리얼 레이아웃",
            "epic": "EP04",
            "story": "EP04-S03",
            "status": "In Progress",
            "description": "리뷰를 매거진/에디토리얼 스타일로 표시. 포스터(200px) + 인용문 박스 + 리뷰 텍스트.",
            "code_files": ["components/feed/EditorialReviewFeed.tsx", "components/content/MovieDetailHeader.tsx", "components/content/MovieDetailInfo.tsx", "app/profile/edit/page.tsx"],
            "code_analysis": "포스터 200px (9:16), 인용문 #f5f5f5, 좋아요 #666→#ff4458. Tailwind CSS 반응형. ~400줄",
            "prd_link": "https://github.com/chs98412/prototype/blob/main/docs/prd.md",
            "story_link": "https://github.com/chs98412/prototype/blob/main/docs/stories/EP04-S03.md",
            "design_spec": "https://github.com/chs98412/prototype/blob/main/docs/design-specs/P5-FeedEditorialLayout.md",
            "progress": 70,
            "checklist": "- [x] EditorialReviewFeed 디자인 적용\n- [x] MovieDetailHeader 개선\n- [x] ProfileEditPage 필드 추가\n- [ ] RPC get_friend_reviews 구현\n- [ ] 좋아요 API 연동\n- [ ] 댓글 기능 연동\n- [ ] E2E 테스트",
        },
    ]

    for feature in features:
        notion.pages.create(
            parent={"database_id": features_db_id},
            properties={
                "Name": {"title": [{"text": {"content": feature["name"]}}]},
                "Epic": {"select": {"name": feature["epic"]}},
                "Story": {"rich_text": [{"text": {"content": feature["story"]}}]},
                "Status": {"status": {"name": feature["status"]}},
                "Description": {"rich_text": [{"text": {"content": feature["description"]}}]},
                "Code Files": {
                    "multi_select": [{"name": f} for f in feature["code_files"]]
                },
                "Code Analysis": {"rich_text": [{"text": {"content": feature["code_analysis"]}}]},
                "PRD Link": {"url": feature["prd_link"]},
                "Story Link": {"url": feature["story_link"]},
                "Design Spec": {"url": feature["design_spec"]},
                "Progress": {"number": feature["progress"]},
                "Checklist": {"rich_text": [{"text": {"content": feature["checklist"]}}]},
            }
        )
        print(f"  ✓ {feature['name']}")

def add_sprints(sprints_db_id: str):
    """Sprint 데이터 추가"""
    print("Sprint 데이터 입력 중...")

    sprints = [
        {
            "name": "Sprint 5",
            "number": 5,
            "status": "In Progress",
            "goal": "디자인 개선 & 신기능 (알림, 검색, 피드 에디토리얼)",
            "features": "EP04-S01, EP04-S02, EP04-S03",
        },
    ]

    for sprint in sprints:
        notion.pages.create(
            parent={"database_id": sprints_db_id},
            properties={
                "Name": {"title": [{"text": {"content": sprint["name"]}}]},
                "Number": {"number": sprint["number"]},
                "Status": {"select": {"name": sprint["status"]}},
                "Goal": {"rich_text": [{"text": {"content": sprint["goal"]}}]},
                "Features": {"rich_text": [{"text": {"content": sprint["features"]}}]},
            }
        )
        print(f"  ✓ {sprint['name']}")

def main():
    """메인 실행"""
    print("🚀 Notion 자동 설정 시작...\n")

    # 사용자 정보 조회 (토큰 유효성 확인)
    try:
        user = notion.users.me()
        print(f"✓ Notion 연결 성공\n")
    except Exception as e:
        print(f"✗ Notion 연결 실패: {e}")
        return

    # 코드 분석
    print("📊 코드 분석 중...")
    components = analyze_code()
    print(f"✓ {len(components)}개의 컴포넌트 분석 완료\n")

    # 사용자에게 Database 생성 위치 확인
    print("📌 Notion 페이지 선택:")
    print("현재 프로필 페이지에 Database를 생성합니다.")
    print("(수동으로 Notion을 열고 프로젝트 관리 페이지를 만든 후,")
    print(" 해당 페이지의 ID를 입력해주세요)\n")

    parent_id = input("👉 Notion 페이지 ID 입력 (또는 Enter로 스킵): ").strip()

    if not parent_id:
        print("✓ 설정을 스킵했습니다.")
        print("\n다음 단계:")
        print("1. Notion에서 새 페이지 생성: '프로젝트 관리'")
        print("2. 페이지 URL에서 ID 복사 (32자 문자열)")
        print("3. 다시 이 스크립트 실행: python setup_notion.py")
        return

    try:
        # Database 생성
        print(f"\n📚 Database 생성 중...\n")
        features_db_id = create_features_database(parent_id)
        components_db_id = create_components_database(parent_id)
        sprints_db_id = create_sprints_database(parent_id)

        print(f"\n✓ Database 생성 완료")
        print(f"  - Features DB ID: {features_db_id}")
        print(f"  - Components DB ID: {components_db_id}")
        print(f"  - Sprints DB ID: {sprints_db_id}\n")

        # 데이터 입력
        print("📝 데이터 입력 중...\n")
        add_ep04_features(features_db_id)
        add_sprints(sprints_db_id)

        print("\n✅ 완료!\n")
        print("Notion 페이지를 확인하세요:")
        print(f"https://www.notion.so/{parent_id.replace('-', '')}")

    except Exception as e:
        print(f"\n✗ 오류 발생: {e}")
        print("자세한 정보:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
