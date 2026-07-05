-- reviews.content의 500자 상한 CHECK 제약 제거
-- 에세이 등 장문 콘텐츠를 지원하기 위해 상한을 없앰 (최소 1자는 NOT NULL로 보장)
alter table public.reviews drop constraint if exists reviews_content_check;
