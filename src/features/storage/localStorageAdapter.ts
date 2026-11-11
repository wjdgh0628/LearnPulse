import type {
  CreateRoadmapPayload,
  ItemStatus,
  Roadmap,
  RoadmapChapter,
  RoadmapItem,
  StorageAdapter,
} from '@/types';

const STORAGE_KEY = 'learnpulse_roadmaps_v2';
const SEED_FLAG_KEY = 'learnpulse_seeded_v2';
const GUEST_USER_ID = 'guest-local-user';

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function createSamplePythonRoadmap(): Roadmap {
  const now = new Date().toISOString();
  const roadmapId = 'roadmap_seed_python_4w';

  const rawChapters: Array<{
    id: string;
    title: string;
    description: string;
    items: Array<{
      id: string;
      title: string;
      description: string;
      estimatedTime: string;
      keywords: string[];
      subTasks: string[];
      status: ItemStatus;
      memo?: string;
      referenceLink?: string;
    }>;
  }> = [
    {
      id: 'chapter_py_1',
      title: '1주차: Python 개발 환경 구축과 핵심 자료형 쪼개어 익히기',
      description:
        '파이썬이 어떻게 코드를 한 줄씩 실행하는지 이해하고, 숫자·문자열·리스트·딕셔너리를 작은 단위로 쪼개어 직접 타이핑하며 익힙니다.',
      items: [
        {
          id: 'item_py_1_1',
          title: 'Python 3.12+ 설치 및 VS Code 독립 가상환경(venv) 만들기',
          description:
            '프로젝트마다 패키지가 섞이지 않도록 독립된 방(가상환경)을 만들고 첫 파이썬 파일을 실행합니다.',
          estimatedTime: '35분',
          keywords: ['python --version', 'venv 가상환경', 'VS Code 인터프리터', 'print()'],
          subTasks: [
            'Step 1 (설치 확인): 터미널에 python --version을 입력해 버전이 정상 출력되는지 확인하기 (Windows는 Add Python to PATH 체크 필수)',
            'Step 2 (가상환경 생성): 프로젝트 폴더에서 python -m venv .venv 명령어를 실행하고 활성화(activate)하기',
            'Step 3 (첫 실행 점검): hello.py 파일을 만들고 print("Hello LearnPulse!")를 작성해 터미널에서 실행해 보기',
          ],
          status: 'DONE',
          memo: 'python -m venv .venv 명령어로 프로젝트별 독립 가상환경 생성 완료.',
          referenceLink: 'https://docs.python.org/ko/3/library/venv.html',
        },
        {
          id: 'item_py_1_2',
          title: '변수 선언과 숫자·불리언(int, float, bool) 연산자 기초',
          description:
            '데이터에 이름표를 붙이는 변수 개념과 몫(//), 나머지(%), 비교 연산자의 동작을 배웁니다.',
          estimatedTime: '40분',
          keywords: ['변수(Variable)', 'int / float / bool', '몫(//)과 나머지(%)', 'type() 함수'],
          subTasks: [
            'Step 1 (개념 이해): "=" 기호가 같다는 뜻이 아니라 오른쪽 값을 왼쪽 변수에 담는(할당) 의미임을 이해하기',
            'Step 2 (연산 실습): 일반 나눗셈(/)과 몫(//), 나머지(%) 연산자로 홀수/짝수 판별 식(n % 2 == 0) 직접 짜보기',
            'Step 3 (타입 점검): type() 함수로 정수와 실수, True/False의 자료형을 직접 출력해 확인하기',
          ],
          status: 'DONE',
          memo: '몫(//)과 나머지(%)를 활용하면 시간(분/초) 변환 계산이 아주 간편함.',
          referenceLink: 'https://docs.python.org/ko/3/tutorial/introduction.html',
        },
        {
          id: 'item_py_1_3',
          title: '문자열(str) 인덱싱·슬라이싱과 f-string 포매팅 마스터',
          description:
            '글자 데이터에서 원하는 부분만 잘라내고, 변수 값을 문자열 안에 깔끔하게 끼워 넣는 방법을 익힙니다.',
          estimatedTime: '45분',
          keywords: ['인덱싱(0부터 시작)', '슬라이싱 [시작:끝]', 'f-string', 'split() / strip()'],
          subTasks: [
            'Step 1 (슬라이싱 규칙): "2026-11-03" 문자열에서 연도([:4]), 월([5:7]), 일([8:])만 각각 잘라내어 출력하기',
            'Step 2 (f-string 실습): f"안녕하세요 {name}님, 점수는 {score}점입니다" 형태로 변수 조합 문자열 만들기',
            'Step 3 (필수 메서드 3종): 양쪽 공백 제거(.strip()), 단어 쪼개기(.split()), 특정 글자 바꾸기(.replace()) 연습하기',
          ],
          status: 'IN_PROGRESS',
          memo: '슬라이싱에서 끝 인덱스 번호는 포함되지 않는다(직전까지만 포함)는 점 기억하기!',
          referenceLink: 'https://docs.python.org/ko/3/tutorial/introduction.html#text',
        },
        {
          id: 'item_py_1_4',
          title: '리스트(List)와 딕셔너리(Dict)로 여러 데이터 묶어서 다루기',
          description:
            '순서대로 줄 세워 담는 리스트([])와 이름표(Key: Value)로 찾는 딕셔너리({})의 차이를 비교합니다.',
          estimatedTime: '55분',
          keywords: ['List [append, pop]', 'Dict {key: value}', '.get() 안전 조회', 'in 연산자'],
          subTasks: [
            'Step 1 (리스트 조작): 빈 리스트를 만들고 .append()로 할 일 3개를 추가한 뒤 인덱스로 수정·삭제해 보기',
            'Step 2 (딕셔너리 설계): {"이름": "김코딩", "점수": 95} 딕셔너리를 만들고 새로운 키-값 추가하기',
            'Step 3 (안전한 조회): 없는 키를 찾을 때 에러가 나는 dict["키"] 대신 dict.get("키", "기본값") 패턴 실습하기',
          ],
          status: 'TODO',
          referenceLink: 'https://docs.python.org/ko/3/tutorial/datastructures.html',
        },
      ],
    },
    {
      id: 'chapter_py_2',
      title: '2주차: 조건문·반복문 흐름 제어와 재사용 함수 만들기',
      description:
        '상황에 따라 다른 코드를 실행하는 조건문과 수백 번의 반복 작업을 자동화하는 반복문, 그리고 코드를 묶어주는 함수를 배웁니다.',
      items: [
        {
          id: 'item_py_2_1',
          title: 'if - elif - else 조건 분기와 들여쓰기(Indentation) 규칙',
          description:
            '파이썬의 핵심 문법인 4칸 들여쓰기 규칙을 지키며 여러 조건을 차례대로 검사하는 로직을 작성합니다.',
          estimatedTime: '40분',
          keywords: ['if / elif / else', '들여쓰기 4칸', 'and / or / not', '비교 연산자'],
          subTasks: [
            'Step 1 (단일 조건): 점수 변수가 80점 이상이면 "합격", 아니면 "재도전"을 출력하는 if-else 문 작성하기',
            'Step 2 (다중 분기): 90점 이상 A, 80점 이상 B, 70점 이상 C, 그 외 F를 출력하는 elif 체인 만들기',
            'Step 3 (복합 조건): 나이와 학생 여부를 and / or로 묶어 영화관 할인 대상 판별 식 작성하기',
          ],
          status: 'TODO',
          referenceLink: 'https://docs.python.org/ko/3/tutorial/controlflow.html',
        },
        {
          id: 'item_py_2_2',
          title: 'for 반복문과 range(), enumerate()로 리스트 순회하기',
          description:
            '리스트 안의 데이터를 하나씩 꺼내 처리하고, 번호표(인덱스)와 값을 동시에 꺼내는 실무 패턴을 익힙니다.',
          estimatedTime: '50분',
          keywords: ['for 변수 in 리스트', 'range(시작, 끝)', 'enumerate()', '누적 합계 구하기'],
          subTasks: [
            'Step 1 (기본 순회): 과일 리스트를 for문으로 돌며 하나씩 출력하고, range(1, 11)로 1부터 10까지 합계 구하기',
            'Step 2 (번호표 붙이기): enumerate(items, start=1)을 사용해 "1번 항목: ..." 형태로 번호와 내용을 함께 출력하기',
            'Step 3 (조건 결합): for문 안에 if문을 넣어 리스트에서 짝수이거나 특정 글자가 포함된 항목만 골라내기',
          ],
          status: 'TODO',
        },
        {
          id: 'item_py_2_3',
          title: 'while 반복문과 break · continue로 루프 정밀 제어하기',
          description:
            '정해진 횟수가 아니라 특정 조건이 만족될 때까지 계속 반복하는 while문과 무한 루프 탈출법을 배웁니다.',
          estimatedTime: '45분',
          keywords: ['while 조건:', 'break (즉시 탈출)', 'continue (이번 회차 건너뛰기)', '무한 루프 주의'],
          subTasks: [
            'Step 1 (차이점 이해): 횟수/목록이 정해졌을 때 쓰는 for문과 종료 조건 중심인 while문의 쓰임새 비교하기',
            'Step 2 (루프 제어): 1부터 숫자를 더하다가 합계가 100을 넘는 순간 break로 멈추고 그때의 숫자 출력하기',
            'Step 3 (건너뛰기): 1~20 출력 중 3의 배수일 때만 continue로 건너뛰는 코드 작성하기',
          ],
          status: 'TODO',
        },
        {
          id: 'item_py_2_4',
          title: 'def 함수 정의와 매개변수(Parameter) · 반환값(return) 완벽 이해',
          description:
            '반복되는 코드를 이름 붙인 상자(함수)로 만들어 입력값을 주면 결과값을 돌려받도록 구조화합니다.',
          estimatedTime: '55분',
          keywords: ['def 함수명():', '매개변수와 기본값', 'return vs print 차이', '지역 변수'],
          subTasks: [
            'Step 1 (핵심 구분): 화면에 보여주기만 하는 print()와 함수 밖으로 결과 데이터를 돌려주는 return의 결정적 차이 실험하기',
            'Step 2 (함수 작성): 원가와 할인율(기본값 10%)을 입력받아 최종 결제 금액을 return하는 calculate_price 함수 만들기',
            'Step 3 (셀프 점검): 여러 함수를 조합해 리스트의 평균과 최고점을 동시에(튜플로) 반환하는 통계 함수 작성하기',
          ],
          status: 'TODO',
        },
      ],
    },
    {
      id: 'chapter_py_3',
      title: '3주차: 예외 처리, 파일 읽고 쓰기(CSV/JSON), 클래스 입문',
      description:
        '프로그램이 에러로 멈추지 않게 보호하고, 실제 파일로 데이터를 저장·로드하며 객체지향의 기초를 다집니다.',
      items: [
        {
          id: 'item_py_3_1',
          title: 'try - except 예외 처리로 죽지 않는 안전한 프로그램 만들기',
          description:
            '사용자가 숫자 대신 문자를 입력하거나 없는 파일을 열 때 프로그램이 강제 종료되지 않도록 방어합니다.',
          estimatedTime: '45분',
          keywords: ['try / except', 'ValueError / ZeroDivisionError', 'finally', '에러 메시지 확인'],
          subTasks: [
            'Step 1 (에러 재현): int("가나다")나 10 / 0을 실행했을 때 어떤 이름의 에러가 발생하는지 확인하기',
            'Step 2 (방어 코드): try 블록에 위험한 코드를 넣고 except ValueError:로 친절한 안내 문구 출력하기',
            'Step 3 (실전 적용): 올바른 숫자를 입력할 때까지 다시 입력을 요청하는 안전한 입력 루프 완성하기',
          ],
          status: 'TODO',
          referenceLink: 'https://docs.python.org/ko/3/tutorial/errors.html',
        },
        {
          id: 'item_py_3_2',
          title: 'with open() 구문으로 텍스트 파일 및 JSON 데이터 저장·불러오기',
          description:
            '프로그램이 끝나도 데이터가 날아가지 않도록 파일로 저장하고 다시 파이썬 딕셔너리로 읽어옵니다.',
          estimatedTime: '50분',
          keywords: ['with open()', 'encoding="utf-8"', 'json.dump() / json.load()', '파일 모드(r, w, a)'],
          subTasks: [
            'Step 1 (텍스트 파일): with open("memo.txt", "w", encoding="utf-8")로 한글이 깨지지 않게 3줄 일기 저장하기',
            'Step 2 (JSON 변환): 파이썬 딕셔너리/리스트를 json.dump(..., ensure_ascii=False, indent=2)로 깔끔하게 파일 저장하기',
            'Step 3 (다시 읽기): 저장한 JSON 파일을 json.load()로 읽어와 특정 키의 값을 화면에 출력하기',
          ],
          status: 'TODO',
        },
        {
          id: 'item_py_3_3',
          title: '클래스(Class)와 객체(Instance), 생성자(__init__) 개념 잡기',
          description:
            '붕어빵 틀(클래스)과 붕어빵(객체) 비유를 통해 데이터(속성)와 기능(메서드)을 하나로 묶는 방법을 배웁니다.',
          estimatedTime: '60분',
          keywords: ['class 설계도', '__init__ 생성자', 'self의 의미', '인스턴스 메서드'],
          subTasks: [
            'Step 1 (개념 이해): 왜 딕셔너리만 쓰지 않고 클래스를 쓰는지, self가 "방금 만들어진 객체 자신"을 뜻함을 이해하기',
            'Step 2 (클래스 구현): 제목(title)과 완료여부(is_done) 속성을 가진 TodoItem 클래스와 complete() 메서드 작성하기',
            'Step 3 (객체 생성): TodoItem 객체를 3개 찍어내어 리스트에 담고 각각의 메서드를 호출해 상태 변경 확인하기',
          ],
          status: 'TODO',
          referenceLink: 'https://docs.python.org/ko/3/tutorial/classes.html',
        },
      ],
    },
    {
      id: 'chapter_py_4',
      title: '4주차: 외부 패키지 활용 및 나만의 미니 자동화 프로젝트 완성',
      description:
        '파이썬의 가장 큰 무기인 풍부한 표준/외부 라이브러리를 조합해 실생활에 쓸 수 있는 미니 프로그램을 완성합니다.',
      items: [
        {
          id: 'item_py_4_1',
          title: '필수 내장 모듈(datetime, pathlib, random)로 날짜·경로 다루기',
          description:
            '별도 설치 없이 바로 쓸 수 있는 파이썬 기본 도구 상자에서 날짜 계산과 폴더/파일 경로 제어법을 익힙니다.',
          estimatedTime: '45분',
          keywords: ['datetime / timedelta', 'strftime 포맷', 'pathlib.Path', '폴더 자동 생성'],
          subTasks: [
            'Step 1 (날짜 계산): datetime.now()로 오늘 날짜를 구하고 timedelta(days=30)로 D-Day 및 30일 뒤 날짜 계산하기',
            'Step 2 (경로 제어): pathlib.Path로 현재 폴더 내의 모든 .txt 파일 목록을 찾고 새 백업 폴더(mkdir) 만들기',
            'Step 3 (미니 실습): 오늘 날짜가 파일명에 자동으로 찍히는(예: 2026-11-03_log.txt) 로그 생성기 작성하기',
          ],
          status: 'TODO',
        },
        {
          id: 'item_py_4_2',
          title: 'pip 패키지 설치와 requests로 인터넷 API 데이터 가져오기',
          description:
            '외부 라이브러리를 설치하고 웹 서버에서 실시간 JSON 데이터(날씨, 환율, 명언 등)를 받아옵니다.',
          estimatedTime: '50분',
          keywords: ['pip install requests', 'requests.get()', 'status_code == 200', 'response.json()'],
          subTasks: [
            'Step 1 (패키지 설치): 터미널에서 pip install requests 실행 후 pip freeze로 설치된 버전 확인하기',
            'Step 2 (API 호출): 무료 공개 API 주소에 requests.get()을 보내고 응답 코드(200 OK) 확인하기',
            'Step 3 (데이터 추출): response.json()으로 변환된 딕셔너리에서 원하는 제목이나 수치만 뽑아 보기 좋게 출력하기',
          ],
          status: 'TODO',
        },
        {
          id: 'item_py_4_3',
          title: '최종 프로젝트: 일일 학습 체크리스트 & 마크다운 리포트 자동 생성기 제작',
          description:
            '4주 동안 배운 입출력, 리스트/딕셔너리, 함수, 파일 저장을 모두 합쳐 나만의 콘솔 프로그램을 완성합니다.',
          estimatedTime: '60분',
          keywords: ['종합 미니 프로젝트', 'CLI 메뉴 루프', 'JSON 저장 연동', 'Markdown 파일 출력'],
          subTasks: [
            'Step 1 (기능 설계): [1. 할 일 추가 / 2. 목록 보기 / 3. 완료 체크 / 4. 마크다운 파일로 내보내기] 메뉴 루프 구성하기',
            'Step 2 (데이터 유지): 프로그램 시작 시 json 파일을 불러오고 변경될 때마다 자동 저장되도록 함수 연결하기',
            'Step 3 (최종 완성): 내보낸 .md 파일을 열어 체크박스(- [x])가 정상적으로 생성되었는지 확인하고 회고 메모 남기기',
          ],
          status: 'TODO',
        },
      ],
    },
  ];

  const chapters: RoadmapChapter[] = rawChapters.map((chapter, cIdx) => ({
    id: chapter.id,
    roadmapId,
    orderIndex: cIdx + 1,
    title: chapter.title,
    description: chapter.description,
    items: chapter.items.map((item, iIdx) => ({
      id: item.id,
      chapterId: chapter.id,
      roadmapId,
      orderIndex: iIdx + 1,
      title: item.title,
      description: item.description,
      estimatedTime: item.estimatedTime,
      keywords: item.keywords,
      subTasks: item.subTasks,
      status: item.status,
      memo: item.memo,
      referenceLink: item.referenceLink,
      completedAt: item.status === 'DONE' ? now : null,
    })),
  }));

  return {
    id: roadmapId,
    userId: GUEST_USER_ID,
    title: 'Python 기초 4주 완성 (세분화 가이드)',
    topic: 'Python 프로그래밍 기초',
    level: 'BEGINNER',
    targetDuration: '4주 정규 과정',
    summary:
      '입문자도 막막함 없이 오늘 당장 따라 할 수 있도록, 각 학습 주제를 35~60분 단위의 [개념 이해 → 직접 실습 → 셀프 점검] 3단계 세부 가이드와 핵심 키워드로 잘게 쪼갠 맞춤형 커리큘럼입니다.',
    isArchived: false,
    createdAt: now,
    updatedAt: now,
    chapters,
  };
}

function readRoadmapsFromStorage(): Roadmap[] {
  if (typeof window === 'undefined') {
    return [createSamplePythonRoadmap()];
  }

  try {
    const isSeeded = window.localStorage.getItem(SEED_FLAG_KEY);
    const rawData = window.localStorage.getItem(STORAGE_KEY);

    if (!isSeeded && !rawData) {
      const sample = [createSamplePythonRoadmap()];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
      window.localStorage.setItem(SEED_FLAG_KEY, 'true');
      return sample;
    }

    if (!rawData) {
      return [];
    }

    const parsed: unknown = JSON.parse(rawData);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as Roadmap[];
  } catch {
    return [createSamplePythonRoadmap()];
  }
}

function writeRoadmapsToStorage(roadmaps: Roadmap[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roadmaps));
    window.localStorage.setItem(SEED_FLAG_KEY, 'true');
  } catch {
    // Ignore storage quota or private mode errors gracefully
  }
}

function isFullRoadmap(payload: CreateRoadmapPayload | Roadmap): payload is Roadmap {
  return 'id' in payload && 'createdAt' in payload;
}

export class LocalStorageAdapter implements StorageAdapter {
  public readonly mode = 'LOCAL' as const;

  public async getRoadmaps(): Promise<Roadmap[]> {
    const roadmaps = readRoadmapsFromStorage();
    return roadmaps.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public async getRoadmapById(id: string): Promise<Roadmap | null> {
    const roadmaps = readRoadmapsFromStorage();
    return roadmaps.find((roadmap) => roadmap.id === id) ?? null;
  }

  public async saveRoadmap(payload: CreateRoadmapPayload | Roadmap): Promise<Roadmap> {
    const roadmaps = readRoadmapsFromStorage();
    const now = new Date().toISOString();

    if (isFullRoadmap(payload)) {
      const existingIndex = roadmaps.findIndex((r) => r.id === payload.id);
      const updatedRoadmap: Roadmap = {
        ...payload,
        updatedAt: now,
      };
      if (existingIndex >= 0) {
        roadmaps[existingIndex] = updatedRoadmap;
      } else {
        roadmaps.unshift(updatedRoadmap);
      }
      writeRoadmapsToStorage(roadmaps);
      return updatedRoadmap;
    }

    const roadmapId = generateId('roadmap');
    const chapters: RoadmapChapter[] = payload.chapters.map((chapter, cIdx) => {
      const chapterId = generateId('chapter');
      const items: RoadmapItem[] = chapter.items.map((item, iIdx) => ({
        id: generateId('item'),
        chapterId,
        roadmapId,
        orderIndex: iIdx + 1,
        title: item.title,
        description: item.description,
        subTasks: item.subTasks ?? [],
        keywords: item.keywords ?? [],
        estimatedTime: item.estimatedTime,
        status: 'TODO',
        memo: item.memo ?? '',
        referenceLink: item.referenceLink ?? '',
        completedAt: null,
      }));

      return {
        id: chapterId,
        roadmapId,
        orderIndex: cIdx + 1,
        title: chapter.title,
        description: chapter.description,
        items,
      };
    });

    const newRoadmap: Roadmap = {
      id: roadmapId,
      userId: GUEST_USER_ID,
      title: payload.title,
      topic: payload.topic,
      level: payload.level,
      targetDuration: payload.targetDuration,
      summary: payload.summary,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
      chapters,
    };

    roadmaps.unshift(newRoadmap);
    writeRoadmapsToStorage(roadmaps);
    return newRoadmap;
  }

  public async updateItemStatus(
    itemId: string,
    status: ItemStatus
  ): Promise<RoadmapItem | null> {
    const roadmaps = readRoadmapsFromStorage();
    const now = new Date().toISOString();
    let updatedItem: RoadmapItem | null = null;

    for (const roadmap of roadmaps) {
      for (const chapter of roadmap.chapters) {
        const item = chapter.items.find((i) => i.id === itemId);
        if (item) {
          item.status = status;
          item.completedAt = status === 'DONE' ? now : null;
          roadmap.updatedAt = now;
          updatedItem = { ...item };
          break;
        }
      }
      if (updatedItem) break;
    }

    if (updatedItem) {
      writeRoadmapsToStorage(roadmaps);
    }

    return updatedItem;
  }

  public async saveItemMemo(
    itemId: string,
    memo: string,
    referenceLink?: string
  ): Promise<RoadmapItem | null> {
    const roadmaps = readRoadmapsFromStorage();
    const now = new Date().toISOString();
    let updatedItem: RoadmapItem | null = null;

    for (const roadmap of roadmaps) {
      for (const chapter of roadmap.chapters) {
        const item = chapter.items.find((i) => i.id === itemId);
        if (item) {
          item.memo = memo;
          if (referenceLink !== undefined) {
            item.referenceLink = referenceLink;
          }
          roadmap.updatedAt = now;
          updatedItem = { ...item };
          break;
        }
      }
      if (updatedItem) break;
    }

    if (updatedItem) {
      writeRoadmapsToStorage(roadmaps);
    }

    return updatedItem;
  }

  public async toggleArchiveRoadmap(
    id: string,
    isArchived: boolean
  ): Promise<Roadmap | null> {
    const roadmaps = readRoadmapsFromStorage();
    const target = roadmaps.find((r) => r.id === id);
    if (!target) return null;

    target.isArchived = isArchived;
    target.updatedAt = new Date().toISOString();
    writeRoadmapsToStorage(roadmaps);
    return { ...target };
  }

  public async deleteRoadmap(id: string): Promise<boolean> {
    const roadmaps = readRoadmapsFromStorage();
    const nextRoadmaps = roadmaps.filter((r) => r.id !== id);
    if (nextRoadmaps.length === roadmaps.length) {
      return false;
    }
    writeRoadmapsToStorage(nextRoadmaps);
    return true;
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
