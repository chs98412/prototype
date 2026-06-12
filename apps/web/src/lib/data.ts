export type Movie = {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  year: number;
  genre: string;
  country: string;
  runtime: string;
  rating: string;
  director: string;
};

export type Essay = {
  id: string;
  movieId: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  body: string[];
  inlineImage?: string;
  likes: number;
  comments: number;
  private: boolean;
  tags: string[];
};

export type RatingItem = {
  kind: 'rating';
  id: string;
  movieId: string;
  author: string;
  stars: number;
  blurb: string;
  when: string;
  likes: number;
  comments?: number;
};

export type LogItem = {
  kind: 'log';
  id: string;
  movieId: string;
  author: string;
  stars: number;
  when: string;
};

export type QuoteItem = {
  kind: 'quote';
  id: string;
  movieId: string;
  text: string;
  cite: string;
  source: string;
  likes: number;
};

export type ListItem = {
  kind: 'list';
  id: string;
  author: string;
  title: string;
  count: number;
  covers: string[];
  when: string;
  likes: number;
};

export type FeedItem =
  | { kind: 'day'; when: string }
  | { kind: 'essay'; essayId: string }
  | RatingItem
  | LogItem
  | QuoteItem
  | ListItem;

const img = (name: string) => `/images/${name}`;

export const MOVIES: Movie[] = [
  { id: 'yuhi',        title: '유희에게',               poster: img('poster-yuhi.png'),   year: 2019, genre: '드라마',          country: '한국', runtime: '2시간 02분', rating: '15세', director: '임상수' },
  { id: 'rachel',      title: '어바웃 타임',             poster: img('poster-rachel.png'), year: 2013, genre: '드라마 · 로맨스', country: '영국', runtime: '2시간 04분', rating: '15세', director: '리처드 커티스' },
  { id: 'feed',        title: '스즈메의 문단속',          poster: img('poster-feed.png'),   year: 2022, genre: '애니메이션',      country: '일본', runtime: '2시간 02분', rating: '12세', director: '신카이 마코토' },
  { id: 'monster',     title: '괴물',                   poster: img('poster-monster.png'), backdrop: img('bg-monster.png'), year: 2023, genre: '드라마', country: '일본', runtime: '2시간 06분', rating: '12세', director: '고레에다 히로카즈' },
  { id: 'wolf',        title: '더 울프 오브 월스트리트',   poster: img('poster-extra1.png'), year: 2013, genre: '드라마',          country: '미국', runtime: '3시간 00분', rating: '19세', director: '마틴 스코세이지' },
  { id: 'interstellar',title: '인터스텔라',              poster: img('poster-extra2.png'), year: 2014, genre: 'SF',             country: '미국', runtime: '2시간 49분', rating: '12세', director: '크리스토퍼 놀란' },
  { id: 'metropolis',  title: '대도시의 사랑법',          poster: img('poster-extra3.png'), year: 2024, genre: '드라마',          country: '한국', runtime: '1시간 58분', rating: '15세', director: '이언희' },
  { id: 'gone',        title: '나를 찾아줘',             poster: img('poster-extra4.png'), year: 2014, genre: '스릴러',          country: '미국', runtime: '2시간 29분', rating: '청불', director: '데이비드 핀처' },
];

export const MOVIE_BY_ID: Record<string, Movie> = Object.fromEntries(MOVIES.map(m => [m.id, m]));

export const ESSAYS: Essay[] = [
  {
    id: 'e1', movieId: 'yuhi',
    title: '은은한 향기가 영화 내내 감돈다.',
    author: '김윤희', date: '2026.05.21',
    excerpt: "있지, 부치지도 못할 편지를 쓰고 또 써도 자꾸만 네 꿈을 꾸니까 괜히 말하게 되는 거야. 밤낮으로 치워도 새것 같이 쌓여서, 막막해서. '눈이 언제쯤 그치려나.'하고.",
    body: [
      '사운드트랙은 35mm 영화 필름에서 띠 모양으로 함께 프린트되어 있어 소리나 음악이 입혀져 있지 않아도 영사된다. 나는 한시도 잊은 적이 없다는 관용어구를 온전히 믿는 편이다. 사람은 기다리지 않으면서도 서 있기도 하고, 몸을 뉘었을 때도 밥을 먹을 때에도, 심지어 아무것도 생각하지 않을 때에도 어떤 사람의 부재를 쓸쓸해 할 수 있기 때문이다.',
      '어느 장면에서부터 더 이상 그 사람이 등장하지 않는다 해도 필름 시대의 사랑에는 여전히 가느다란 띠가 붙어 있다. 필름 대신 디지털 파일을 통해서 영화가 상영되어도 여전히 사운드트랙이라는 명칭은 사용된다. 서랍에 담겨있던 스웨터의 묵은 냄새가 사라진, 차라리 하시원하게 변해버린 디지털 화면에는 얇은 피부로 스며드는 서늘한 감각이 있다.',
      '장면은 얼어붙게 또렷해지는데 기억은 옅어져만 간다. 사랑하는 사람의 목소리를 잊으면 완전히 잃어버리는 거라고, 나는 그 말이 두려워 그 사람 꿈을 꾸곤 했다.',
    ],
    inlineImage: img('essay-inline.png'),
    likes: 312, comments: 24, private: false,
    tags: ['에세이', '사운드트랙', '필름'],
  },
  {
    id: 'e2', movieId: 'rachel',
    title: '감독니 나빠요',
    author: '레이첼', date: '2026.05.18',
    excerpt: '도대체 정상적인 안중근 영화는 언제쯤 나오는 걸까? 담백하고 건조하게 찍는다고 해서 그게 다 예술이 되는 건 아닐 데요, 감독님.',
    body: ['도대체 정상적인 안중근 영화는 언제쯤 나오는 걸까?', '역사에 한쪽 발을 걸친 영화는, 그 한쪽이 무겁다는 사실을 잊으면 안 된다.'],
    likes: 188, comments: 41, private: false, tags: ['비평', '역사극'],
  },
  {
    id: 'e3', movieId: 'feed',
    title: '문이 닫힐 때마다 우리는 어른이 된다',
    author: '미리보기', date: '2026.05.14',
    excerpt: '우리는 매일의 우리의 삶에서 함께 시간을 통과해 여행한다. 우리가 할 수 있는 건 최선을 다해 이 멋진 여행을 만끽하는 것이다.',
    body: ['우리는 매일의 우리의 삶에서 함께 시간을 통과해 여행한다.', "지금의 내 성격을 만들어준 고마운 영화다."],
    likes: 540, comments: 73, private: true, tags: ['에세이', '성장'],
  },
  {
    id: 'e4', movieId: 'monster',
    title: '누가 괴물인가',
    author: '최혁순', date: '2026.05.10',
    excerpt: '고레에다는 끝내 답하지 않는다. 세 개의 시점이 차곡차곡 쌓이는 동안 관객은 자기 안의 한 칸을 비워둘 수밖에 없다.',
    body: ['고레에다는 끝내 답하지 않는다.', '괴물이라는 단어는 자꾸만 누군가를 가리키는데, 영화는 손가락 끝을 거울 쪽으로 천천히 돌려놓는다.'],
    likes: 421, comments: 56, private: false, tags: ['비평', '고레에다'],
  },
  {
    id: 'e5', movieId: 'interstellar',
    title: '사랑은 차원을 가로지른다',
    author: '순이', date: '2026.05.02',
    excerpt: '다섯 번째 차원에서 본 우리의 시간은 동시에 거기에 있었고, 거기에 있지 않았다. 그러니까 사랑은—',
    body: ['다섯 번째 차원에서 본 우리의 시간은 동시에 거기에 있었고, 거기에 있지 않았다.', '그러니까 사랑은 시간을 통과해서도 닿는다.'],
    likes: 98, comments: 12, private: false, tags: ['에세이', 'SF'],
  },
];

export const ESSAY_BY_ID: Record<string, Essay> = Object.fromEntries(ESSAYS.map(e => [e.id, e]));

export const FEED_ITEMS: FeedItem[] = [
  { kind: 'day', when: '오늘' },
  { kind: 'essay', essayId: 'e1' },
  { kind: 'rating', id: 'r1', movieId: 'interstellar', author: '최혁순', stars: 4,
    blurb: '감정을 우주의 단위로 환산해보고 싶을 때마다 다시 본다. 차원을 가로지르는 건 결국 아빠의 책장이었다는 점에서, 이 영화는 SF가 아니라 가족 영화다.',
    when: '2시간 전', likes: 54, comments: 7 },
  { kind: 'log', id: 'l1', movieId: 'metropolis', author: '레이첼', stars: 5, when: '3시간 전' },
  { kind: 'quote', id: 'q1', movieId: 'yuhi',
    text: '눈이 언제쯤 그치려나, 하고 묻는 사람이 있었다.',
    cite: '〈유희에게〉 중에서', source: '김윤희가 옮김', likes: 122 },
  { kind: 'day', when: '어제' },
  { kind: 'essay', essayId: 'e2' },
  { kind: 'list', id: 'ls1', author: '순이', title: '겨울에 다시 보는 영화', count: 12,
    covers: [img('poster-yuhi.png'), img('poster-rachel.png'), img('poster-feed.png')],
    when: '어제', likes: 38 },
  { kind: 'rating', id: 'r2', movieId: 'gone', author: '지윤', stars: 3,
    blurb: '두 번째 절반은 너무 친절하다. 핀처는 친절할 때 가장 무섭다고 생각했는데, 이번엔 그냥 친절했다.',
    when: '어제', likes: 17, comments: 3 },
  { kind: 'essay', essayId: 'e3' },
  { kind: 'day', when: '이번 주' },
  { kind: 'log', id: 'l2', movieId: 'feed', author: '미리보기', stars: 4, when: '3일 전' },
  { kind: 'essay', essayId: 'e4' },
  { kind: 'rating', id: 'r3', movieId: 'wolf', author: '김윤희', stars: 4,
    blurb: '3시간 동안 도덕적 피로감이 쌓이는 영화. 그러나 마지막 강연 장면에서 카메라가 관객을 비추는 순간, 이 모든 게 우리의 거울임이 드러난다.',
    when: '4일 전', likes: 89, comments: 12 },
  { kind: 'essay', essayId: 'e5' },
];
