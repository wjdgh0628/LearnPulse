import type {
  StudyGuideContent,
  StudyGuideKeyConcept,
  StudyGuideOfficialDoc,
  StudyGuideResourceItem,
  StudyGuideTimeAllocation,
} from '@/types';

export interface StudyGuideTargetItem {
  title: string;
  description?: string;
  subTasks?: string[];
  keywords?: string[];
  estimatedTime?: string;
  referenceLink?: string;
  orderIndex?: number;
}

type StageNumber = 1 | 2 | 3 | 4;

function detectStageNumber(chapterTitle: string, itemTitle: string): StageNumber {
  if (chapterTitle.includes('1단계')) return 1;
  if (chapterTitle.includes('2단계')) return 2;
  if (chapterTitle.includes('3단계')) return 3;
  if (chapterTitle.includes('4단계')) return 4;

  const combined = `${chapterTitle} ${itemTitle}`;
  if (
    combined.includes('4단계') ||
    combined.includes('심화') ||
    combined.includes('최적화') ||
    combined.includes('포트폴리오') ||
    combined.includes('모의고사')
  ) {
    return 4;
  }
  if (
    combined.includes('3단계') ||
    combined.includes('실전 응용') ||
    combined.includes('미니 과제') ||
    combined.includes('미니 프로젝트')
  ) {
    return 3;
  }
  if (
    combined.includes('2단계') ||
    combined.includes('핵심 문법') ||
    combined.includes('필수 유형')
  ) {
    return 2;
  }
  return 1;
}

function buildKeywordConcepts(
  keywords: string[],
  topicContext: string
): StudyGuideKeyConcept[] {
  const dictionary: Record<string, { definition: string; point: string }> = {
    // Python
    'python --version': {
      definition: '설치된 파이썬 버전을 확인하는 터미널 명령어',
      point: '오류 발생 시 파이썬 PATH 환경변수 등록 여부 확인',
    },
    'venv 가상환경': {
      definition: '프로젝트별 독립 패키지 공간을 만드는 내장 모듈',
      point: '실무에서는 항상 .venv를 먼저 켜고 패키지를 설치함',
    },
    'VS Code 인터프리터': {
      definition: 'VS Code가 코드를 실행할 파이썬 경로 지정 설정',
      point: 'Ctrl+Shift+P → Select Interpreter에서 .venv 선택',
    },
    'print()': {
      definition: '괄호 안의 값을 화면(콘솔)에 출력하는 기본 함수',
      point: '쉼표(,)로 여러 값을 넣으면 공백으로 구분해 출력됨',
    },
    '변수(Variable)': {
      definition: '데이터를 저장하고 재사용하기 위해 붙이는 이름표',
      point: '파이썬은 소문자+밑줄(user_name) 표기법을 표준으로 사용',
    },
    'int / float / bool': {
      definition: '정수(int), 실수(float), 참/거짓(bool) 3대 기초 자료형',
      point: '일반 나눗셈(/) 결과는 항상 실수(float)로 반환됨',
    },
    '몫(//)과 나머지(%)': {
      definition: '//는 정수 몫, %는 나눈 나머지를 구하는 연산자',
      point: 'n % 2 == 0 (짝수 판별) 및 시간(분/초) 계산에 필수',
    },
    'type() 함수': {
      definition: '값이나 변수의 자료형을 즉시 확인하는 내장 함수',
      point: '타입 에러 발생 시 type(변수)로 형태부터 점검',
    },
    '인덱싱(0부터 시작)': {
      definition: '위치 번호(0번~)로 글자나 요소를 하나만 꺼내는 문법',
      point: '첫 요소는 [0], 마지막 요소는 [-1]로 조회',
    },
    '슬라이싱 [시작:끝]': {
      definition: '[시작 : 끝] 구간만큼 데이터를 잘라내는 문법',
      point: '끝 번호는 포함되지 않고 "끝 번호 직전"까지만 잘림',
    },
    'f-string': {
      definition: 'f"문자열 {변수}" 형태로 값을 깔끔하게 넣는 포매팅',
      point: '중괄호 {} 안에 변수뿐 아니라 간단한 수식도 사용 가능',
    },
    'split() / strip()': {
      definition: 'strip()은 양끝 공백 제거, split()은 문자열 쪼개기',
      point: 'text.strip().split(",") 형태로 연결해 가장 많이 사용',
    },
    'List [append, pop]': {
      definition: '순서대로 데이터를 담고 추가·삭제하는 대괄호 [] 리스트',
      point: '.append(값)는 리스트 맨 끝에 새 항목을 바로 추가함',
    },
    'Dict {key: value}': {
      definition: '이름표(Key)와 값(Value) 쌍으로 저장하는 중괄호 {} 사전',
      point: 'JSON API 데이터와 구조가 같아 실무 활용도 1순위',
    },
    '.get() 안전 조회': {
      definition: '없는 키를 찾아도 에러 대신 기본값을 돌려주는 메서드',
      point: 'data["key"] 대신 data.get("key", 0) 사용 권장',
    },
    'in 연산자': {
      definition: '특정 값이 포함되어 있는지 True/False로 확인하는 연산자',
      point: 'if "키워드" in 리스트: 형태로 조건문에서 직관적으로 활용',
    },
    // ML / DL
    '지도학습(회귀·분류)': {
      definition: '정답(Label)이 있는 데이터로 숫자 예측(회귀)이나 범주 구분(분류)을 학습하는 방식',
      point: '집값 예측은 회귀(Regression), 스팸 메일 판별은 분류(Classification)',
    },
    '비지도학습(군집화)': {
      definition: '정답 없이 데이터끼리의 유사도를 기준으로 그룹을 묶는 학습 방식',
      point: '고객 세그먼트 분류(K-Means)나 차원 축소(PCA)에 주로 사용',
    },
    'Train / Validation / Test': {
      definition: '학습용(Train), 중간 점검용(Val), 최종 평가용(Test)으로 데이터를 나누는 원칙',
      point: 'Test 데이터는 모델 학습이나 튜닝 과정에 절대 노출되면 안 됨',
    },
    '과적합(Overfitting)': {
      definition: '모델이 학습 데이터만 달달 외워서 새로운 데이터(Test)에서는 성능이 떨어지는 현상',
      point: 'Train 점수는 높은데 Validation 점수가 낮다면 과적합 신호',
    },
    'train_test_split': {
      definition: '전체 데이터를 학습용과 테스트용(예: 8:2)으로 랜덤 분할하는 Scikit-learn 함수',
      point: 'random_state=42를 지정하면 실행할 때마다 동일한 분할 결과 유지',
    },
    'StandardScaler': {
      definition: '특성(Feature)들의 평균을 0, 표준편차를 1로 맞추는 정규화 도구',
      point: 'Train 데이터에는 fit_transform(), Test 데이터에는 transform()만 적용!',
    },
    'fit() / predict()': {
      definition: 'fit()은 데이터로 모델을 학습시키고, predict()는 학습된 모델로 정답을 예측함',
      point: 'Scikit-learn의 모든 머신러닝 모델이 동일하게 사용하는 표준 메서드',
    },
    'Precision / Recall / F1': {
      definition: '불균형 데이터에서 모델의 정밀도(Precision)와 재현율(Recall)을 평가하는 지표',
      point: '암 진단·사기 탐지처럼 정답 비율이 한쪽으로 쏠린 경우 Accuracy 대신 F1 확인',
    },
    '퍼셉트론 & 은닉층': {
      definition: '입력값에 가중치(W)를 곱해 다음 층으로 전달하는 인공신경망의 기본 단위',
      point: '입력층과 출력층 사이에 여러 은닉층(Hidden Layer)을 쌓은 것이 딥러닝',
    },
    'ReLU / Sigmoid': {
      definition: '신경망에 비선형성을 부여하는 활성화 함수(Activation Function)',
      point: '은닉층에는 기울기 소실이 적은 ReLU를, 이진 분류 출력층에는 Sigmoid를 주로 사용',
    },
    '손실함수(Loss) & 경사하강법': {
      definition: '예측값과 실제 정답의 오차(Loss)를 줄이는 방향으로 가중치를 업데이트하는 원리',
      point: '학습률(Learning Rate)이 너무 크면 발산하고, 너무 작으면 학습이 느려짐',
    },
    'zero_grad() → backward() → step()': {
      definition: 'PyTorch에서 오차 역전파로 가중치를 1회 업데이트하는 3단계 필수 공식',
      point: '매 배치마다 optimizer.zero_grad()로 이전 기울기를 먼저 초기화해야 함',
    },
  };

  return keywords.map((kw) => {
    const matched = dictionary[kw];
    if (matched) {
      return {
        term: kw,
        definition: matched.definition,
        point: matched.point,
      };
    }

    return {
      term: kw,
      definition: `'${topicContext}' 단원에서 반드시 짚고 넘어가야 할 핵심 개념`,
      point: `참고자료에서 '${kw}' 키워드가 등장하는 예제 중심으로 동작 원리 확인`,
    };
  });
}

function buildDefaultTimeAllocation(
  estimatedTime?: string
): StudyGuideTimeAllocation[] {
  const totalLabel = estimatedTime ?? '45분';
  return [
    {
      phase: 'STEP 1 · 참고자료 보기',
      duration: '15분',
      detail: `[전체 ${totalLabel}] 아래 1~3번 추천 자료 중 1개를 골라 지정 범위만 읽기`,
    },
    {
      phase: 'STEP 2 · 예제 따라 하기',
      duration: '20분',
      detail: '본 페이지의 실전 예제와 3단계 체크리스트를 직접 실습하기',
    },
    {
      phase: 'STEP 3 · 퀴즈 & 3줄 메모',
      duration: '10분',
      detail: '셀프 Q&A 확인 후 하단 노트장에 핵심 3줄 요약 남기기',
    },
  ];
}

function buildCuratedResources(
  itemTitle: string,
  roadmapTopic: string,
  chapterTitle: string,
  keywords: string[],
  referenceLink?: string
): StudyGuideResourceItem[] {
  const combined = `${roadmapTopic} ${chapterTitle} ${itemTitle}`.toLowerCase();
  const stage = detectStageNumber(chapterTitle, itemTitle);
  const kwLabel = keywords.slice(0, 2).join(', ') || itemTitle;

  // =========================================================================
  // 1. 머신러닝 / 딥러닝 / AI (1단계 ~ 4단계 단계별 참고자료 완전 분리!)
  // =========================================================================
  if (
    combined.includes('머신러닝') ||
    combined.includes('딥러닝') ||
    combined.includes('machine learning') ||
    combined.includes('deep learning') ||
    combined.includes('인공지능') ||
    combined.includes('신경망') ||
    combined.includes('pytorch') ||
    combined.includes('scikit') ||
    combined.includes('ai')
  ) {
    if (stage === 1) {
      return [
        {
          category: '공식 문서 (필독)',
          title: 'Google 머신러닝 단기집중과정 (한국어 공식 입문 가이드)',
          whatToRead: `[ML로 문제 풀기] 및 [손실·일반화] 파트에서 '${kwLabel}' 개념 그림과 3분 요약 글만 읽기`,
          whyRecommended: '구글 엔지니어가 수식 없이 그림과 애니메이션으로 설명하는 최고의 1단계 입문서',
          url:
            referenceLink && !referenceLink.includes('google.com/search')
              ? referenceLink
              : 'https://developers.google.com/machine-learning/crash-course?hl=ko',
        },
        {
          category: '추천 학습 자료',
          title: '데이터 분석을 위한 파이썬 & Pandas 입문 (위키독스)',
          whatToRead: `데이터 불러오기(read_csv), 결측치 처리(fillna), 기초 전처리 예제 코드만 따라 치기`,
          whyRecommended: '1단계에서 가장 먼저 익혀야 할 데이터프레임 조작과 전처리 기초를 가장 쉽게 설명',
          url: 'https://wikidocs.net/book/2155',
        },
        {
          category: '실습 환경/도구',
          title: 'Google Colab (무료 클라우드 Jupyter 노트북 실습장)',
          whatToRead: '새 노트북을 열고 아래 [1단계 기초 전처리 코드]를 붙여넣어 Shift+Enter로 바로 실행하기',
          whyRecommended: '내 컴퓨터에 복잡한 설치를 하지 않아도 웹 브라우저에서 즉시 파이썬·ML 실습 가능',
          url: 'https://colab.research.google.com/',
        },
      ];
    }

    if (stage === 2) {
      return [
        {
          category: '공식 문서 (필독)',
          title: 'Scikit-learn 공식 User Guide — 지도학습(회귀·분류·트리) 레퍼런스',
          whatToRead: `목차에서 [${kwLabel}] 알고리즘의 기본 원리 요약과 fit() / predict() 예제 블록만 확인`,
          whyRecommended: '2단계 핵심인 고전 머신러닝 알고리즘(선형회귀, 로지스틱, 랜덤포레스트)의 표준 공식 문서',
          url:
            referenceLink && !referenceLink.includes('google.com/search')
              ? referenceLink
              : 'https://scikit-learn.org/stable/supervised_learning.html',
        },
        {
          category: '핵심 튜토리얼',
          title: 'MLU-Explain (Amazon 머신러닝 알고리즘 시각적 인터랙티브 가이드)',
          whatToRead: `Linear Regression, Logistic Regression, Decision Tree, ROC-AUC 아티클의 슬라이더를 직접 움직여 보기`,
          whyRecommended: '회귀선·결정 경계·평가 지표가 데이터에 따라 어떻게 바뀌는지 눈으로 즉시 이해됨',
          url: 'https://mlu-explain.github.io/',
        },
        {
          category: '실습 환경/도구',
          title: 'Scikit-learn Model Evaluation (정확도·F1·ROC 평가 지표 사전)',
          whatToRead: 'Classification metrics 섹션에서 Precision, Recall, F1-score 계산 공식과 코드 예제만 발췌독',
          whyRecommended: '2단계에서 가장 헷갈리기 쉬운 혼동행렬(Confusion Matrix)과 모델 평가 기준을 명확히 정리',
          url: 'https://scikit-learn.org/stable/modules/model_evaluation.html',
        },
      ];
    }

    if (stage === 3) {
      return [
        {
          category: '공식 문서 (필독)',
          title: '파이토치(PyTorch) 한국어 공식 튜토리얼 — 60분 블리츠 & 실전 신경망 구현',
          whatToRead: `[신경망(nn.Module) 정의하기]와 [분류기(Classifier) 학습하기] 파트의 5단계 학습 루프 코드만 집중 확인`,
          whyRecommended: '3단계 실전 응용 및 딥러닝 미니 과제를 직접 코드로 설계·구현할 때 가장 많이 참고하는 한국어 공식 가이드',
          url:
            referenceLink && !referenceLink.includes('google.com/search')
              ? referenceLink
              : 'https://tutorials.pytorch.kr/beginner/deep_learning_60min_blitz.html',
        },
        {
          category: '추천 학습 자료',
          title: 'PyTorch로 시작하는 딥러닝 입문 & 실전 프로젝트 (위키독스)',
          whatToRead: `미니 과제 설계 순서(데이터셋 정의 → DataLoader → 모델 클래스 → 학습/검증 루프) 챕터 예제 따라 하기`,
          whyRecommended: '작은 실전 과제를 처음부터 끝까지 쪼개서 구현하는 한국어 단계별 실습 교재',
          url: 'https://wikidocs.net/book/2788',
        },
        {
          category: '실습 환경/도구',
          title: 'TensorFlow Playground (브라우저 신경망 & 하이퍼파라미터 실시간 시뮬레이터)',
          whatToRead: '은닉층(Hidden Layers) 개수와 활성화 함수(ReLU/Sigmoid), 학습률을 바꾸며 분류 경계가 수렴하는 과정 관찰',
          whyRecommended: '3단계 핵심인 신경망 층 설계와 역전파 학습 과정을 클릭만으로 직관적으로 체득 가능',
          url: 'https://playground.tensorflow.org/',
        },
      ];
    }

    // stage === 4 (4단계: 심화 튜닝, Kaggle 프로젝트, 포트폴리오)
    return [
      {
        category: '공식 문서 (필독)',
        title: 'Kaggle Learn — Intermediate ML & 실전 데이터셋 컴페티션 가이드',
        whatToRead: `Cross-Validation(교차 검증), XGBoost/LightGBM 부스팅, Data Leakage 방지 레슨 실습하기`,
        whyRecommended: '4단계 최종 목표인 실전 데이터셋 완주와 상위권 모델링 파이프라인을 익히는 표준 코스',
        url:
          referenceLink && !referenceLink.includes('google.com/search')
            ? referenceLink
            : 'https://www.kaggle.com/learn/intermediate-machine-learning',
      },
      {
        category: '핵심 튜토리얼',
        title: 'Made With ML — 실전 머신러닝 프로젝트 아키텍처 & 모델 튜닝 가이드',
        whatToRead: `[Tuning / Evaluation / Experiment Tracking] 파트에서 하이퍼파라미터 최적화와 모델 비교 표 작성법 읽기`,
        whyRecommended: '단순 실습을 넘어 현업 수준의 머신러닝 프로젝트 구조화와 성능 개선 리포트 작성법을 안내',
        url: 'https://madewithml.com/',
      },
      {
        category: '실습 환경/도구',
        title: 'Papers With Code & Kaggle Notebooks (실전 SOTA 베이스라인 코드 검색)',
        whatToRead: '내 과제와 유사한 주제의 상위권 노트북(EDA → 피처 엔지니어링 → 앙상블) 구조를 벤치마킹하기',
        whyRecommended: '검증된 실전 프로젝트 코드와 최신 모델 성능 비교표를 한눈에 찾아볼 수 있는 레퍼런스',
        url: 'https://www.kaggle.com/code',
      },
    ];
  }

  // =========================================================================
  // 2. Python (1단계 ~ 4단계 단계별 참고자료 완전 분리!)
  // =========================================================================
  if (
    combined.includes('python') ||
    combined.includes('파이썬') ||
    combined.includes('venv') ||
    combined.includes('슬라이싱') ||
    combined.includes('딕셔너리')
  ) {
    if (stage === 1) {
      return [
        {
          category: '공식 문서 (필독)',
          title: 'Python 3 한국어 공식 자습서 — 1~3장 (환경 설정 & 기초 자료형)',
          whatToRead: `목차에서 '${keywords[0] ?? itemTitle}' 파트의 첫 설명과 인터프리터 예제 상자만 읽기`,
          whyRecommended: '1단계 입문자가 파이썬 설치, 가상환경, 숫자·문자열·리스트 기초를 가장 정확히 잡는 공식 가이드',
          url:
            referenceLink && !referenceLink.includes('google.com/search')
              ? referenceLink
              : 'https://docs.python.org/ko/3/tutorial/introduction.html',
        },
        {
          category: '추천 학습 자료',
          title: '점프 투 파이썬 — 01~02장 기초 자료형 편 (위키독스)',
          whatToRead: `'${kwLabel}' 챕터의 쉬운 비유 설명을 읽고 하단 되새김 문제 1개 풀기`,
          whyRecommended: '입문자 눈높이 그림과 비유가 풍부한 국내 대표 무료 기초 교재',
          url: 'https://wikidocs.net/book/1',
        },
        {
          category: '실습 환경/도구',
          title: 'Python Tutor (변수·리스트 메모리 실행 시각화 도구)',
          whatToRead: '아래 [실전 예제 코드]를 붙여넣고 Next 버튼을 누르며 변수와 인덱스가 바뀌는 모습 확인',
          whyRecommended: '코드가 한 줄씩 실행될 때 메모리에 데이터가 어떻게 담기는지 눈으로 보여줌',
          url: 'https://pythontutor.com/python-compiler.html',
        },
      ];
    }

    if (stage === 2) {
      return [
        {
          category: '공식 문서 (필독)',
          title: 'Python 3 공식 문서 — 4장 제어 흐름 도구 (if · for · while · def 함수)',
          whatToRead: `조건문·반복문·함수 정의(def) 및 리스트 컴프리헨션 예제 코드 블록만 집중 확인`,
          whyRecommended: '2단계 핵심 문법인 조건 분기, 반복 순회, 함수 인자 전달 원리를 가장 명쾌하게 정리',
          url:
            referenceLink && !referenceLink.includes('google.com/search')
              ? referenceLink
              : 'https://docs.python.org/ko/3/tutorial/controlflow.html',
        },
        {
          category: '핵심 튜토리얼',
          title: '파이썬 코딩도장 — 조건문·반복문·함수 핵심 패턴 & 연습문제',
          whatToRead: `'${kwLabel}' 단원의 그림 다이어그램을 보고 퀴즈와 심사문제 2개 풀어보기`,
          whyRecommended: '들여쓰기 규칙과 반복문/함수 실행 순서를 시각적 화살표로 설명해 이해가 빠름',
          url: 'https://dojang.io/course/view.php?id=7',
        },
        {
          category: '실습 환경/도구',
          title: 'Programiz Online Python Runner (설치 없는 함수·반복문 즉시 실행기)',
          whatToRead: '아래 함수와 반복문 예제를 붙여넣고 입력값을 바꿔가며 반환값(return) 테스트하기',
          whyRecommended: '브라우저에서 즉시 조건문·함수 로직을 수정하며 빠르게 실험 가능',
          url: 'https://www.programiz.com/python-programming/online-compiler/',
        },
      ];
    }

    if (stage === 3) {
      return [
        {
          category: '공식 문서 (필독)',
          title: 'Python 표준 라이브러리 공식 레퍼런스 (json · csv · pathlib 파일 입출력)',
          whatToRead: `'with open()' 파일 읽기/쓰기와 'json.loads()', 'csv.DictReader' 실전 예제 코드만 발췌독`,
          whyRecommended: '3단계 실전 미니 과제에서 외부 데이터를 읽고 저장할 때 반드시 쓰는 필수 내장 모듈',
          url:
            referenceLink && !referenceLink.includes('google.com/search')
              ? referenceLink
              : 'https://docs.python.org/ko/3/tutorial/inputoutput.html',
        },
        {
          category: '추천 학습 자료',
          title: '초보자를 위한 파이썬 300제 & 실전 미니 프로젝트 모음 (위키독스)',
          whatToRead: `파일 입출력·모듈 분리·외부 API 호출 파트(201~260번) 문제를 직접 코드로 작성해 보기`,
          whyRecommended: '배운 문법을 조합해 작은 프로그램을 완성하는 3단계 응용 훈련에 최적',
          url: 'https://wikidocs.net/book/922',
        },
        {
          category: '실습 환경/도구',
          title: 'JSONPlaceholder (실전 REST API 호출 연습용 무료 서버)',
          whatToRead: '파이썬 requests 모듈로 https://jsonplaceholder.typicode.com/todos 데이터를 가져와 파싱해 보기',
          whyRecommended: '별도 서버 구축 없이 실제 웹 API 응답(JSON)을 받아 미니 프로젝트를 만들 수 있는 도구',
          url: 'https://jsonplaceholder.typicode.com/',
        },
      ];
    }

    return [
      {
        category: '공식 문서 (필독)',
        title: 'Python 공식 가이드 — 에러와 예외 처리(try-except) & 클래스(OOP)',
        whatToRead: `8장(예외 처리)과 9장(클래스)에서 커스텀 예외 방어 로직과 __init__ 설계 패턴만 읽기`,
        whyRecommended: '4단계 심화 과정에서 프로그램이 멈추지 않게 방어하고 구조를 모듈화하는 핵심 원리',
        url:
          referenceLink && !referenceLink.includes('google.com/search')
            ? referenceLink
            : 'https://docs.python.org/ko/3/tutorial/errors.html',
      },
      {
        category: '핵심 튜토리얼',
        title: 'PEP 8 — 파이썬 공식 코딩 스타일 & 클린 코드 가이드',
        whatToRead: `네이밍 컨벤션(snake_case), 함수 분리 기준, 타입 힌트(Type Hints) 권장 작성법 확인`,
        whyRecommended: '내 코드를 실무 포트폴리오 수준의 깔끔한 파이썬 코드로 리팩토링하는 표준 지침',
        url: 'https://peps.python.org/pep-0008/',
      },
      {
        category: '실습 환경/도구',
        title: 'Pytest 공식 입문 가이드 (파이썬 자동화 단위 테스트 도구)',
        whatToRead: '내가 만든 함수가 엣지 케이스(빈 값, 0, 잘못된 입력)에서도 통과하는지 assert 테스트 코드 작성',
        whyRecommended: '4단계 코드 품질 검증과 디버깅 시간을 획기적으로 줄여주는 실무 필수 테스트 프레임워크',
        url: 'https://docs.pytest.org/en/stable/getting-started.html',
      },
    ];
  }

  // =========================================================================
  // 3. React / TypeScript (1단계 ~ 4단계 단계별 참고자료 완전 분리!)
  // =========================================================================
  if (
    combined.includes('react') ||
    combined.includes('리액트') ||
    combined.includes('typescript') ||
    combined.includes('jsx') ||
    combined.includes('usestate') ||
    combined.includes('useeffect') ||
    combined.includes('zustand') ||
    combined.includes('query')
  ) {
    if (stage === 1) {
      return [
        {
          category: '공식 문서 (필독)',
          title: 'React 공식 한국어 문서 — UI 표현하기 (JSX · Props · 조건부 렌더링)',
          whatToRead: `'${kwLabel}' 단원의 상단 요약 박스와 인터랙티브 코드 샌드박스 예제 1번만 조작해 보기`,
          whyRecommended: '1단계에서 컴포넌트 분리와 Props 전달, JSX 문법 규칙을 가장 정확히 익히는 최신 공식 문서',
          url:
            referenceLink && !referenceLink.includes('google.com/search')
              ? referenceLink
              : 'https://ko.react.dev/learn/describing-the-ui',
        },
        {
          category: '핵심 튜토리얼',
          title: 'React 공식 가이드 — TypeScript와 함께 사용하기',
          whatToRead: `Props interface 선언과 useState<T> 제네릭 타입 지정 코드 예시만 확인`,
          whyRecommended: '1단계에서 가장 자주 막히는 컴포넌트 Props 타입 에러 해결 패턴 총정리',
          url: 'https://ko.react.dev/learn/typescript',
        },
        {
          category: '실습 환경/도구',
          title: 'TypeScript Playground (브라우저 즉시 React+TS 타입 검사기)',
          whatToRead: '아래 컴포넌트 예제를 붙여넣고 마우스를 올려 타입 추론 결과 확인하기',
          whyRecommended: '프로젝트 설치 없이 브라우저에서 즉시 TSX 문법과 타입 에러를 실험 가능',
          url: 'https://www.typescriptlang.org/play',
        },
      ];
    }

    if (stage === 2) {
      return [
        {
          category: '공식 문서 (필독)',
          title: 'React 공식 한국어 문서 — 상호작용성 더하기 & 탈출구 (useState · useEffect)',
          whatToRead: `State 업데이트 큐 원리와 useEffect 의존성 배열(Dependency Array) 클린업 규칙 읽기`,
          whyRecommended: '2단계 핵심인 상태 불변성(Immutability)과 비동기 생명주기 동기화를 완벽히 잡아줌',
          url:
            referenceLink && !referenceLink.includes('google.com/search')
              ? referenceLink
              : 'https://ko.react.dev/learn/adding-interactivity',
        },
        {
          category: '핵심 튜토리얼',
          title: 'React TypeScript Cheatsheets (실무 이벤트·폼·커스텀 훅 타입 사전)',
          whatToRead: `Forms and Events 섹션에서 onChange, onSubmit 이벤트 핸들러 타입 지정법 확인`,
          whyRecommended: '현업 프론트엔드 개발자들이 폼 제어와 커스텀 훅 작성 시 가장 많이 참고하는 실전 치트시트',
          url: 'https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forms_and_events/',
        },
        {
          category: '실습 환경/도구',
          title: 'StackBlitz React + TypeScript 실시간 개발 환경',
          whatToRead: 'useEffect API 호출 및 Custom Hook 분리 예제를 직접 실행하며 콘솔 로그 확인',
          whyRecommended: '실제 Vite + React 환경과 100% 동일하게 브라우저에서 훅 동작을 검증 가능',
          url: 'https://stackblitz.com/edit/vitejs-vite-react-ts',
        },
      ];
    }

    if (stage === 3) {
      return [
        {
          category: '공식 문서 (필독)',
          title: 'TanStack Query (React Query) v5 & Zustand 공식 실전 가이드',
          whatToRead: `useQuery 캐싱/로딩 처리 패턴과 Zustand create<Store>() 전역 상태 분리 예제만 읽기`,
          whyRecommended: '3단계 실전 미니 프로젝트에서 서버 상태와 클라이언트 전역 상태를 분리하는 현대 표준 스택',
          url:
            referenceLink && !referenceLink.includes('google.com/search')
              ? referenceLink
              : 'https://tanstack.com/query/latest/docs/framework/react/overview',
        },
        {
          category: '추천 학습 자료',
          title: 'Zustand 공식 문서 — TypeScript Store 설계 & Persist 미들웨어',
          whatToRead: `작은 스토어를 만들고 localStorage에 자동 저장(persist)하는 실전 코드 패턴 확인`,
          whyRecommended: 'Props Drilling 없이 깔끔하게 실전 앱의 상태 아키텍처를 설계하는 핵심 레퍼런스',
          url: 'https://zustand.docs.pmnd.rs/guides/typescript',
        },
        {
          category: '실습 환경/도구',
          title: 'React Developer Tools (크롬 확장 컴포넌트 트리 & 상태 디버거)',
          whatToRead: 'Components 탭에서 내가 만든 미니 프로젝트의 Props/State 변화를 실시간으로 추적하기',
          whyRecommended: '3단계 실전 기능 구현 중 상태가 왜 안 바뀌는지 1초 만에 찾아내는 필수 디버깅 도구',
          url: 'https://react.dev/learn/react-developer-tools',
        },
      ];
    }

    return [
      {
        category: '공식 문서 (필독)',
        title: 'React 공식 문서 — 렌더링 성능 최적화 (useMemo · useCallback · React.memo)',
        whatToRead: `불필요한 리렌더링이 발생하는 조건과 메모이제이션 훅을 언제 써야 하는지 비교 예제 읽기`,
        whyRecommended: '4단계 심화 과정에서 앱의 반응 속도를 높이고 렌더링 병목을 해결하는 공식 지침',
        url:
          referenceLink && !referenceLink.includes('google.com/search')
            ? referenceLink
            : 'https://ko.react.dev/reference/react/useMemo',
      },
      {
        category: '핵심 튜토리얼',
        title: 'Web.dev — 프론트엔드 Core Web Vitals & 번들 최적화 가이드',
        whatToRead: `코드 스플리팅(React.lazy)과 이미지·폰트 로딩 최적화 체크리스트 확인`,
        whyRecommended: '실무 배포 전 Lighthouse 성능 점수를 끌어올리는 구체적인 최적화 기법 정리',
        url: 'https://web.dev/explore/fast?hl=ko',
      },
      {
        category: '실습 환경/도구',
        title: 'Vercel / Netlify 프론트엔드 배포 & 프로덕션 빌드 검증 가이드',
        whatToRead: 'npm run build로 타입/번들 에러를 점검하고 실제 배포 URL을 생성하는 과정 따라 하기',
        whyRecommended: '완성한 4단계 프로젝트를 누구나 접속 가능한 포트폴리오 링크로 배포하는 가장 빠른 도구',
        url: 'https://vercel.com/docs/frameworks/vite',
      },
    ];
  }

  // =========================================================================
  // 4. SQL / 데이터베이스 (1단계 ~ 4단계 단계별 참고자료 완전 분리!)
  // =========================================================================
  if (
    combined.includes('sql') ||
    combined.includes('데이터베이스') ||
    combined.includes('db') ||
    combined.includes('join') ||
    combined.includes('window') ||
    combined.includes('쿼리')
  ) {
    if (stage === 1) {
      return [
        {
          category: '공식 문서 (필독)',
          title: 'SQLBolt — Lesson 1~5 (SELECT · WHERE · ORDER BY 기초 인터랙티브 튜토리얼)',
          whatToRead: `'${kwLabel}' 레슨의 짧은 표 설명을 읽고 하단 입력창에서 바로 기초 쿼리 3문제 풀기`,
          whyRecommended: '1단계 입문자가 DB 설치 없이 브라우저에서 즉시 SELECT 필터링을 손에 익히는 최고의 사이트',
          url:
            referenceLink && !referenceLink.includes('google.com/search')
              ? referenceLink
              : 'https://sqlbolt.com/',
        },
        {
          category: '추천 학습 자료',
          title: 'PostgreSQL 공식 SQL 입문 튜토리얼 (테이블 조회와 NULL/집계 기초)',
          whatToRead: `[Querying a Table] 및 [Aggregate Functions] 파트의 입력 테이블 → 결과 테이블 비교`,
          whyRecommended: 'COUNT(*), COUNT(컬럼), COALESCE 등 1단계 필수 기초 문법의 표준 동작을 정확히 설명',
          url: 'https://www.postgresql.org/docs/current/tutorial-select.html',
        },
        {
          category: '실습 환경/도구',
          title: 'SQLite Online (설치 없는 웹 SQL 즉시 실행기)',
          whatToRead: '아래 [실전 예제 쿼리]를 붙여넣고 WHERE 조건과 정렬 순서를 바꾸며 결과 비교하기',
          whyRecommended: '복잡한 DB 서버 설정 없이 1초 만에 SQL 쿼리 결과를 표로 확인 가능',
          url: 'https://sqliteonline.com/',
        },
      ];
    }

    if (stage === 2) {
      return [
        {
          category: '공식 문서 (필독)',
          title: 'Mode SQL Tutorial — Intermediate SQL (GROUP BY · HAVING · INNER/LEFT JOIN)',
          whatToRead: `JOIN 벤다이어그램과 GROUP BY + HAVING 실행 순서 다이어그램 및 실무 매출 집계 예제 읽기`,
          whyRecommended: '2단계 핵심인 다중 테이블 결합(JOIN)과 그룹 집계(GROUP BY)를 실무 데이터로 가장 잘 설명',
          url:
            referenceLink && !referenceLink.includes('google.com/search')
              ? referenceLink
              : 'https://mode.com/sql-tutorial/sql-group-by/',
        },
        {
          category: '핵심 튜토리얼',
          title: 'SQL Joins Visualizer (JOIN 방식별 결과 행 변화를 눈으로 보는 도구)',
          whatToRead: `INNER JOIN, LEFT JOIN, LEFT JOIN + IS NULL을 클릭하며 어떤 행이 남고 빠지는지 확인`,
          whyRecommended: '머릿속으로 헷갈리는 테이블 조인 결과와 1:N 중복 뻥튀기 원리를 시각적으로 해결',
          url: 'https://sql-joins.leopard.in.ua/',
        },
        {
          category: '실습 환경/도구',
          title: 'DB Fiddle (다중 테이블 생성 & JOIN 실험 샌드박스)',
          whatToRead: '회원(users)과 주문(orders) 두 테이블을 조인해 미구매 회원과 우수 회원을 추출해 보기',
          whyRecommended: '2단계 JOIN과 GROUP BY 쿼리를 직접 수정하며 실험하기 가장 좋은 무료 환경',
          url: 'https://www.db-fiddle.com/',
        },
      ];
    }

    if (stage === 3) {
      return [
        {
          category: '공식 문서 (필독)',
          title: 'PostgreSQL 공식 문서 — Window Functions (ROW_NUMBER · RANK · LAG · 누적합)',
          whatToRead: `PARTITION BY와 ORDER BY를 조합해 그룹별 순위와 전월 대비 증감률을 구하는 예제 확인`,
          whyRecommended: '3단계 실전 데이터 분석 과제(순위, 누적 매출, 리텐션)에 필수인 윈도우 함수 공식 가이드',
          url:
            referenceLink && !referenceLink.includes('google.com/search')
              ? referenceLink
              : 'https://www.postgresql.org/docs/current/tutorial-window.html',
        },
        {
          category: '추천 학습 자료',
          title: 'Mode Analytics — 실전 비즈니스 지표(MAU · 코호트 리텐션 · 퍼널) SQL 레시피',
          whatToRead: `WITH (CTE) 구문으로 가독성 높게 단계별 분석 테이블을 쪼개어 작성하는 패턴 읽기`,
          whyRecommended: '3단계 실전 미니 과제에서 복잡한 비즈니스 질문을 단계별 SQL 쿼리로 풀어내는 방법 안내',
          url: 'https://mode.com/sql-tutorial/sql-window-functions/',
        },
        {
          category: '실습 환경/도구',
          title: 'LeetCode SQL 50 (실무 코딩테스트 & 실전 데이터 추출 문제집)',
          whatToRead: 'Subqueries 및 Advanced Select/Joins 파트의 실전 문제 2개를 골라 직접 쿼리 제출하기',
          whyRecommended: '배운 JOIN·CTE·윈도우 함수를 실전 문제에 적용해 즉시 채점받을 수 있는 훈련장',
          url: 'https://leetcode.com/studyplan/top-sql-50/',
        },
      ];
    }

    return [
      {
        category: '공식 문서 (필독)',
        title: 'Use The Index, Luke! (한국어판 SQL 인덱스 설계 & 성능 튜닝 바이블)',
        whatToRead: `[Where절과 인덱스] 및 [복합 인덱스 컬럼 순서] 파트에서 Full Table Scan이 발생하는 원인 읽기`,
        whyRecommended: '4단계 심화 과정인 대용량 쿼리 속도 개선과 인덱스 원리를 가장 깊이 있게 다룬 무료 명저',
        url:
          referenceLink && !referenceLink.includes('google.com/search')
            ? referenceLink
            : 'https://use-the-index-luke.com/ko',
      },
      {
        category: '핵심 튜토리얼',
        title: 'PostgreSQL 공식 가이드 — EXPLAIN ANALYZE 실행 계획 읽는 법',
        whatToRead: `Seq Scan vs Index Scan 차이와 Cost/Actual Time 지표를 해석하는 예제만 확인`,
        whyRecommended: '느린 쿼리의 병목 지점을 감이 아닌 데이터(실행 계획)로 찾아내는 4단계 핵심 역량',
        url: 'https://www.postgresql.org/docs/current/using-explain.html',
      },
      {
        category: '실습 환경/도구',
        title: 'Explain Dalibo (복잡한 SQL 실행 계획을 트리 그래프로 시각화하는 도구)',
        whatToRead: 'EXPLAIN (ANALYZE, BUFFERS) 결과를 붙여넣고 어느 조인/정렬 단계에서 시간이 가장 걸리는지 확인',
        whyRecommended: '현업 DBA와 백엔드 개발자가 쿼리 튜닝 리포트를 작성할 때 사용하는 시각화 도구',
        url: 'https://explain.dalibo.com/',
      },
    ];
  }

  // =========================================================================
  // 5. 토익 / 영어 / 어학 (1단계 ~ 4단계 단계별 참고자료 완전 분리!)
  // =========================================================================
  if (
    combined.includes('토익') ||
    combined.includes('toeic') ||
    combined.includes('영어') ||
    combined.includes('어학')
  ) {
    if (stage === 1) {
      return [
        {
          category: '공식 문서 (필독)',
          title: 'YBM 한국토익위원회 — 토익 구성 및 Part 1·2·5 기초 출제 가이드',
          whatToRead: `1단계 기초 파트(Part 1 사진묘사, Part 2 질의응답, Part 5 문법 구조)의 공식 출제 포인트 확인`,
          whyRecommended: '출제 기관에서 직접 안내하는 토익 문항 구성과 기본 채점 포인트를 가장 먼저 파악',
          url: 'https://exam.toeic.co.kr/common/template/viewContents.php?contentsCode=18',
        },
        {
          category: '추천 학습 자료',
          title: 'Cambridge Learner’s Dictionary (기초 비즈니스 필수 어휘 & 짝꿍 표현 사전)',
          whatToRead: `오늘 학습할 키워드(${kwLabel})의 품사별 형태와 비즈니스 짧은 예문 2개씩 소리 내어 읽기`,
          whyRecommended: '1단계에서 단어 뜻만 외우지 않고 자동사/타동사 구분과 전치사 짝꿍을 익히는 데 최적',
          url: 'https://dictionary.cambridge.org/ko/',
        },
        {
          category: '실습 환경/도구',
          title: 'YouGlish (미국·영국·호주 원어민 실제 발음 & 연음 청취 도구)',
          whatToRead: 'LC 기초 문장이나 헷갈리는 발음 단어를 입력해 국가별 원어민 발음으로 5회 반복 청취하기',
          whyRecommended: '1단계 LC 귀 뚫기와 쉐도잉 훈련에 가장 효과적인 무료 음성 검색 도구',
          url: 'https://youglish.com/',
        },
      ];
    }

    if (stage === 2) {
      return [
        {
          category: '공식 문서 (필독)',
          title: 'YBM 토익 공식 대표 기출 샘플 문제 (Part 5·6 핵심 문법 & 빈출 어휘)',
          whatToRead: `품사 자리 찾기, 수일치·태·시제, 접속사 vs 전치사 기출 샘플 문항을 시간 재고 풀어보기`,
          whyRecommended: '2단계 핵심인 문법 유형별 5초 컷 풀이 공식을 실제 기출 문항에 바로 적용 가능',
          url: 'https://exam.toeic.co.kr/common/template/viewContents.php?contentsCode=19',
        },
        {
          category: '핵심 튜토리얼',
          title: '해커스 토익 무료 적중 예상특강 & 파트별 빈출 문법 요약노트',
          whatToRead: `'${kwLabel}' 관련 최신 출제 경향 해설 영상과 핵심 문법 포인트 정리표 확인`,
          whyRecommended: '매달 반복 출제되는 Part 5·6 핵심 함정 유형과 오답 소거법을 빠르게 정리',
          url: 'https://www.hackers.co.kr/?c=s_toeic/toeic_study/movie_expect_toeic',
        },
        {
          category: '실습 환경/도구',
          title: 'Oxford Collocations Dictionary (빈칸 앞뒤 짝꿍 어휘 즉시 검색 사전)',
          whatToRead: 'Part 5·6 어휘 문제에서 정답 명사/동사와 자주 결합하는 형용사·부사 짝꿍(Collocation) 검색',
          whyRecommended: '2단계 어휘 문제를 해석 없이 3초 만에 풀 수 있게 해주는 콜로케이션 훈련 도구',
          url: 'https://www.freecollocation.com/',
        },
      ];
    }

    if (stage === 3) {
      return [
        {
          category: '공식 문서 (필독)',
          title: 'ETS 토익 Part 3·4 장문 담화 & Part 7 독해 패러프레이징 집중 가이드',
          whatToRead: `지문 속 표현이 선택지에서 다른 동의어(Paraphrasing)로 바뀌어 출제되는 공식 패턴 비교`,
          whyRecommended: '3단계 실전 응용의 핵심인 장문 독해 속독과 LC 다중 정보 매칭 능력을 길러줌',
          url: 'https://exam.toeic.co.kr/common/template/viewContents.php?contentsCode=19',
        },
        {
          category: '추천 학습 자료',
          title: 'BBC Learning English — English at Work (실전 비즈니스 이메일·회의 담화)',
          whatToRead: `사무실 회의·일정 조율·고객 문의 에피소드 스크립트를 읽고 핵심 키워드 스키밍 연습하기`,
          whyRecommended: 'Part 3·4 대화문과 Part 7 비즈니스 이메일 지문의 실제 배경 상황과 표현을 자연스럽게 습득',
          url: 'https://www.bbc.co.uk/learningenglish/english/features/english-at-work',
        },
        {
          category: '실습 환경/도구',
          title: '해커스 토익 매일 실전 RC/LC 미니 테스트 (무료 일일 실전 문제풀이)',
          whatToRead: '오늘의 RC/LC 실전 문제를 스톱워치를 켜고 풀며 근거 문장 밑줄 긋기 훈련',
          whyRecommended: '3단계에서 매일 짧게 실전 감각을 유지하고 해설지로 즉시 약점을 보완할 수 있는 도구',
          url: 'https://www.hackers.co.kr/?c=s_toeic/toeic_study/dlc_rc',
        },
      ];
    }

    return [
      {
        category: '공식 문서 (필독)',
        title: 'YBM 토익 정기시험 수험자 가이드 & 시간 배분/OMR 마킹 전략',
        whatToRead: `LC 45분 / RC 75분 파트별 권장 풀이 시간표(Part 5·6 20분, Part 7 55분)와 실전 유의사항 점검`,
        whyRecommended: '4단계 실전 모의고사 완주 시 시간 부족으로 뒷문제를 찍지 않게 해주는 필수 운영 전략',
        url: 'https://exam.toeic.co.kr/receipt/guideStep4.php',
      },
      {
        category: '핵심 튜토리얼',
        title: '해커스 토익 실전 모의고사 & 고난도 오답 유형 총정리',
        whatToRead: `실전 난이도 문항을 시간 제한 내에 풀고, 틀린 문제를 [어휘 부족 / 문법 착각 / 시간 부족]으로 분류`,
        whyRecommended: '시험 직전 내 약점 파트를 데이터로 진단하고 목표 점수를 굳히는 4단계 마무리 코스',
        url: 'https://www.hackers.co.kr/?c=s_toeic/toeic_winter/toeic_mocktest',
      },
      {
        category: '실습 환경/도구',
        title: 'YouTube 토익 실전 시험장 소음 버젼 LC 고사장 환경 타이머',
        whatToRead: '실제 고사장 안내 방송 및 RC 75분 카운트다운 타이머를 켜고 전 범위 모의고사 1회분 완주하기',
        whyRecommended: '실제 시험장 긴장감과 파트별 넘기는 타이밍을 몸에 익히는 4단계 최고의 실전 훈련',
        url: 'https://www.youtube.com/results?search_query=%ED%86%A0%EC%9D%B5+%EC%8B%A4%EC%A0%84+%ED%83%80%EC%9D%B4%EB%A8%B8',
      },
    ];
  }

  // =========================================================================
  // 6. 그 외 모든 자유 주제 (1단계 ~ 4단계 단계별 참고자료 100% 다르게 제공!)
  // =========================================================================
  if (stage === 1) {
    return [
      {
        category: '공식 문서 (필독)',
        title: `${roadmapTopic} 1단계 입문서 — 위키독스(WikiDocs) 기초 개념 & 환경 구축 교재`,
        whatToRead: `검색창에 '${roadmapTopic}'를 입력해 입문 교재의 [1장 개요 및 환경 설정]과 [${kwLabel}] 정의만 10분간 발췌독`,
        whyRecommended: '1단계 입문자가 두꺼운 책 없이 핵심 개념과 첫 실습 환경만 가장 빠르게 잡는 무료 온라인 교재',
        url:
          referenceLink && !referenceLink.includes('google.com/search')
            ? referenceLink
            : 'https://wikidocs.net/',
      },
      {
        category: '추천 학습 자료',
        title: `K-MOOC 국가평생교육진흥원 — '${roadmapTopic}' 대학 공개 기초 입문 강의`,
        whatToRead: `'${roadmapTopic}' 입문 강좌의 1~2주차 오리엔테이션 강의안 PDF와 핵심 개념 요약 클립 보기`,
        whyRecommended: '검증된 대학 교수진의 1단계 기초 개론 커리큘럼을 무료로 수강하며 큰 그림을 그릴 수 있음',
        url: 'https://www.kmooc.kr/',
      },
      {
        category: '실습 환경/도구',
        title: `Roadmap.sh — ${roadmapTopic} 전체 학습 로드맵 & 1단계 필수 선행 개념 지도`,
        whatToRead: `전체 학습 트리에서 현재 1단계(${kwLabel})가 어디에 위치하는지 확인하고 필수 기초 항목만 체크`,
        whyRecommended: '공부를 시작할 때 길을 잃지 않도록 전 세계 개발자·학습자가 표준으로 참고하는 스킬 트리',
        url: 'https://roadmap.sh/',
      },
    ];
  }

  if (stage === 2) {
    return [
      {
        category: '공식 문서 (필독)',
        title: `DevDocs / MDN — ${roadmapTopic} 2단계 핵심 문법 & 표준 API 통합 사전`,
        whatToRead: `상단 검색창에서 [${kwLabel}] 구문을 검색해 표준 문법 구조(Syntax)와 기본 예제 코드 2개만 확인`,
        whyRecommended: '2단계 핵심 문법과 필수 유형을 공부할 때 가장 정확한 공식 레퍼런스를 한곳에서 즉시 조회',
        url:
          referenceLink && !referenceLink.includes('google.com/search')
            ? referenceLink
            : 'https://devdocs.io/',
      },
      {
        category: '핵심 튜토리얼',
        title: `freeCodeCamp & GeeksforGeeks — ${roadmapTopic} 예제 중심 핵심 패턴 가이드`,
        whatToRead: `'${itemTitle}' 관련 아티클에서 단계별 동작 그림과 입출력 비교 예제만 따라 해보기`,
        whyRecommended: '이론 설명에 그치지 않고 2단계 필수 문법이 실제로 어떻게 돌아가는지 직관적인 예제로 보여줌',
        url: 'https://www.freecodecamp.org/news/',
      },
      {
        category: '실습 환경/도구',
        title: `KOCW (대학공개강의) — ${roadmapTopic} 전공 핵심 강의노트 & 연습문제 자료실`,
        whatToRead: `'${roadmapTopic}' 전공 강의의 중반부(${kwLabel}) 강의자료 PDF를 내려받아 핵심 예제 2문제 풀어보기`,
        whyRecommended: '별도 회원가입 없이 국내 주요 대학의 핵심 단원 강의노트와 연습문제를 바로 열람 가능',
        url: 'http://www.kocw.net/',
      },
    ];
  }

  if (stage === 3) {
    return [
      {
        category: '공식 문서 (필독)',
        title: `GitHub Topics & Awesome — ${roadmapTopic} 3단계 실전 미니 프로젝트 예제 저장소`,
        whatToRead: `'${roadmapTopic}' 관련 입문용 미니 프로젝트 저장소의 README 구조(요구사항 → 폴더 구조 → 실행법) 벤치마킹`,
        whyRecommended: '3단계 실전 응용 및 미니 과제를 기획·설계할 때 실제 완성된 소규모 프로젝트 구조를 바로 참고 가능',
        url:
          referenceLink && !referenceLink.includes('google.com/search')
            ? referenceLink
            : 'https://github.com/topics',
      },
      {
        category: '추천 학습 자료',
        title: `velog / Medium — '${roadmapTopic}' 실전 미니 과제 구현기 & 시행착오 아티클`,
        whatToRead: `다른 학습자·현업자가 '${roadmapTopic}' 미니 프로젝트를 만들며 겪은 3단계 설계 순서와 해결 과정 읽기`,
        whyRecommended: '교과서에 안 나오는 실전 과제 쪼개기 노하우와 막히는 구간 해결법을 가장 현실적으로 배울 수 있음',
        url: 'https://velog.io/',
      },
      {
        category: '실습 환경/도구',
        title: `StackBlitz / Google Colab — 3단계 미니 과제 즉시 구현 온라인 샌드박스`,
        whatToRead: '새 프로젝트 워크스페이스를 열고 오늘 설계한 3단계 세부 작업(입력 → 핵심 로직 → 출력)을 직접 구현하기',
        whyRecommended: '복잡한 초기 세팅 시간을 줄이고 3단계 미니 과제의 핵심 기능 구현에만 바로 집중할 수 있는 도구',
        url: 'https://stackblitz.com/',
      },
    ];
  }

  // stage === 4 (4단계: 심화 최적화, 트러블슈팅, 포트폴리오)
  return [
    {
      category: '공식 문서 (필독)',
      title: `Awesome ${roadmapTopic} — 4단계 심화 베스트 프랙티스 & 성능 최적화 레퍼런스`,
      whatToRead: `심화 아키텍처, 성능 튜닝(Optimization), 테스팅/검증 파트의 공식 권장 가이드라인 발췌독`,
      whyRecommended: '4단계에서 단순 동작 코드를 넘어 실무 수준의 안정성과 성능을 갖추기 위한 검증된 자료 모음',
      url:
        referenceLink && !referenceLink.includes('google.com/search')
          ? referenceLink
          : 'https://github.com/sindresorhus/awesome',
    },
    {
      category: '핵심 튜토리얼',
      title: `Stack Overflow & 공식 FAQ — ${roadmapTopic} 빈출 에러 해결 & 엣지 케이스 사전`,
      whatToRead: `[${kwLabel}] 관련 자주 발생하는 에러 메시지와 최고 추천(Accepted) 해결 패턴 3가지 확인`,
      whyRecommended: '4단계 심화 문제 풀이 및 예외 처리 과정에서 막히는 버그를 가장 빠르게 해결하는 지식 사전',
      url: 'https://stackoverflow.com/questions',
    },
    {
      category: '실습 환경/도구',
      title: `GitHub Gist & Notion 기술 회고록 — 4단계 학습 결과물 & 포트폴리오 정리 도구`,
      whatToRead: '1~4단계 동안 만든 코드와 트러블슈팅 기록을 [문제 정의 → 해결 방법 → 배운 점] 3단 구조로 문서화하기',
      whyRecommended: '완주한 로드맵을 언제든 다시 꺼내 쓸 수 있는 나만의 기술 자산 및 포트폴리오로 완성',
      url: 'https://gist.github.com/',
    },
  ];
}

export function generateStudyGuideContent(
  item: StudyGuideTargetItem,
  roadmapTopic = '핵심 커리큘럼',
  chapterTitle = ''
): StudyGuideContent {
  const titleLower = item.title.toLowerCase();
  const combinedLower = `${roadmapTopic} ${chapterTitle} ${item.title}`.toLowerCase();
  const stage = detectStageNumber(chapterTitle, item.title);
  const keywords =
    item.keywords && item.keywords.length > 0
      ? item.keywords
      : ['핵심 원리', '기본 문법', '실전 응용'];

  const keyConcepts = buildKeywordConcepts(keywords, item.title);
  const timeAllocation = buildDefaultTimeAllocation(item.estimatedTime);
  const recommendedResources = buildCuratedResources(
    item.title,
    roadmapTopic,
    chapterTitle,
    keywords,
    item.referenceLink
  );

  const officialDocs: StudyGuideOfficialDoc[] = recommendedResources
    .filter(
      (r): r is StudyGuideResourceItem & { url: string } => Boolean(r.url)
    )
    .map((r) => ({
      title: r.title,
      url: r.url,
      description: r.whatToRead,
    }));

  // =========================================================================
  // A. 머신러닝 & 딥러닝 단계별 맞춤 리포트 (1단계 ~ 4단계 각각 다른 가이드 & 예제 코드!)
  // =========================================================================
  if (
    combinedLower.includes('머신러닝') ||
    combinedLower.includes('딥러닝') ||
    combinedLower.includes('machine learning') ||
    combinedLower.includes('deep learning') ||
    combinedLower.includes('신경망') ||
    combinedLower.includes('pytorch') ||
    combinedLower.includes('scikit')
  ) {
    if (stage === 1) {
      return {
        startHereGuide:
          '1단계는 수식 암기가 아니라 데이터 흐름을 보는 단계입니다! 먼저 위 [1번 Google 머신러닝 단기집중과정]에서 지도/비지도학습 그림을 10분간 본 뒤, [3번 Google Colab]을 열어 아래 데이터 분할·전처리 예제 코드를 바로 실행해 보세요.',
        timeAllocation,
        recommendedResources,
        overview:
          '머신러닝의 3대 학습 방식(지도·비지도·강화학습)을 구분하고, 원본 데이터를 학습용(Train)과 평가용(Test)으로 안전하게 분리·정규화하는 1단계 기초 과정입니다.',
        whyItMatters:
          '아무리 복잡한 AI 모델도 입력 데이터의 결측치 처리와 Train/Test 분할이 잘못되면 올바른 예측을 할 수 없습니다.',
        keyConcepts,
        exampleTitle: '1단계 실습: Pandas 결측치 처리 & Train/Test 데이터 분할',
        exampleCode: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# 1. 샘플 데이터 생성 및 결측치(NaN) 평균값 채우기
df = pd.DataFrame({"study_hours": [2, 5, None, 8, 10], "pass": [0, 0, 1, 1, 1]})
df["study_hours"] = df["study_hours"].fillna(df["study_hours"].mean())

# 2. 입력 특성(X)과 정답 라벨(y) 분리 후 8:2 분할
X = df[["study_hours"]]
y = df["pass"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. 스케일링 (주의: Test 데이터에는 transform만 적용!)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
print("전처리 완료 shape:", X_train_scaled.shape)`,
        exampleExplanation: [
          '`fillna()`로 비어 있는 결측치(NaN)를 평균값으로 먼저 채워 에러를 방지합니다.',
          '`train_test_split`으로 학습용 데이터와 시험용 데이터를 분리해 과적합 여부를 검증합니다.',
          '`scaler.fit_transform()`은 Train에만 쓰고, Test에는 `scaler.transform()`만 써야 데이터 누수를 막습니다.',
        ],
        commonMistakes: [
          '전체 데이터에 먼저 StandardScaler를 적용한 뒤 train_test_split을 하면 미래 정보 누수(Data Leakage)가 발생합니다.',
          '결측치(NaN)를 그대로 둔 채 모델에 넣으면 ValueError가 발생하므로 반드시 `isnull().sum()`으로 먼저 확인하세요.',
        ],
        selfCheckQuestions: [
          {
            question: '왜 데이터를 굳이 Train과 Test로 나누어야 하나요?',
            answer:
              '학습할 때 보지 못한 새로운 데이터(Test)에서도 모델이 잘 작동하는지(일반화 성능) 공정하게 평가하기 위해서입니다.',
          },
          {
            question: '집값을 예측하는 문제와 스팸 메일을 거르는 문제는 각각 어떤 지도학습에 해당하나요?',
            answer:
              '연속된 숫자인 집값 예측은 회귀(Regression), 스팸 여부(O/X) 구분은 분류(Classification)입니다.',
          },
        ],
        officialDocs,
      };
    }

    if (stage === 2) {
      return {
        startHereGuide:
          '2단계는 핵심 머신러닝 알고리즘과 평가 지표를 손에 익히는 단계입니다! 먼저 위 [2번 MLU-Explain]에서 결정 경계 애니메이션을 5분간 조작해 본 뒤, 아래 Scikit-learn 분류 모델 학습 & F1 평가 코드를 실행해 보세요.',
        timeAllocation,
        recommendedResources,
        overview:
          'Scikit-learn의 통일된 `fit() → predict()` 인터페이스로 회귀·분류·랜덤포레스트 모델을 학습시키고, 정밀도(Precision)·재현율(Recall)·F1-Score로 성능을 정확히 검증하는 2단계 과정입니다.',
        whyItMatters:
          '딥러닝을 쓰기 전, 정형 데이터(표 데이터)에서는 랜덤포레스트와 부스팅 계열 머신러닝 모델이 훨씬 빠르고 강력한 기준점이 됩니다.',
        keyConcepts,
        exampleTitle: '2단계 실습: Scikit-learn 랜덤포레스트 분류 & F1 평가 리포트',
        exampleCode: `from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, classification_report

# 1. 유방암 진단 데이터셋 로드 및 분할
data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.2, random_state=42
)

# 2. 랜덤포레스트 모델 정의 및 학습(fit) -> 예측(predict)
model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
model.fit(X_train, y_train)
preds = model.predict(X_test)

# 3. 정확도(Accuracy)와 F1-Score 동시 확인
print(f"Accuracy: {accuracy_score(y_test, preds):.4f}")
print(f"F1-Score: {f1_score(y_test, preds):.4f}")
print(classification_report(y_test, preds))`,
        exampleExplanation: [
          'Scikit-learn의 모든 모델은 `model.fit(X_train, y_train)`으로 학습하고 `model.predict(X_test)`로 예측합니다.',
          '`max_depth=5`처럼 트리의 최대 깊이를 제한하면 학습 데이터만 외우는 과적합(Overfitting)을 줄일 수 있습니다.',
          '`classification_report`를 출력하면 클래스별 Precision, Recall, F1-Score를 한눈에 비교할 수 있습니다.',
        ],
        commonMistakes: [
          '불균형 데이터(예: 정상 99%, 불량 1%)에서 Accuracy만 보면 무조건 정상이라고 찍어도 99%가 나오므로 반드시 F1-Score를 함께 봐야 합니다.',
          '`model.fit(X_test, y_test)`처럼 테스트 데이터로 학습시키는 실수를 하지 않도록 변수명을 주의하세요.',
        ],
        selfCheckQuestions: [
          {
            question: '결정 트리(Decision Tree) 하나만 쓸 때보다 랜덤 포레스트(Random Forest)가 더 안정적인 이유는?',
            answer:
              '여러 개의 결정 트리를 만들어 다수결(앙상블)로 예측하므로 개별 트리의 과적합 위험을 크게 줄여주기 때문입니다.',
          },
          {
            question: '실제 양성(환자)을 놓치지 않고 찾아내는 비율을 뜻하는 평가 지표는 무엇인가요?',
            answer: '재현율(Recall)입니다.',
          },
        ],
        officialDocs,
      };
    }

    if (stage === 3) {
      return {
        startHereGuide:
          '3단계는 딥러닝 신경망과 실전 미니 과제를 직접 코드로 조립하는 단계입니다! 먼저 위 [1번 PyTorch 한국어 60분 블리츠]에서 신경망 학습 5단계 흐름을 10분간 확인한 뒤, 아래 PyTorch 실전 미니 과제 템플릿을 따라 실행해 보세요.',
        timeAllocation,
        recommendedResources,
        overview:
          '데이터로더(DataLoader) 설계부터 다층 신경망(`nn.Module`) 정의, 손실함수(Loss) 계산 및 역전파(`backward`) 가중치 업데이트까지 3단계 미니 과제를 처음부터 끝까지 구현하는 핵심 과정입니다.',
        whyItMatters:
          '이 3단계 학습 루프 구조 하나만 제대로 이해하면 이미지 분류(CNN), 텍스트 분석(NLP) 등 어떤 딥러닝 프로젝트든 동일한 뼈대로 확장할 수 있습니다.',
        keyConcepts,
        exampleTitle: '3단계 실습: PyTorch 신경망 미니 과제 3단 구조 (모델 · 손실함수 · 학습 루프)',
        exampleCode: `import torch
import torch.nn as nn
import torch.optim as optim

# 1. [입력 데이터] 4개 특성을 받아 이진 분류(0 또는 1)하는 미니 과제
X = torch.randn(32, 4)
y = torch.randint(0, 2, (32, 1)).float()

# 2. [모델 설계] 은닉층(ReLU) + 출력층(Sigmoid) 신경망
model = nn.Sequential(
    nn.Linear(4, 16),
    nn.ReLU(),
    nn.Linear(16, 1),
    nn.Sigmoid()
)

criterion = nn.BCELoss()
optimizer = optim.Adam(model.parameters(), lr=0.01)

# 3. [학습 루프] zero_grad -> forward -> loss -> backward -> step
for epoch in range(1, 6):
    optimizer.zero_grad()          # 기울기 초기화
    preds = model(X)               # 순전파 예측
    loss = criterion(preds, y)     # 오차(Loss) 계산
    loss.backward()                # 역전파 기울기 계산
    optimizer.step()               # 가중치 업데이트
    print(f"Epoch {epoch} | Loss: {loss.item():.4f}")`,
        exampleExplanation: [
          '`nn.Sequential`로 입력층(4) → 은닉층(16, ReLU) → 출력층(1, Sigmoid) 신경망을 직관적으로 조립합니다.',
          '매 학습 반복마다 `optimizer.zero_grad()`로 이전 기울기를 비워준 뒤 `loss.backward()`와 `optimizer.step()`을 실행합니다.',
          '에포크(Epoch)가 진행될수록 `Loss` 값이 점차 줄어드는지 확인하는 것이 3단계 실습의 핵심입니다.',
        ],
        commonMistakes: [
          '`optimizer.zero_grad()`를 빼먹으면 이전 배치의 기울기가 계속 누적되어 학습이 정상적으로 되지 않습니다.',
          '모델 평가 단계에서는 `model.eval()`과 `with torch.no_grad():`를 켜서 불필요한 메모리 사용과 Dropout 동작을 꺼야 합니다.',
        ],
        selfCheckQuestions: [
          {
            question: 'PyTorch 학습 루프에서 가중치를 업데이트하는 3줄의 핵심 메서드 순서는 무엇인가요?',
            answer:
              '`optimizer.zero_grad()` → `loss.backward()` → `optimizer.step()` 순서입니다.',
          },
          {
            question: '신경망의 은닉층(Hidden Layer)에 Sigmoid 대신 ReLU 활성화 함수를 주로 쓰는 이유는?',
            answer:
              '층이 깊어져도 양수 구간에서 기울기가 줄어들지 않아 기울기 소실(Vanishing Gradient) 문제를 막아주기 때문입니다.',
          },
        ],
        officialDocs,
      };
    }

    // stage === 4 (4단계: 심화 튜닝, 교차 검증, 포트폴리오 완주)
    return {
      startHereGuide:
        '4단계는 모델 성능을 끌어올리고 실전 프로젝트를 완성하는 단계입니다! 먼저 위 [1번 Kaggle Learn Intermediate ML]에서 교차 검증과 부스팅 파트를 살펴본 뒤, 아래 K-Fold 교차 검증 & 하이퍼파라미터 비교 코드를 실행해 보세요.',
      timeAllocation,
      recommendedResources,
      overview:
        '단일 분할 평가의 한계를 넘는 K-Fold 교차 검증과 하이퍼파라미터 튜닝을 적용하고, 베이스라인 대비 성능 개선 결과를 표로 정리해 포트폴리오를 완성하는 4단계 심화 과정입니다.',
      whyItMatters:
        '실무와 Kaggle에서는 처음 만든 모델의 점수보다 "어떤 가설로 전처리와 하이퍼파라미터를 개선해 성능을 높였는가"를 증명하는 과정이 가장 중요합니다.',
      keyConcepts,
      exampleTitle: '4단계 실습: K-Fold 교차 검증 & 하이퍼파라미터 튜닝 비교 실험',
      exampleCode: `from sklearn.datasets import load_wine
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import StratifiedKFold, GridSearchCV

# 1. 데이터 로드 및 5-Fold 층화 교차 검증 설정
X, y = load_wine(return_X_y=True)
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# 2. 탐색할 하이퍼파라미터 후보군 정의
param_grid = {
    "n_estimators": [50, 100],
    "learning_rate": [0.05, 0.1],
    "max_depth": [3, 5],
}

# 3. 교차 검증 기반 최적 파라미터 탐색
grid = GridSearchCV(GradientBoostingClassifier(random_state=42), param_grid, cv=cv, scoring="f1_macro")
grid.fit(X, y)

print("최적 하이퍼파라미터:", grid.best_params_)
print(f"5-Fold 평균 F1 점수: {grid.best_score_:.4f}")`,
      exampleExplanation: [
        '`StratifiedKFold(n_splits=5)`는 클래스 비율을 유지하며 데이터를 5등분해 5번 교차 검증한 평균 점수를 구합니다.',
        '`GridSearchCV`를 통해 학습률(`learning_rate`)과 트리 깊이(`max_depth`) 조합 중 가장 일반화 성능이 높은 설정을 자동으로 찾습니다.',
        '튜닝 전 베이스라인 점수와 `grid.best_score_`를 비교해 내 노트에 기록하면 훌륭한 실험 리포트가 됩니다.',
      ],
      commonMistakes: [
        'Test 데이터셋의 점수를 보면서 하이퍼파라미터를 수십 번 고치면 Test 셋 자체에 과적합되므로 반드시 교차 검증(CV) 점수를 기준으로 튜닝하세요.',
        '학습률(`learning_rate`)만 낮추고 트리 개수(`n_estimators`)를 그대로 두면 오히려 과소적합(Underfitting)이 될 수 있습니다.',
      ],
      selfCheckQuestions: [
        {
          question: '단 한 번의 train_test_split 대신 5-Fold 교차 검증을 사용하는 이유는 무엇인가요?',
          answer:
            '우연히 쉬운 데이터만 Test에 뽑혀 점수가 부풀려지는 현상을 막고, 모델의 평균적인 일반화 성능을 신뢰성 있게 측정하기 위해서입니다.',
        },
        {
          question: '모델의 Train 점수는 99%인데 Validation 점수가 72%라면 어떤 조치를 취해야 하나요?',
          answer:
            '과적합(Overfitting) 상태이므로 모델 복잡도(`max_depth`)를 낮추거나 정규화(Dropout, Weight Decay) 및 데이터 증강을 적용해야 합니다.',
        },
      ],
      officialDocs,
    };
  }

  // =========================================================================
  // B. Python Specific Concise Reports
  // =========================================================================
  if (titleLower.includes('venv') || titleLower.includes('가상환경')) {
    return {
      startHereGuide:
        '복잡한 이론은 건너뛰세요! 바로 위 [1번 Python 공식 자습서]의 명령어 예시를 5분간 훑어본 뒤, VS Code 터미널에 아래 [실전 예제] 명령어 3줄을 그대로 복사해 실행해 보시면 끝납니다.',
      timeAllocation,
      recommendedResources,
      overview:
        '프로젝트마다 독립된 패키지 폴더(.venv)를 만들어, 서로 다른 프로젝트의 라이브러리 버전이 충돌하지 않게 보호하는 필수 초기 설정입니다.',
      whyItMatters:
        '실무에서는 새 프로젝트를 시작할 때 무조건 .venv 가상환경부터 만들고 시작합니다.',
      keyConcepts,
      exampleTitle: '터미널 명령어 & 첫 파이썬 파일 실행 예제',
      exampleCode: `# 1. 파이썬 설치 버전 확인
python --version

# 2. '.venv' 가상환경 폴더 생성
python -m venv .venv

# 3. 가상환경 켜기 (Windows / Mac)
.venv\\Scripts\\Activate.ps1   # Mac: source .venv/bin/activate

# 4. hello.py 작성 후 실행
print("Hello LearnPulse! 가상환경 설정 완료")`,
      exampleExplanation: [
        '`python -m venv .venv`: 현재 폴더 안에 독립된 `.venv` 가상환경을 만듭니다.',
        '가상환경이 켜지면 터미널 입력줄 맨 앞에 `(.venv)` 표시가 나타납니다.',
        '`python hello.py`를 실행해 문장이 정상 출력되면 성공입니다.',
      ],
      commonMistakes: [
        'Windows 파이썬 설치 시 "Add python.exe to PATH" 체크를 빼먹으면 명령어가 실행되지 않습니다.',
        'PowerShell 보안 오류가 뜨면 `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`를 입력해 해결하세요.',
      ],
      selfCheckQuestions: [
        {
          question: '왜 프로젝트마다 가상환경(.venv)을 따로 만들어야 하나요?',
          answer:
            '프로젝트별로 필요한 패키지 버전이 달라 서로 충돌하는 문제를 막기 위해서입니다.',
        },
        {
          question: '터미널에서 가상환경이 켜져 있는지 어떻게 확인하나요?',
          answer: '터미널 입력줄 맨 앞에 `(.venv)` 표시가 떠 있는지 보면 됩니다.',
        },
      ],
      officialDocs,
    };
  }

  if (
    titleLower.includes('슬라이싱') ||
    titleLower.includes('문자열') ||
    titleLower.includes('f-string')
  ) {
    return {
      startHereGuide:
        '먼저 위 [1번 파이썬 공식 자습서]에서 "문자열 인덱스 격자 그림"만 5분간 확인하세요. 그다음 아래 [실전 예제] 코드를 복사해 숫자 범위를 바꿔가며 실행해 보면 바로 이해됩니다.',
      timeAllocation,
      recommendedResources,
      overview:
        '문자열에서 위치 번호(0번~)로 원하는 구간만 잘라내고(슬라이싱), f-string으로 변수 값을 문장 안에 깔끔하게 끼워 넣는 핵심 문법입니다.',
      whyItMatters:
        '날짜("2026-11-11") 분리, 이메일 파싱, 공백 제거 등 모든 실무 데이터 전처리에 매일 쓰입니다.',
      keyConcepts,
      exampleTitle: '문자열 슬라이싱 · f-string 핵심 예제',
      exampleCode: `date = "2026-11-11"

# 1. 슬라이싱 [시작:끝] -> 끝 번호 직전까지만 잘림!
year = date[0:4]   # "2026"
month = date[5:7]  # "11"

# 2. f-string으로 변수 넣기
print(f"연도: {year}년, 월: {month}월")

# 3. 공백 제거(strip) 후 쪼개기(split)
tags = "  python, react, sql  ".strip().split(", ")
print(tags)  # ['python', 'react', 'sql']`,
      exampleExplanation: [
        '`date[0:4]`는 0번부터 4번 직전(3번) 글자까지만 잘라냅니다.',
        '`f"..."` 안의 `{변수}` 자리에 실제 값이 자동으로 들어갑니다.',
        '`.strip()`은 양끝 공백을 지우고, `.split()`은 기준 문자로 쪼개 리스트로 만듭니다.',
      ],
      commonMistakes: [
        '슬라이싱 `[a:b]`에서 `b`번째 글자는 포함되지 않고 `b-1`번째까지만 잘립니다!',
        '문자열은 직접 수정(`date[0] = "1"`)할 수 없으므로 `.replace()`를 써야 합니다.',
      ],
      selfCheckQuestions: [
        {
          question: '`word = "PYTHON"`일 때 `word[1:4]`의 결과는 무엇인가요?',
          answer: '1번("Y")부터 4번 직전인 3번("H")까지 잘라낸 `"YTH"`입니다.',
        },
        {
          question: '문자열 양끝의 공백을 한 번에 없애는 메서드는 무엇인가요?',
          answer: '`.strip()` 메서드를 사용하면 됩니다.',
        },
      ],
      officialDocs,
    };
  }

  if (
    titleLower.includes('리스트') ||
    titleLower.includes('딕셔너리') ||
    titleLower.includes('컬렉션')
  ) {
    return {
      startHereGuide:
        '먼저 위 [2번 점프 투 파이썬]에서 리스트와 딕셔너리 그림 설명을 10분간 읽으세요. 그 후 [3번 Python Tutor]에 아래 예제 코드를 넣고 실행해 보시면 한눈에 이해됩니다.',
      timeAllocation,
      recommendedResources,
      overview:
        '순서대로 줄 세워 담는 리스트(`[]`)와 이름표(Key: Value)로 빠르게 찾는 딕셔너리(`{}`)를 다루는 방법입니다.',
      whyItMatters:
        '모든 웹 API와 JSON 데이터는 "리스트 안의 딕셔너리" 구조로 되어 있어 가장 중요한 기초입니다.',
      keyConcepts,
      exampleTitle: '리스트(List) & 딕셔너리(Dict) 핵심 예제',
      exampleCode: `# 1. 리스트(List): 순서대로 보관
todos = ["환경 구축", "문자열 실습"]
todos.append("자료구조 마스터")  # 맨 뒤에 추가

# 2. 딕셔너리(Dict): 이름표(Key)와 값(Value)
user = {"name": "김런펄스", "done": 3}

# .get()으로 에러 없이 안전하게 조회
score = user.get("score", 0)
print(f"{user['name']}님 완료: {user['done']}개 (점수: {score})")`,
      exampleExplanation: [
        '리스트(`[]`)는 `.append()`로 추가하고 번호(`todos[0]`)로 꺼냅니다.',
        '딕셔너리(`{}`)는 이름표(`user["name"]`)로 값을 즉시 찾습니다.',
        '`user.get("없는키", 0)`을 쓰면 키가 없어도 에러 없이 기본값 `0`을 돌려줍니다.',
      ],
      commonMistakes: [
        '딕셔너리에 없는 키를 `user["age"]`로 바로 찾으면 `KeyError`로 프로그램이 멈춥니다.',
        '`todos = todos.append(...)`처럼 변수에 다시 담으면 `None`이 되니 주의하세요.',
      ],
      selfCheckQuestions: [
        {
          question: '순서가 있는 할 일 목록을 담을 때는 리스트와 딕셔너리 중 무엇을 쓰나요?',
          answer: '순서(인덱스)가 유지되는 리스트(`[]`)를 사용합니다.',
        },
        {
          question: '딕셔너리에서 키가 없을 때도 에러 없이 기본값을 받는 메서드는?',
          answer: '`.get("키", 기본값)` 메서드입니다.',
        },
      ],
      officialDocs,
    };
  }

  // =========================================================================
  // C. React / TypeScript Concise Reports
  // =========================================================================
  if (
    titleLower.includes('usestate') ||
    titleLower.includes('props') ||
    titleLower.includes('useeffect') ||
    titleLower.includes('jsx') ||
    titleLower.includes('zustand') ||
    titleLower.includes('query')
  ) {
    return {
      startHereGuide:
        '가장 먼저 위 [1번 공식 문서]를 열어 상단 요약 박스와 첫 번째 인터랙티브 예제만 10분간 조작해 보세요. 그다음 아래 [실전 예제 코드]를 직접 따라 쳐보시면 됩니다.',
      timeAllocation,
      recommendedResources,
      overview:
        '전달받은 데이터(Props)와 내부 상태(State)를 기반으로 화면(JSX)을 자동으로 다시 그려주는 모던 React의 핵심 원리입니다.',
      whyItMatters:
        'DOM을 직접 건드리지 않고 State만 바꾸면 화면이 안전하게 동기화되어 유지보수가 쉬워집니다.',
      keyConcepts,
      exampleTitle: 'React + TypeScript 핵심 컴포넌트 예제',
      exampleCode: `import React, { useState } from 'react';

interface CardProps {
  title: string;
}

export const StudyCard: React.FC<CardProps> = ({ title }) => {
  const [isDone, setIsDone] = useState<boolean>(false);

  return (
    <button onClick={() => setIsDone((prev) => !prev)}>
      {title} - {isDone ? '완료됨 ✓' : '진행 전'}
    </button>
  );
};`,
      exampleExplanation: [
        '`interface CardProps`: 부모로부터 받을 Props의 타입을 지정합니다.',
        '`useState`: 상태 값(`isDone`)과 변경 함수(`setIsDone`)를 생성합니다.',
        '`setIsDone`이 호출되면 컴포넌트가 새로운 상태로 화면을 다시 그립니다.',
      ],
      commonMistakes: [
        '배열 상태를 바꿀 때 `push()` 대신 `[...prev, newItem]`으로 새 배열을 만들어야 화면이 갱신됩니다.',
        '`.map()` 렌더링 시 `key`에는 배열 인덱스 대신 고유 ID를 넣어야 합니다.',
      ],
      selfCheckQuestions: [
        {
          question: '일반 변수 대신 `useState`를 써야 하는 이유는 무엇인가요?',
          answer: '상태 변경 함수를 호출해야만 React가 변경을 감지하고 화면을 다시 그리기 때문입니다.',
        },
        {
          question: '부모 컴포넌트가 자식에게 데이터를 전달할 때 사용하는 속성은?',
          answer: '`Props`입니다.',
        },
      ],
      officialDocs,
    };
  }

  // =========================================================================
  // D. SQL / Database Concise Reports
  // =========================================================================
  if (
    titleLower.includes('sql') ||
    titleLower.includes('select') ||
    titleLower.includes('join') ||
    titleLower.includes('group by') ||
    titleLower.includes('window') ||
    titleLower.includes('null') ||
    titleLower.includes('index') ||
    titleLower.includes('explain')
  ) {
    return {
      startHereGuide:
        '먼저 위 [1번 추천 자료]를 열고 해당 단원의 짧은 표 설명을 읽은 뒤, 웹 화면에서 바로 쿼리 2~3문제를 직접 쳐보며 시작하세요. 설치 없이 10분 만에 감을 잡을 수 있습니다.',
      timeAllocation,
      recommendedResources,
      overview:
        '데이터베이스 테이블에서 원하는 조건으로 행을 필터링·결합·집계하여 정확한 지표를 추출하는 핵심 SQL 문법입니다.',
      whyItMatters:
        '정확한 JOIN과 NULL 처리 규칙을 알아야 매출이나 유저 수 집계 왜곡을 막을 수 있습니다.',
      keyConcepts,
      exampleTitle: '실무 표준 SQL 집계 & 순위 쿼리 예제',
      exampleCode: `SELECT
    category,
    COUNT(DISTINCT user_id) AS unique_buyers,
    SUM(COALESCE(amount, 0)) AS total_sales,
    RANK() OVER (ORDER BY SUM(amount) DESC) AS sales_rank
FROM orders
WHERE status = 'COMPLETED'
GROUP BY category
HAVING SUM(amount) >= 50000;`,
      exampleExplanation: [
        '`COALESCE(amount, 0)`: 금액이 `NULL`일 때 `0`으로 치환해 계산 오류를 막습니다.',
        '`COUNT(DISTINCT user_id)`: 중복을 제외한 순수 구매자 수를 집계합니다.',
        '`HAVING`: `GROUP BY`로 묶인 그룹 결과 중 매출 5만 이상만 필터링합니다.',
      ],
      commonMistakes: [
        '`= NULL`은 동작하지 않으므로 반드시 `IS NULL` 또는 `IS NOT NULL`을 써야 합니다.',
        '`1:N` 조인 후 바로 `SUM()`을 구하면 금액이 중복 합산되니 주의하세요.',
      ],
      selfCheckQuestions: [
        {
          question: '`WHERE`와 `HAVING`의 차이는 무엇인가요?',
          answer: '`WHERE`는 그룹화 전 개별 행을 걸러내고, `HAVING`은 `GROUP BY` 집계 후 결과를 걸러냅니다.',
        },
        {
          question: '주문 이력이 없는 회원까지 모두 남기려면 어떤 JOIN을 써야 하나요?',
          answer: '`LEFT JOIN`을 사용해야 합니다.',
        },
      ],
      officialDocs,
    };
  }

  // =========================================================================
  // E. Stage-Differentiated Concise Report for Any Custom Topic (1~4단계별 분리)
  // =========================================================================
  const subStepList =
    item.subTasks && item.subTasks.length > 0
      ? item.subTasks
      : [
          `Step 1 (개념 이해): ${item.title}의 핵심 정의 파악하기`,
          `Step 2 (직접 실습): 기본 예제를 따라 하며 동작 원리 확인하기`,
          `Step 3 (셀프 점검): 핵심 키워드를 내 언어로 3줄 요약하기`,
        ];

  const stageGuideMap: Record<StageNumber, string> = {
    1: `1단계(기초 입문)입니다! 먼저 위 [1번 ${recommendedResources[0]?.title ?? '기초 입문서'}] 우측 '이 자료 바로 열기' 버튼을 눌러 개요를 10분간 읽은 뒤, 아래 3단계 기초 체크리스트를 순서대로 따라 해보세요.`,
    2: `2단계(핵심 문법·유형)입니다! 먼저 위 [1번 ${recommendedResources[0]?.title ?? '핵심 레퍼런스'}]에서 '${keywords[0] ?? item.title}'의 기본 예제만 확인한 뒤, 직접 값을 바꿔가며 2단계 응용 실습을 진행하세요.`,
    3: `3단계(실전 응용·미니 과제)입니다! 먼저 위 [1번 ${recommendedResources[0]?.title ?? '실전 프로젝트 가이드'}]의 샘플 구조를 참고해 작은 기능 단위로 쪼갠 뒤, 아래 3단계 구현 순서에 맞춰 하나씩 완성해 보세요.`,
    4: `4단계(심화·최적화·완주)입니다! 위 [1번 ${recommendedResources[0]?.title ?? '심화 가이드'}]를 참고해 지금까지 만든 결과물의 예외 케이스를 점검하고, 최종 요약 노트를 정리해 로드맵을 완주하세요.`,
  };

  return {
    startHereGuide: stageGuideMap[stage],
    timeAllocation,
    recommendedResources,
    overview:
      item.description && item.description.trim().length > 0
        ? item.description
        : `'${roadmapTopic}'의 ${stage}단계 핵심 과정으로, '${item.title}'의 원리와 실전 적용법을 익히는 단원입니다.`,
    whyItMatters:
      stage === 1
        ? '1단계에서 핵심 용어의 정의와 기초 환경을 정확히 잡아두면 2~3단계 실습 속도가 2배 빨라집니다.'
        : stage === 2
          ? '2단계 핵심 패턴을 손으로 직접 쳐보며 익혀야 3단계 실전 과제를 스스로 설계할 수 있습니다.'
          : stage === 3
            ? '배운 개념을 조합해 작은 실전 과제를 끝까지 완성해 보는 경험이 진짜 실력을 만듭니다.'
            : '마지막 4단계에서 예외 처리와 성능 개선 포인트까지 점검하면 실무·포트폴리오 수준으로 도약할 수 있습니다.',
    keyConcepts,
    exampleTitle: `${stage}단계 실습 가이드 — ${item.title}`,
    exampleCode: `[${stage}단계 단원] ${item.title}
[핵심 키워드] ${keywords.join(' · ')}

1. ${subStepList[0] ?? '핵심 개념 읽기'}
2. ${subStepList[1] ?? '기본 예제 실습하기'}
3. ${subStepList[2] ?? '핵심 내용 3줄 요약하기'}`,
    exampleExplanation: [
      `위 [01 · 필독 참고자료]에서 ${stage}단계 맞춤 교재를 열고 핵심 키워드(${keywords.slice(0, 3).join(', ')}) 파트를 먼저 확인합니다.`,
      '위 3단계 실습 순서대로 하나씩 직접 따라 하며 체크박스를 완료합니다.',
      '하단 노트장에 오늘 배운 핵심을 3줄로 요약해 기록합니다.',
    ],
    commonMistakes: [
      '처음부터 모든 세부 내용을 다 외우려 하지 말고 오늘 단원의 핵심 키워드 3가지부터 정확히 잡으세요.',
      '눈으로만 읽지 말고 작은 예제라도 직접 손으로 따라 해보는 것이 가장 빠릅니다.',
    ],
    selfCheckQuestions: [
      {
        question: `이번 ${stage}단계 단원의 가장 중요한 핵심 키워드(${keywords[0] ?? '핵심 개념'})는 무엇인가요?`,
        answer:
          keyConcepts[0]?.definition ??
          `'${item.title}'의 핵심 목적을 달성하기 위한 필수 개념입니다.`,
      },
      {
        question: '가장 먼저 시작해야 할 첫 번째 학습 단계(Step 1)는 무엇인가요?',
        answer: subStepList[0],
      },
    ],
    officialDocs,
  };
}
