import {
  AIRoadmapSchema,
  type AIRoadmapGenerationInput,
  type AIRoadmapResult,
  type UserLevel,
} from '@/types';

const LEVEL_KR: Record<UserLevel, string> = {
  BEGINNER: '입문',
  INTERMEDIATE: '중급 실전',
  ADVANCED: '심화 마스터',
};

export function generateMockRoadmap(input: AIRoadmapGenerationInput): AIRoadmapResult {
  const cleanTopic = input.topic.trim() || '소프트웨어 엔지니어링';
  const lower = cleanTopic.toLowerCase();
  const levelLabel = LEVEL_KR[input.level];

  // 1. Machine Learning / Deep Learning / AI
  if (
    lower.includes('머신러닝') ||
    lower.includes('딥러닝') ||
    lower.includes('machine learning') ||
    lower.includes('deep learning') ||
    lower.includes('인공지능') ||
    lower.includes('llm') ||
    lower.includes('ai')
  ) {
    return AIRoadmapSchema.parse({
      title: `${cleanTopic} ${levelLabel} 세분화 로드맵 (${input.targetDuration})`,
      topic: cleanTopic,
      targetDuration: input.targetDuration,
      summary: `수학 공식 암기에서 벗어나 데이터 전처리(Pandas) → 전통 머신러닝(Scikit-learn) → 딥러닝 신경망(PyTorch) → 실전 캐글(Kaggle) 미니 프로젝트까지 단계별 다른 실습 자료로 완주하는 ${input.targetDuration} 과정입니다.`,
      chapters: [
        {
          title: '1단계: 머신러닝 기초 개념(지도·비지도학습)과 데이터 전처리',
          description: '모델을 만들기 전 데이터를 불러오고 결측치를 처리하며 학습용(Train)과 검증용(Test) 데이터를 나누는 기초를 다집니다.',
          items: [
            {
              title: '지도학습(회귀·분류) vs 비지도학습(군집화) 핵심 개념 구분하기',
              description: '정답(Label)이 있는 데이터를 예측하는 지도학습과 패턴을 스스로 찾는 비지도학습의 차이를 실제 사례로 이해합니다.',
              estimatedTime: '40분',
              keywords: ['지도학습(Supervised)', '회귀(Regression) vs 분류(Classification)', '특성(Feature)과 정답(Label)'],
              subTasks: [
                'Step 1 (개념 구분): 집값 예측(연속형 숫자 = 회귀)과 스팸 메일 판별(O/X 범주 = 분류)의 차이점 정리하기',
                'Step 2 (용어 매칭): 입력 데이터 X(Feature, 독립변수)와 맞춰야 할 정답 y(Label, 타겟) 구분하기',
                'Step 3 (사례 찾기): 유튜브 추천 알고리즘과 고객 등급 분류가 각각 어떤 학습 방식인지 연결해 보기',
              ],
              referenceLink: 'https://developers.google.com/machine-learning/crash-course?hl=ko',
            },
            {
              title: 'Google Colab 환경 세팅 및 Pandas로 CSV 데이터셋 탐색(EDA)',
              description: '내 컴퓨터에 복잡한 설치 없이 무료 GPU를 제공하는 Colab에서 표 데이터(DataFrame)를 불러와 요약 통계를 확인합니다.',
              estimatedTime: '50분',
              keywords: ['Google Colab', 'pandas.read_csv()', 'df.head() / df.info()', '결측치(fillna)'],
              subTasks: [
                'Step 1 (데이터 로드): Colab 노트북을 열고 pandas로 타이타닉 샘플 CSV 파일을 불러와 df.head()로 첫 5줄 보기',
                'Step 2 (결측치 점검): df.isnull().sum()으로 비어 있는 데이터 개수를 확인하고 평균값(fillna)으로 채우기',
                'Step 3 (분포 확인): df.describe()로 수치형 데이터의 평균·최솟값·최댓값 이상치 유무 점검하기',
              ],
              referenceLink: 'https://colab.research.google.com/',
            },
            {
              title: '학습용(Train) / 테스트용(Test) 데이터 분리와 스케일링( 정규화)',
              description: '모의고사 문제(Train)와 수능 시험지(Test)를 분리하듯 과적합을 막기 위해 데이터를 나누고 숫자 단위를 맞춥니다.',
              estimatedTime: '45분',
              keywords: ['train_test_split', '과적합(Overfitting)', 'StandardScaler', 'Data Leakage 방지'],
              subTasks: [
                'Step 1 (데이터 분할): sklearn의 train_test_split으로 전체 데이터를 80%(학습) : 20%(평가) 비율로 나누기',
                'Step 2 (스케일링 실습): 키(cm)와 연봉(만원)처럼 단위 차이가 큰 변수를 StandardScaler로 평균 0, 분산 1로 맞추기',
                'Step 3 (주의사항 점검): Test 데이터에는 절대로 fit()을 쓰지 않고 transform()만 적용해야 하는 이유 이해하기',
              ],
              referenceLink: 'https://scikit-learn.org/stable/modules/preprocessing.html',
            },
          ],
        },
        {
          title: '2단계: Scikit-learn 핵심 머신러닝 알고리즘(회귀·분류·앙상블) 구현',
          description: '현업 정형 데이터 분석에서 가장 강력한 성능을 내는 핵심 머신러닝 모델들을 직접 코드로 학습시키고 정확도를 평가합니다.',
          items: [
            {
              title: '선형 회귀(Linear Regression)와 오차 지표(MSE, RMSE, R²) 실습',
              description: '데이터의 추세선을 그어 연속된 숫자(가격, 매출, 온도)를 예측하고 예측 오차가 얼마나 작은지 측정합니다.',
              estimatedTime: '50분',
              keywords: ['LinearRegression', '경사하강법(Gradient Descent)', 'MSE / RMSE 오차', 'fit() & predict()'],
              subTasks: [
                'Step 1 (원리 이해): 가중치(Weight)와 절편(Bias)을 조절해 실제값과 예측값의 차이(오차 제곱합)를 줄이는 원리 보기',
                'Step 2 (코드 3줄 공식): model.fit(X_train, y_train)으로 학습 후 model.predict(X_test)로 예측값 뽑아보기',
                'Step 3 (성능 평가): mean_squared_error 함수로 RMSE 오차를 계산하고 결정계수(R²)가 1에 가까운지 확인하기',
              ],
              referenceLink: 'https://scikit-learn.org/stable/modules/linear_model.html',
            },
            {
              title: '의사결정나무(Decision Tree)와 랜덤 포레스트(Random Forest) 분류기',
              description: '스무고개 질문처럼 조건을 분기하는 트리와, 여러 트리의 투표를 합쳐 성능을 높이는 앙상블 기법을 익힙니다.',
              estimatedTime: '55분',
              keywords: ['DecisionTreeClassifier', 'RandomForest', '배깅(Bagging) 앙상블', 'feature_importances_'],
              subTasks: [
                'Step 1 (단일 트리 한계): 의사결정나무의 max_depth를 제한하지 않았을 때 학습 데이터만 달달 외우는 과적합 확인하기',
                'Step 2 (랜덤 포레스트 적용): 100개의 트리가 다수결로 예측하는 RandomForestClassifier로 정확도 향상 비교하기',
                'Step 3 (중요 변수 추출): feature_importances_ 속성으로 예측에 가장 큰 영향을 준 핵심 변수 Top 3 시각화하기',
              ],
              referenceLink: 'https://scikit-learn.org/stable/modules/ensemble.html',
            },
            {
              title: '분류 모델 평가 지표: 혼동 행렬(Confusion Matrix)과 정밀도·재현율·F1',
              description: '단순 정확도(Accuracy)의 함정을 피하고 암 진단·불량 탐지에서 핵심이 되는 Precision, Recall, ROC-AUC를 해석합니다.',
              estimatedTime: '50분',
              keywords: ['Confusion Matrix', '정밀도(Precision)', '재현율(Recall)', 'F1-Score'],
              subTasks: [
                'Step 1 (정확도 함정): 정상 99%, 불량 1%인 데이터에서 무조건 정상이라고만 찍어도 정확도가 99%가 되는 문제 이해하기',
                'Step 2 (지표 구분): 스팸 메일 필터(정밀도 중요)와 암 환자 진단(재현율 중요)에서 어떤 지표를 봐야 하는지 구분하기',
                'Step 3 (리포트 출력): classification_report 함수로 Precision, Recall, F1-Score를 한눈에 출력해 해석하기',
              ],
              referenceLink: 'https://scikit-learn.org/stable/modules/model_evaluation.html',
            },
          ],
        },
        {
          title: '3단계: 딥러닝 인공신경망 기초와 PyTorch 모델링 입문',
          description: '인공신경망이 어떻게 층(Layer)을 쌓아 복잡한 이미지·텍스트 패턴을 학습하는지 이해하고 PyTorch로 첫 신경망을 구현합니다.',
          items: [
            {
              title: '퍼셉트론, 활성화 함수(ReLU, Sigmoid)와 역전파(Backpropagation) 원리',
              description: '딥러닝 신경망의 기본 세포인 뉴런의 계산 과정과 오차를 뒤로 전달해 가중치를 수정하는 학습 메커니즘을 이해합니다.',
              estimatedTime: '50분',
              keywords: ['다층 퍼셉트론(MLP)', '활성화 함수(ReLU)', '손실 함수(Loss Function)', '역전파(Backprop)'],
              subTasks: [
                'Step 1 (시뮬레이터 실험): TensorFlow Playground 웹 도구에서 은닉층(Hidden Layer)과 뉴런 수를 늘리며 분류 경계선 관찰하기',
                'Step 2 (활성화 함수 비교): 깊은 신경망에서 기울기 소실(Vanishing Gradient)을 막기 위해 Sigmoid 대신 ReLU를 쓰는 이유 파악하기',
                'Step 3 (학습 사이클 정리): [순전파(예측) → Loss(오차 계산) → 역전파(기울기 계산) → Optimizer(가중치 갱신)] 4단계 흐름 적기',
              ],
              referenceLink: 'https://playground.tensorflow.org/',
            },
            {
              title: 'PyTorch 텐서(Tensor) 연산과 nn.Module 신경망 클래스 설계',
              description: 'GPU 연산을 지원하는 Tensor 자료형을 다루고 PyTorch 표준 방식인 nn.Module을 상속받아 신경망 층을 조립합니다.',
              estimatedTime: '60분',
              keywords: ['torch.Tensor', 'nn.Module', 'nn.Linear', 'forward() 메서드'],
              subTasks: [
                'Step 1 (텐서 변환): NumPy 배열을 torch.tensor()로 변환하고 .shape으로 차원(행·열 크기) 확인하기',
                'Step 2 (신경망 조립): nn.Linear(입력차원, 출력차원)과 nn.ReLU()를 쌓아 3층 신경망 클래스 작성하기',
                'Step 3 (학습 루프 3줄): optimizer.zero_grad() → loss.backward() → optimizer.step() 표준 학습 루프 완성하기',
              ],
              referenceLink: 'https://tutorials.pytorch.kr/beginner/basics/intro.html',
            },
            {
              title: '합성곱 신경망(CNN) 이미지 분류 & 전이학습(Transfer Learning) 실습',
              description: '이미지 특징을 추출하는 CNN 구조를 이해하고, 이미 대규모 데이터로 학습된 모델을 가져와 내 데이터에 맞게 미세조정(Fine-tuning)합니다.',
              estimatedTime: '60분',
              keywords: ['MNIST / CIFAR-10', 'Conv2d & MaxPool2d', '전이학습(Pre-trained Model)', '과적합 방지(Dropout)'],
              subTasks: [
                'Step 1 (CNN 핵심): 이미지를 1줄로 펴지 않고 가로·세로 공간 특징(모서리, 질감)을 그대로 추출하는 필터(Kernel) 역할 이해하기',
                'Step 2 (손글씨 분류): MNIST 숫자 손글씨 데이터셋을 불러와 10개 숫자(0~9)를 98% 이상 정확도로 분류하기',
                'Step 3 (전이학습 활용): torchvision의 사전학습된 ResNet 모델을 불러와 마지막 분류 층만 내 문제에 맞게 교체해 보기',
              ],
              referenceLink: 'https://tutorials.pytorch.kr/beginner/transfer_learning_tutorial.html',
            },
          ],
        },
        {
          title: '4단계: 실전 Kaggle 미니 프로젝트 완주 & 모델 성능 튜닝',
          description: '실제 공개 데이터셋으로 처음부터 끝까지 파이프라인을 구축하고 하이퍼파라미터를 튜닝하여 포트폴리오 노트북을 완성합니다.',
          items: [
            {
              title: '실전 미니 프로젝트 기획 및 데이터 파이프라인(전처리→학습→평가) 설계',
              description: '해결할 문제(예: 고객 이탈 예측, 주택 가격 예측, 이미지 분류)를 정의하고 베이스라인 모델부터 빠르게 구축합니다.',
              estimatedTime: '55분',
              keywords: ['Kaggle 데이터셋 선정', 'Baseline 모델 구축', '파생변수(Feature Engineering)', '교차 검증(K-Fold)'],
              subTasks: [
                'Step 1 (문제 및 지표 선정): Kaggle 또는 공공데이터포털에서 관심 있는 데이터셋 1개를 고르고 목표 평가지표(F1 또는 RMSE) 정하기',
                'Step 2 (베이스라인 완성): 복잡한 튜닝 없이 가장 단순한 모델(RandomForest 또는 기본 MLP)로 첫 번째 기준 점수 먼저 뽑기',
                'Step 3 (K-Fold 교차 검증): 데이터를 5개 폴드로 나누어 평가하는 KFold 검증으로 점수 흔들림 방지하기',
              ],
              referenceLink: 'https://www.kaggle.com/learn',
            },
            {
              title: '부스팅 모델(XGBoost · LightGBM) 적용 및 하이퍼파라미터 튜닝',
              description: '캐글 대회와 실무 정형 데이터 분석에서 가장 높은 성능을 내는 부스팅 모델을 적용하고 최적의 설정값을 찾습니다.',
              estimatedTime: '60분',
              keywords: ['LightGBM / XGBoost', '학습률(learning_rate)', 'Optuna / GridSearchCV', 'Early Stopping'],
              subTasks: [
                'Step 1 (부스팅 비교): 이전 트리의 오차를 다음 트리가 집중 보완하는 Gradient Boosting 원리 이해하기',
                'Step 2 (Early Stopping): 검증 데이터 오차가 더 이상 줄어들지 않으면 학습을 자동 멈추는 조기 종료 설정하기',
                'Step 3 (성능 비교표 작성): 기본 모델 vs 랜덤 포레스트 vs LightGBM의 성능 점수를 비교표로 정리하기',
              ],
              referenceLink: 'https://lightgbm.readthedocs.io/',
            },
            {
              title: '모델 예측 결과 시각화 및 GitHub · Markdown 분석 리포트 발행',
              description: '단순히 코드만 남기지 않고, 문제 정의부터 데이터 인사이트, 성능 개선 과정을 누구나 읽기 쉬운 분석 보고서로 정리합니다.',
              estimatedTime: '45분',
              keywords: ['성능 개선 그래프', '오분류 샘플 분석', 'Markdown 분석 보고서', '포트폴리오 아카이빙'],
              subTasks: [
                'Step 1 (오답 분석): 모델이 가장 크게 틀린 샘플 5개를 뽑아 왜 틀렸는지(노이즈, 이상치) 원인 코멘트 달기',
                'Step 2 (결과 요약): [문제 정의 → 전처리 핵심 → 모델별 점수 변화 → 결론] 4단 구조로 마크다운 요약 작성하기',
                'Step 3 (리포트 내보내기): 상단 ".md 다운로드" 버튼으로 전체 학습 기록과 메모를 저장해 포트폴리오에 보관하기',
              ],
            },
          ],
        },
      ],
    });
  }

  // 2. React / Frontend
  if (lower.includes('react') || lower.includes('리액트') || lower.includes('프론트엔드')) {
    return AIRoadmapSchema.parse({
      title: `${cleanTopic} ${levelLabel} 세분화 로드맵 (${input.targetDuration})`,
      topic: cleanTopic,
      targetDuration: input.targetDuration,
      summary: `막막한 큰 덩어리 학습이 아니라, 하루 40~60분 단위로 쪼개진 '개념 이해 → 미니 실습 → 셀프 점검' 3단계 마이크로 체크리스트를 따라가며 ${input.targetDuration} 만에 완성하는 ${levelLabel} 과정입니다.`,
      chapters: [
        {
          title: '1단계: 모던 TypeScript & JSX 컴포넌트 기초 다지기',
          description: '화면을 작은 레고 블록(컴포넌트) 단위로 쪼개어 설계하고 Props와 타입으로 안전하게 데이터를 전달하는 방법을 익힙니다.',
          items: [
            {
              title: 'Vite 프로젝트 구조 파악 및 첫 함수형 컴포넌트 렌더링',
              description: 'index.html에서 main.tsx를 거쳐 App.tsx가 브라우저 화면에 그려지는 전체 진입 흐름을 이해합니다.',
              estimatedTime: '40분',
              keywords: ['Vite', 'JSX 문법', '함수형 컴포넌트', 'Root DOM'],
              subTasks: [
                'Step 1 (구조 파악): index.html의 #root 태그와 src/main.tsx의 createRoot 연결 코드 확인하기',
                'Step 2 (문법 실습): JSX에서 className, 중괄호({}) 표현식, 태그는 반드시 닫아야 하는 규칙 3가지 직접 작성해 보기',
                'Step 3 (셀프 점검): ProfileCard라는 새 컴포넌트 파일을 만들어 App.tsx에 불러와 화면에 띄우기',
              ],
              referenceLink: 'https://ko.react.dev/learn/your-first-component',
            },
            {
              title: 'Props 인터페이스 정의와 컴포넌트 간 데이터 전달하기',
              description: '부모 컴포넌트에서 자식 컴포넌트로 데이터를 안전하게 넘겨주고 재사용성을 높이는 방법을 배웁니다.',
              estimatedTime: '50분',
              keywords: ['Props', 'TypeScript interface', '구조 분해 할당', 'children'],
              subTasks: [
                'Step 1 (개념 이해): 함수의 매개변수처럼 동작하는 Props의 단방향 데이터 흐름 이해하기',
                'Step 2 (타입 작성): interface ButtonProps를 선언하고 label, variant, disabled 속성에 타입 지정하기',
                'Step 3 (응용 실습): 기본값(Default Props)과 children을 받아 감싸는 Card 래퍼 컴포넌트 만들어 보기',
              ],
              referenceLink: 'https://ko.react.dev/learn/passing-props-to-a-component',
            },
            {
              title: '조건부 렌더링과 배열 map()으로 동적 리스트 출력하기',
              description: '데이터 유무에 따라 다른 UI를 보여주고 배열 데이터를 반복 렌더링할 때 고유 key가 왜 필요한지 학습합니다.',
              estimatedTime: '45분',
              keywords: ['Array.map()', '고유 key 원리', '삼항 연산자', '&& 단축 평가'],
              subTasks: [
                'Step 1 (개념 이해): 리액트가 변경된 항목만 빠르게 찾기 위해 배열 인덱스가 아닌 고유 ID를 key로 써야 하는 이유 읽기',
                'Step 2 (코드 실습): 할 일(Todo) 배열 데이터를 map()으로 순회하며 완료 여부에 따라 배지 색상을 다르게 표시하기',
                'Step 3 (빈 화면 처리): 배열 길이가 0일 때 "등록된 항목이 없습니다" 안내 화면을 조건부로 렌더링하기',
              ],
              referenceLink: 'https://ko.react.dev/learn/rendering-lists',
            },
            {
              title: 'useState 상태 관리와 불변성(Immutability) 업데이트 패턴',
              description: '일반 변수와 달리 화면을 다시 그리게(Re-render) 만드는 State의 원리와 객체/배열 상태를 안전하게 바꾸는 법을 익힙니다.',
              estimatedTime: '60분',
              keywords: ['useState', 'Re-rendering', '불변성(Spread 연산자)', '이벤트 핸들러'],
              subTasks: [
                'Step 1 (비교 실험): 일반 let 변수 변경 시 화면이 안 바뀌는 이유와 setState 호출 시 리렌더링 과정 비교하기',
                'Step 2 (배열 불변성): push/splice 대신 [...items, newItem]과 filter, map으로 배열 상태 추가·삭제·수정 구현하기',
                'Step 3 (입력 폼 연동): input의 value와 onChange를 연결한 제어 컴포넌트(Controlled Input) 직접 완성하기',
              ],
              referenceLink: 'https://ko.react.dev/learn/state-a-components-memory',
            },
          ],
        },
        {
          title: '2단계: React 핵심 Hooks와 비즈니스 로직 분리',
          description: '외부 API 호출, 타이머, 로컬 스토리지 연동 등 부수 효과(Side Effect)를 안전하게 다루고 나만의 Custom Hook으로 추상화합니다.',
          items: [
            {
              title: 'useEffect 생명주기 동기화와 의존성 배열(Dependency Array) 마스터',
              description: '컴포넌트가 마운트되거나 특정 값이 바뀔 때만 실행되는 이펙트 규칙과 무한 루프 방지법을 학습합니다.',
              estimatedTime: '55분',
              keywords: ['useEffect', '의존성 배열 []', 'Cleanup 함수', 'Mount/Unmount'],
              subTasks: [
                'Step 1 (실행 시점 비교): 의존성 배열을 생략했을 때, 빈 배열([])일 때, 특정 state를 넣었을 때 실행 횟수 콘솔로 확인하기',
                'Step 2 (메모리 누수 방지): addEventListener나 setInterval 사용 후 return () => cleanup 함수로 정리하는 코드 작성하기',
                'Step 3 (주의사항 점검): useEffect 없이 계산된 값(Derived State)으로 해결할 수 있는 케이스 구분하기',
              ],
              referenceLink: 'https://ko.react.dev/learn/synchronizing-with-effects',
            },
            {
              title: 'useRef를 활용한 DOM 포커스 제어 및 비렌더링 값 보존',
              description: '값이 바뀌어도 불필요한 리렌더링을 일으키지 않는 저장소 역할과 실제 HTML 요소에 직접 접근하는 방법을 배웁니다.',
              estimatedTime: '40분',
              keywords: ['useRef', 'HTMLInputElement', '자동 포커스', '타이머 ID 보관'],
              subTasks: [
                'Step 1 (DOM 접근): 모달이나 검색창이 열릴 때 inputRef.current?.focus()로 커서 자동 이동시키기',
                'Step 2 (값 보관): 리렌더링과 무관하게 이전 입력값이나 setTimeout ID를 useRef에 저장해 취소(clearTimeout)해 보기',
                'Step 3 (셀프 점검): useState와 useRef 중 언제 어떤 것을 써야 하는지 1줄 기준으로 정리하기',
              ],
              referenceLink: 'https://ko.react.dev/reference/react/useRef',
            },
            {
              title: '재사용 가능한 Custom Hook (useLocalStorage, useDebounce) 직접 제작',
              description: '컴포넌트 안에 섞여 있는 복잡한 상태 로직을 밖으로 분리해 여러 화면에서 깔끔하게 재사용합니다.',
              estimatedTime: '60분',
              keywords: ['Custom Hook', 'useDebounce', 'useLocalStorage', '관심사 분리'],
              subTasks: [
                'Step 1 (useLocalStorage): 상태 변경 시 자동으로 localStorage에 JSON.stringify로 저장·복원하는 훅 작성하기',
                'Step 2 (useDebounce): 검색어나 메모 입력 시 450ms 동안 추가 타이핑이 없을 때만 값을 반영하는 디바운스 훅 구현하기',
                'Step 3 (리팩토링): 기존 컴포넌트의 긴 상태 코드를 방금 만든 Custom Hook 1줄 호출로 교체하기',
              ],
              referenceLink: 'https://ko.react.dev/learn/reusing-logic-with-custom-hooks',
            },
          ],
        },
        {
          title: '3단계: 전역 상태(Zustand)와 서버 데이터 캐싱(TanStack Query)',
          description: 'Props Drilling 없이 깔끔하게 UI 상태를 공유하고, 서버 데이터의 로딩·에러·낙관적 업데이트를 자동화합니다.',
          items: [
            {
              title: 'Zustand 스토어 설계로 Props Drilling 해결하기',
              description: '복잡한 보일러플레이트 없이 가벼운 전역 스토어를 만들어 다크모드, 선택된 탭, 모달 상태를 관리합니다.',
              estimatedTime: '45분',
              keywords: ['Zustand', 'create()', 'Selector 최적화', 'Props Drilling'],
              subTasks: [
                'Step 1 (스토어 생성): create<State>()로 상태 변수와 액션 함수를 한곳에 모은 useUIStore 작성하기',
                'Step 2 (구독 최적화): 필요한 상태 조각만 선택해 불필요한 컴포넌트 리렌더링 막기',
                'Step 3 (영구 보존): 로컬 스토리지 미들웨어 또는 초기화 함수로 새로고침 후에도 테마 유지하기',
              ],
              referenceLink: 'https://zustand.docs.pmnd.rs/',
            },
            {
              title: 'TanStack Query의 useQuery로 비동기 데이터 조회 및 캐싱하기',
              description: 'isLoading, isError 상태를 직접 useState로 관리하지 않고 선언적으로 데이터를 패칭하고 캐싱합니다.',
              estimatedTime: '55분',
              keywords: ['QueryClient', 'useQuery', 'queryKey', 'staleTime'],
              subTasks: [
                'Step 1 (Provider 설정): main.tsx에 QueryClientProvider를 감싸고 기본 staleTime 옵션 설정하기',
                'Step 2 (데이터 패칭): 고유한 queryKey와 비동기 queryFn을 연결해 스켈레톤 로딩 UI와 에러 화면 분기하기',
                'Step 3 (캐시 확인): 탭을 이동했다가 돌아왔을 때 네트워크 재요청 없이 즉시 캐시 데이터가 뜨는지 확인하기',
              ],
              referenceLink: 'https://tanstack.com/query/latest/docs/framework/react/overview',
            },
            {
              title: 'useMutation과 낙관적 업데이트(Optimistic Update)로 0초 반응 UI 구현',
              description: '체크박스를 누르는 즉시 화면을 먼저 업데이트하고 백그라운드에서 저장소를 동기화하는 고급 UX 기법입니다.',
              estimatedTime: '65분',
              keywords: ['useMutation', 'onMutate', 'setQueryData', 'invalidateQueries'],
              subTasks: [
                'Step 1 (기본 변경): useMutation 실행 후 onSuccess에서 invalidateQueries로 목록 최신화하기',
                'Step 2 (낙관적 반영): onMutate에서 cancelQueries 후 setQueryData로 캐시를 즉시 수정해 체감 지연 0ms 만들기',
                'Step 3 (실패 롤백): onError 발생 시 백업해 둔 이전 스냅샷(previous)으로 안전하게 되돌리는 로직 검증하기',
              ],
              referenceLink: 'https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates',
            },
          ],
        },
        {
          title: '4단계: 렌더링 최적화, 웹 접근성 점검 및 프로덕션 배포',
          description: '불필요한 연산을 줄이고 키보드/모바일 사용자 모두에게 쾌적한 프로덕션 수준의 웹앱으로 완성합니다.',
          items: [
            {
              title: 'useMemo와 useCallback으로 무거운 연산 및 자식 리렌더링 최적화',
              description: '통계 계산이나 필터링처럼 비용이 큰 연산을 메모이제이션하여 버벅임 없는 UI를 유지합니다.',
              estimatedTime: '45분',
              keywords: ['useMemo', 'useCallback', 'React.memo', '참조 동일성'],
              subTasks: [
                'Step 1 (연산 캐싱): 수백 개의 체크리스트 진행률 및 필터링 계산 로직을 useMemo로 감싸기',
                'Step 2 (함수 참조 유지): 자식 리스트 아이템에 전달하는 핸들러에 useCallback과 React.memo 조합 적용하기',
                'Step 3 (과최적화 주의): 단순 연산에는 메모이제이션이 오히려 독이 되는 기준 이해하기',
              ],
              referenceLink: 'https://ko.react.dev/reference/react/useMemo',
            },
            {
              title: '키보드 접근성(a11y) 및 모바일 반응형 터치 영역 다듬기',
              description: 'ESC 키로 모달 닫기, ARIA 속성 부여, 스마트폰 화면에서의 터치 히트 영역을 꼼꼼히 점검합니다.',
              estimatedTime: '40분',
              keywords: ['aria-label', 'role="dialog"', 'ESC 키 이벤트', '반응형 Breakpoint'],
              subTasks: [
                'Step 1 (키보드 제어): 모달/드로어가 열렸을 때 Escape 키 이벤트 리스너로 즉시 닫히도록 구현하기',
                'Step 2 (시맨틱 마크업): 아이콘만 있는 버튼에 aria-label과 role="progressbar" 등 표준 접근성 속성 추가하기',
                'Step 3 (모바일 뷰 검증): 브라우저 개발자 도구에서 375px 모바일 화면으로 전환해 가로 스크롤 깨짐이 없는지 확인하기',
              ],
            },
            {
              title: 'TypeScript 정적 검증(tsc) 및 프로덕션 번들 빌드·배포',
              description: '타입 에러 0건과 최적화된 정적 에셋 번들을 생성하여 언제든 배포 가능한 상태로 마무리합니다.',
              estimatedTime: '35분',
              keywords: ['tsc --noEmit', 'vite build', 'dist 번들', '환경변수 분리'],
              subTasks: [
                'Step 1 (타입 무결성): npx tsc --noEmit 명령어를 실행해 숨어 있는 타입 불일치 0건 만들기',
                'Step 2 (프로덕션 빌드): npm run build로 dist 폴더를 생성하고 번들 용량(gzip) 확인하기',
                'Step 3 (프리뷰 테스트): npm run preview로 실제 배포 환경과 동일하게 동작하는지 최종 점검하기',
              ],
            },
          ],
        },
      ],
    });
  }

  // 3. SQL / Database
  if (lower.includes('sql') || lower.includes('데이터') || lower.includes('db')) {
    return AIRoadmapSchema.parse({
      title: `${cleanTopic} ${levelLabel} 세분화 로드맵 (${input.targetDuration})`,
      topic: cleanTopic,
      targetDuration: input.targetDuration,
      summary: `단순 문법 암기가 아니라 실제 서비스 데이터베이스에서 원하는 지표를 뽑아낼 수 있도록 기초 필터링부터 조인, 윈도우 함수, 실행 계획 튜닝까지 세분화한 ${levelLabel} 과정입니다.`,
      chapters: [
        {
          title: '1단계: SQL 조회 핵심 문법과 조건 필터링 세분화 훈련',
          description: '테이블 구조를 파악하고 원하는 조건의 행(Row)만 정확하게 추출·정렬하는 기본기를 다집니다.',
          items: [
            {
              title: 'SELECT 실행 순서 이해와 WHERE 다중 조건(AND, OR, IN, BETWEEN) 작성',
              description: 'SQL이 작성 순서(SELECT→FROM)가 아니라 FROM→WHERE→SELECT 순으로 실행되는 원리를 이해합니다.',
              estimatedTime: '40분',
              keywords: ['SQL 실행 순서', 'WHERE', 'BETWEEN / IN', 'LIKE 패턴'],
              subTasks: [
                'Step 1 (원리 이해): FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY 실행 순서 암기하기',
                'Step 2 (조건 실습): 특정 기간(BETWEEN) 내 특정 카테고리(IN) 주문 데이터만 추출하는 쿼리 작성하기',
                'Step 3 (우선순위 주의): AND와 OR를 함께 쓸 때 괄호()를 누락하면 결과가 어떻게 달라지는지 직접 비교하기',
              ],
              referenceLink: 'https://www.postgresql.org/docs/current/tutorial-select.html',
            },
            {
              title: 'NULL 데이터 안전 처리(IS NULL, COALESCE)와 CASE WHEN 조건 분기',
              description: '실무 데이터에 반드시 존재하는 결측치(NULL)로 인한 계산 오류를 막고 데이터를 구간별로 분류합니다.',
              estimatedTime: '45분',
              keywords: ['IS NULL', 'COALESCE()', 'NULLIF()', 'CASE WHEN'],
              subTasks: [
                'Step 1 (NULL 함정): "= NULL"이 동작하지 않는 이유와 IS NULL / IS NOT NULL 사용법 익히기',
                'Step 2 (결측치 치환): COALESCE(할인금액, 0) 함수로 사칙연산 결과가 NULL이 되는 현상 방지하기',
                'Step 3 (구간 분류): CASE WHEN 구문으로 구매 금액대별 고객 등급(VIP, 일반, 신규) 파생 컬럼 만들기',
              ],
            },
            {
              title: '집계 함수(COUNT, SUM, AVG)와 GROUP BY · HAVING 완벽 구분',
              description: '전체 데이터를 그룹별로 요약하여 일별 매출, 카테고리별 평균 객단가 등 핵심 지표를 산출합니다.',
              estimatedTime: '50분',
              keywords: ['GROUP BY', 'HAVING vs WHERE', 'COUNT(DISTINCT)', '집계 함수'],
              subTasks: [
                'Step 1 (차이점 비교): COUNT(*)와 COUNT(컬럼명), COUNT(DISTINCT 유저ID)의 결과 수치 차이 실험하기',
                'Step 2 (그룹 집계): GROUP BY에 명시하지 않은 일반 컬럼을 SELECT에 넣었을 때 발생하는 에러 원인 이해하기',
                'Step 3 (그룹 필터링): 집계 전 필터링(WHERE)과 집계 후 조건 필터링(HAVING COUNT(*) >= 5)을 함께 조합해 보기',
              ],
            },
          ],
        },
        {
          title: '2단계: 다중 테이블 조인(JOIN)과 가독성 높은 CTE(WITH문) 설계',
          description: '여러 테이블에 흩어진 유저·주문·상품 정보를 누락이나 뻥튀기(중복) 없이 결합하는 실전 기법을 익힙니다.',
          items: [
            {
              title: 'INNER JOIN과 LEFT JOIN의 벤다이어그램 원리 및 유실 데이터 검증',
              description: '주문 이력이 없는 휴면 회원까지 포함해야 할 때 왜 LEFT JOIN을 써야 하는지 명확히 구분합니다.',
              estimatedTime: '55분',
              keywords: ['INNER JOIN', 'LEFT OUTER JOIN', 'ON 조인 키', '데이터 뻥튀기 방지'],
              subTasks: [
                'Step 1 (조인 비교): 회원(users) 테이블과 주문(orders) 테이블을 INNER JOIN vs LEFT JOIN 했을 때 행 개수 비교하기',
                'Step 2 (미구매자 추출): LEFT JOIN 후 WHERE orders.id IS NULL 패턴으로 가입 후 첫 구매가 없는 유저 찾기',
                'Step 3 (1:N 주의점): 1:N 관계 테이블 조인 시 원본 행이 복제되어 SUM 집계가 부풀려지는 현상 확인하기',
              ],
            },
            {
              title: 'WITH 구문(CTE)으로 복잡한 서브쿼리를 단계별 블록으로 분리하기',
              description: '읽기 힘든 중첩 서브쿼리를 논리적인 순서의 임시 뷰(CTE)로 쪼개어 유지보수하기 쉬운 쿼리를 작성합니다.',
              estimatedTime: '50분',
              keywords: ['WITH (CTE)', '인라인 뷰', '스칼라 서브쿼리', 'EXISTS'],
              subTasks: [
                'Step 1 (리팩토링): 3중으로 중첩된 FROM절 서브쿼리를 WITH step1 AS (...), step2 AS (...) 구조로 변환하기',
                'Step 2 (성능 비교): IN 서브쿼리 대신 EXISTS절을 사용하여 조건 만족 시 즉시 탐색을 멈추는 패턴 실습하기',
                'Step 3 (셀프 점검): 월별 우수 고객 목록 CTE와 상품 구매 내역 CTE를 조인하는 리포트 쿼리 완성하기',
              ],
              referenceLink: 'https://www.postgresql.org/docs/current/queries-with.html',
            },
            {
              title: '집합 연산자(UNION ALL)와 날짜/문자열 내장 함수 실무 활용',
              description: '서로 다른 로그 테이블을 하나로 합치고 타임스탬프에서 연/월/주 단위를 추출합니다.',
              estimatedTime: '45분',
              keywords: ['UNION ALL vs UNION', 'DATE_TRUNC', 'EXTRACT', '문자열 파싱'],
              subTasks: [
                'Step 1 (중복 제거 비용): 정렬 연산이 들어가는 UNION 대신 속도가 빠른 UNION ALL을 기본으로 써야 하는 이유 이해하기',
                'Step 2 (시계열 변환): DATE_TRUNC("month", created_at)으로 일시 데이터를 월 단위로 묶어 월별 추이 집계하기',
                'Step 3 (문자열 가공): SUBSTRING, SPLIT_PART, CONCAT 함수로 이메일 도메인별 가입자 수 집계하기',
              ],
            },
          ],
        },
        {
          title: '3단계: 분석용 윈도우 함수(Window Functions)와 실전 비즈니스 지표',
          description: 'GROUP BY처럼 행을 합치지 않고도 그룹 내 순위, 누적 매출, 전월 대비 증감률, 리텐션을 한 번에 계산합니다.',
          items: [
            {
              title: 'PARTITION BY와 순위 함수(ROW_NUMBER, RANK, DENSE_RANK) 마스터',
              description: '카테고리별 베스트셀러 Top 3나 유저별 가장 최근 접속 로그 1건만 깔끔하게 추출합니다.',
              estimatedTime: '55분',
              keywords: ['OVER(PARTITION BY)', 'ROW_NUMBER()', 'RANK()', '최신 이력 1건 추출'],
              subTasks: [
                'Step 1 (동점자 처리 비교): 동일한 매출액이 있을 때 ROW_NUMBER(1,2,3), RANK(1,1,3), DENSE_RANK(1,1,2) 결과 비교하기',
                'Step 2 (그룹별 Top N): 카테고리별로 매출 순위를 매긴 뒤 CTE 바깥에서 WHERE rn <= 3으로 상위 3개씩만 뽑기',
                'Step 3 (중복 제거): 유저별 여러 배송지 변경 이력 중 ROW_NUMBER() = 1을 활용해 가장 최신 주소만 남기기',
              ],
              referenceLink: 'https://www.postgresql.org/docs/current/tutorial-window.html',
            },
            {
              title: 'LAG · LEAD 함수로 전일/전월 대비 증감률(MoM)과 재구매 주기 계산',
              description: '이전 행이나 다음 행의 값을 현재 행으로 가져와 시계열 변화량과 구매 간격을 구합니다.',
              estimatedTime: '50분',
              keywords: ['LAG()', 'LEAD()', '전월 대비 성장률(MoM)', '구매 간격(Interval)'],
              subTasks: [
                'Step 1 (이전 값 참조): LAG(월매출, 1) OVER(ORDER BY 월)로 전달 매출을 옆 컬럼에 나란히 배치하기',
                'Step 2 (증감률 공식): (이번달매출 - 전달매출) * 100.0 / NULLIF(전달매출, 0)으로 안전한 성장률(%) 구하기',
                'Step 3 (이탈 분석): 유저별 주문일자에 LEAD(주문일)을 적용해 첫 구매 후 두 번째 구매까지 걸린 평균 일수 계산하기',
              ],
            },
            {
              title: '누적 합계(Running Total)와 이동 평균(Moving Average) 윈도우 프레임',
              description: 'ROWS BETWEEN 옵션을 제어하여 일별 누적 매출과 최근 7일 이동 평균선을 산출합니다.',
              estimatedTime: '50분',
              keywords: ['SUM() OVER()', 'ROWS BETWEEN', 'UNBOUNDED PRECEDING', '7일 이동평균'],
              subTasks: [
                'Step 1 (누적합): SUM(일매출) OVER(ORDER BY 날짜)로 연초부터 현재까지의 누적 매출 추이 구하기',
                'Step 2 (이동평균): AVG(일매출) OVER(ORDER BY 날짜 ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)로 주간 평균 구하기',
                'Step 3 (비율 계산): 개별 상품 매출 / SUM(상품매출) OVER()로 전체 대비 카테고리 매출 비중(%) 한 번에 구하기',
              ],
            },
          ],
        },
        {
          title: '4단계: 인덱스 원리와 EXPLAIN 실행 계획 기반 쿼리 튜닝',
          description: '느린 쿼리의 원인을 실행 계획으로 진단하고 인덱스를 타도록 조건절을 교정하여 응답 속도를 개선합니다.',
          items: [
            {
              title: 'B-Tree 인덱스 구조 이해와 복합 인덱스 컬럼 순서 설계',
              description: '책의 색인처럼 동작하는 B-Tree 원리를 이해하고 카디널리티와 조건절 패턴에 맞는 인덱스를 설계합니다.',
              estimatedTime: '50분',
              keywords: ['B-Tree 인덱스', '카디널리티(Cardinality)', '복합 인덱스 선두 컬럼', 'Covering Index'],
              subTasks: [
                'Step 1 (탐색 원리): Full Table Scan(전체 탐색)과 Index Range Scan(범위 탐색)의 시간 복잡도 차이 이해하기',
                'Step 2 (순서 규칙): (상태, 생성일) 복합 인덱스에서 동등 조건(=) 컬럼을 범위 조건(>, BETWEEN)보다 앞에 두는 이유 정리하기',
                'Step 3 (쓰기 비용): 인덱스를 너무 많이 만들면 INSERT/UPDATE/DELETE 성능이 느려지는 트레이드오프 파악하기',
              ],
            },
            {
              title: '인덱스를 못 타게 만드는 나쁜 SQL 패턴(좌변 가공) 교정하기',
              description: '인덱스 컬럼을 함수나 연산으로 감쌌을 때 왜 인덱스가 무력화되는지 확인하고 쿼리를 재작성합니다.',
              estimatedTime: '45분',
              keywords: ['SARGable 쿼리', '좌변 컬럼 가공 금지', '묵시적 형변환', 'LIKE "%키워드"'],
              subTasks: [
                'Step 1 (날짜 조건 교정): WHERE YEAR(created_at) = 2026을 WHERE created_at >= "2026-01-01" 범위 조건으로 고치기',
                'Step 2 (수식 이동): WHERE price * 1.1 > 10000을 WHERE price > 10000 / 1.1로 우변 연산으로 바꾸기',
                'Step 3 (문자열 검색): 앞쪽 와일드카드(LIKE "%단어") 대신 접두어 검색(LIKE "단어%")이나 전문 검색 대안 파악하기',
              ],
            },
            {
              title: 'EXPLAIN ANALYZE 실행 계획 판독 및 종합 KPI 대시보드 쿼리 완성',
              description: '실제 쿼리 수행 시간과 Cost, 스캔 방식을 읽고 병목 지점을 개선합니다.',
              estimatedTime: '60분',
              keywords: ['EXPLAIN ANALYZE', 'Seq Scan vs Index Scan', 'Hash Join / Nested Loop', 'Cost & Actual Time'],
              subTasks: [
                'Step 1 (실행 계획 읽기): 쿼리 앞에 EXPLAIN ANALYZE를 붙여 가장 안쪽 들여쓰기 노드의 Actual Time과 Rows 확인하기',
                'Step 2 (병목 개선): 대용량 테이블에서 Seq Scan이 발생하는 구간에 적절한 인덱스를 추가하고 속도 비교하기',
                'Step 3 (최종 미니 프로젝트): DAU/MAU, 코호트 리텐션, 카테고리별 매출 Top 5를 뽑는 종합 분석 마크다운 리포트 완성하기',
              ],
              referenceLink: 'https://www.postgresql.org/docs/current/using-explain.html',
            },
          ],
        },
      ],
    });
  }

  // 4. TOEIC / English
  if (lower.includes('토익') || lower.includes('toeic') || lower.includes('영어') || lower.includes('어학')) {
    return AIRoadmapSchema.parse({
      title: `${cleanTopic} 목표 달성 세분화 로드맵 (${input.targetDuration})`,
      topic: cleanTopic,
      targetDuration: input.targetDuration,
      summary: `막연하게 '문제 많이 풀기'가 아니라 파트별 빈출 패턴 분석, 오답 소거 공식, 패러프레이징 노트, 시간 배분 훈련까지 하루 단위로 잘게 쪼갠 ${input.targetDuration} 집중 커리큘럼입니다.`,
      chapters: [
        {
          title: '1단계: RC 문법 뼈대(품사·동사) 확립 & LC Part 1·2 순발력 훈련',
          description: '해석 없이도 5초 만에 풀 수 있는 문법 구조 문제와 짧은 질의응답 청해의 핵심 소거법을 익힙니다.',
          items: [
            {
              title: '문장 5형식 구조와 명사·형용사·부사 품사 자리 3초 판별법',
              description: '빈칸 앞뒤의 관사(a/the), 전치사, 타동사만 보고도 정답 품사를 골라내는 시간 단축 공식을 훈련합니다.',
              estimatedTime: '45분',
              keywords: ['명사/형용사/부사 자리', '관사+부사+형용사+명사', '전치사 vs 접속사', '복합명사'],
              subTasks: [
                'Step 1 (공식 정리): [관사/소유격 + (부사) + (형용사) + 명사] 어순 공식과 주요 명사/형용사 접미사(-tion, -tive, -ly) 정리하기',
                'Step 2 (예외 암기): -ly로 끝나지만 형용사인 단어(costly, timely, friendly)와 모양이 같은 부사(hard/hardly, late/lately) 구분하기',
                'Step 3 (실전 훈련): 품사 자리 기출 30문제를 해석하지 않고 빈칸 앞뒤 단어만 보고 문제당 5초 이내에 마킹하기',
              ],
            },
            {
              title: '주어-동사 수일치, 능동/수동태, 시제 단서 매칭 공식',
              description: '길어진 수식어구를 괄호로 묶어 진짜 주어를 찾고 목적어 유무로 능동·수동을 즉시 판별합니다.',
              estimatedTime: '50분',
              keywords: ['수식어구 거르기', '능동태 vs 수동태', '현재완료(since/over)', '미래시제'],
              subTasks: [
                'Step 1 (주어 찾기): 주어와 동사 사이에 끼어드는 [전치사+명사], [분사구], [관계사절]을 괄호로 지우고 단/복수 맞추기',
                'Step 2 (태 판별): 빈칸 뒤에 명사(목적어)가 있으면 능동태, 전치사/부사만 있으면 수동태(be p.p.)를 고르는 원칙 적용하기',
                'Step 3 (시제 단서): since, over the past 5 years(현재완료), by next month(미래완료) 등 시간 부사구 짝꿍 표현 20개 정리하기',
              ],
            },
            {
              title: 'LC Part 1 상태/동작 동사 구분 및 오답 소거 훈련',
              description: '사람 등장 사진과 사물/풍경 사진에서 자주 나오는 함정 선지(being p.p.)를 걸러내는 연습을 합니다.',
              estimatedTime: '40분',
              keywords: ['입고 있는 상태(be wearing)', '입는 동작(be putting on)', '사물 진행수동(being p.p.) 함정'],
              subTasks: [
                'Step 1 (표현 구분): 동작(putting on, picking up)과 상태(wearing, holding) 동사구 30개 소리 내어 읽고 발음 익히기',
                'Step 2 (함정 제거): 사람이 없는 풍경 사진에서 "is being + p.p."가 들리면 즉시 오답으로 지우는 연습하기',
                'Step 3 (받아쓰기): 기출 Part 1 음원 12문제를 듣고 사진에 없는 명사나 틀린 동작 동사를 정확히 잡아내기',
              ],
            },
            {
              title: 'LC Part 2 의문사별(Who/When/Where/How) 첫 단어 집중 & 우회 답변 공략',
              description: '질문의 첫 1~2단어를 놓치지 않고 기억하며 "모른다 / 담당자에게 물어봐라" 같은 간접 정답 패턴을 익힙니다.',
              estimatedTime: '45분',
              keywords: ['의문사 청취', '우회 답변(Indirect Answer)', '유사 발음 함정 소거', '시제/주어 불일치'],
              subTasks: [
                'Step 1 (첫 단어 각인): When(시점), Where(장소), Who(사람/부서), Why(이유) 질문의 첫 단어를 입 모양으로 따라 하며 듣기',
                'Step 2 (소거법 적용): 질문에 나온 단어가 그대로 들리거나 유사 발음(copy ↔ coffee)이 나오면 오답으로 소거하기',
                'Step 3 (만능 정답 암기): "It hasn\'t been decided yet", "Let me check the schedule" 등 빈출 우회 답변 15개 쉐도잉하기',
              ],
            },
          ],
        },
        {
          title: '2단계: RC Part 5·6 준동사·연결어 정복 & LC Part 3·4 스키밍 전략',
          description: '문장 속 진짜 동사와 준동사를 구분하고, LC 음원이 나오기 전 질문과 보기를 미리 읽는 선지 스키밍을 체화합니다.',
          items: [
            {
              title: '준동사(to부정사, 동명사, 분사)와 감정 분사(ing vs p.p.) 완벽 정리',
              description: '한 문장에 동사는 1개뿐이라는 원칙을 바탕으로 빈칸이 동사 자리인지 준동사 자리인지 구분합니다.',
              estimatedTime: '50분',
              keywords: ['to부정사 vs 동명사 목적어', '현재분사(-ing) vs 과거분사(p.p.)', '분사구문'],
              subTasks: [
                'Step 1 (자리 판별): 문장 내 접속사 개수 + 1 = 동사 개수 공식으로 빈칸이 본동사인지 분사(형용사) 자리인지 먼저 확인하기',
                'Step 2 (짝꿍 암기): 동명사만 목적어로 취하는 동사(consider, suggest, postpone, avoid) 리스트 암기하기',
                'Step 3 (분사 구분): 명사 앞뒤에서 수식할 때 능동/진행이면 -ing, 수동/완료면 p.p.를 고르는 기출 30제 풀기',
              ],
            },
            {
              title: '전치사 vs 부사절 접속사 vs 접속부사 빈출 40선 의미·품사 매칭',
              description: '뜻은 같지만 뒤에 명사구만 오는 전치사와 주어+동사가 오는 접속사를 헷갈리지 않도록 표로 정리합니다.',
              estimatedTime: '45분',
              keywords: ['despite vs although', 'because of vs because', 'during vs while', 'therefore/however'],
              subTasks: [
                'Step 1 (3단 비교표 작성): [양보/이유/시간/조건] 의미별로 전치사(명사구) - 접속사(절) - 접속부사(콤마) 짝지어 표 만들기',
                'Step 2 (구조 확인): 빈칸 뒤에 동사가 있는지 없는지 먼저 체크해 보기의 절반을 1초 만에 소거하기',
                'Step 3 (Part 6 문장 삽입): 지시 대명사(this, these, such)와 연결어를 단서로 앞뒤 문맥을 잇는 Part 6 연습 4세트 풀기',
              ],
            },
            {
              title: 'LC Part 3·4 음원 재생 전 질문·선지 스키밍(Skimming) 루틴 훈련',
              description: '음원을 들으면서 문제를 읽으면 늦습니다. 디렉션 시간을 활용해 3문제의 질문 키워드를 미리 밑줄 긋는 연습입니다.',
              estimatedTime: '55분',
              keywords: ['선지 스키밍(미리 읽기)', '패러프레이징(동의어 치환)', '화자 의도 파악 문제', '시각 정보 연계'],
              subTasks: [
                'Step 1 (예습 타이밍): 이전 세트 마킹을 빠르게 끝내고 다음 3문제의 질문 핵심어(누가, 무엇을, 왜)에 눈으로 표시하기',
                'Step 2 (순서대로 풀기): 대화가 흐르는 순서대로 Q1 → Q2 → Q3 정답 단서가 나온다는 점을 이용해 리듬 타기',
                'Step 3 (패러프레이징 노트): 음원에서 들린 표현(예: buy a ticket)이 선지에서 어떻게 바뀌는지(예: make a reservation) 20쌍 정리하기',
              ],
            },
          ],
        },
        {
          title: '3단계: RC Part 7 지문 유형별 단서 탐색 및 복수 지문 교차 독해',
          description: '지문을 처음부터 끝까지 다 읽지 않고도 질문 유형별로 정답이 숨어 있는 위치를 빠르게 타겟팅합니다.',
          items: [
            {
              title: 'Part 7 단일 지문(이메일, 공고문, 기사, 문자 채팅) 유형별 출제 포인트',
              description: '지문 종류마다 주제문이 나오는 위치와 자주 묻는 세부 사항 패턴을 익혀 독해 속도를 높입니다.',
              estimatedTime: '55분',
              keywords: ['첫 문단 주제문', 'Not/True 소거법', '문자 채팅 의도 파악', '동의어 찾기 문제'],
              subTasks: [
                'Step 1 (주제 문제): 이메일이나 공지문의 목적을 묻는 문제는 첫 2~3문장(I am writing to~)만 읽고 바로 정답 고르기',
                'Step 2 (세부 조건): 요청 사항이나 주의 사항은 지문 하단의 however, please note, make sure 뒤 문장 집중해서 읽기',
                'Step 3 (시간 측정): 단일 지문 10세트를 타이머 22분으로 맞춰 놓고 정답의 근거 문장에 직접 밑줄 그으며 풀기',
              ],
            },
            {
              title: '이중·삼중 복수 지문 간 연결 고리(Cross-Reference) 추론 훈련',
              description: '두 개 이상의 지문에 흩어진 정보(예: 1번 지문의 일정표 + 2번 지문의 변경 요청 이메일)를 결합해 정답을 찾습니다.',
              estimatedTime: '60분',
              keywords: ['연계 추론 문제', '고유명사/날짜/번호 매칭', '환불/보상 조건 교차 확인'],
              subTasks: [
                'Step 1 (공통 단서 찾기): 첫 지문의 표/일정표와 두 번째 이메일에 공통으로 등장하는 사람 이름, 주문번호, 날짜 연결하기',
                'Step 2 (단계별 풀이): 첫 지문만 읽고 풀 수 있는 앞의 2문제를 먼저 해결한 뒤, 두 번째 지문으로 넘어가는 끊어 읽기 연습',
                'Step 3 (삼중 지문 완주): 삼중 지문 3세트를 지문당 5분(총 15분) 제한 시간 내에 풀고 연계 단서 위치 복기하기',
              ],
            },
          ],
        },
        {
          title: '4단계: 실전 120분 타임어택 모의고사 & 오답 노트 마스터',
          description: '실제 시험장의 시간 배분 감각을 몸에 익히고, 자주 틀리는 취약 유형만 골라 집중 보완합니다.',
          items: [
            {
              title: '파트별 골든 타임 배분 전략(Part 5·6 18분 / Part 7 55분) 실전 적용',
              description: '뒤쪽 독해 지문을 찍지 않고 끝까지 다 읽을 수 있도록 파트별 마지노선 시간을 엄격히 지키는 연습입니다.',
              estimatedTime: '120분',
              keywords: ['시간 배분(Time Management)', 'Part 5·6 18분 컷', 'OMR 마킹 병행', '모르는 문제 30초 패스 원칙'],
              subTasks: [
                'Step 1 (타임라인 세팅): LC 마킹 종료 즉시 RC 시작 시각을 적고, Part 5(10분) → Part 6(8분) → 단일지문(27분) → 복수지문(28분) 체크하기',
                'Step 2 (과감한 패스): Part 5 어휘 문제에서 20초 이상 고민되면 별표 치고 즉시 넘어가 독해 시간 확보하기',
                'Step 3 (실전 모의고사): OMR 카드 마킹까지 포함해 120분 풀세트 모의고사 완주하기',
              ],
            },
            {
              title: '틀린 문제 원인 분류(어휘 부족 vs 문법 공식 vs 패러프레이징) 및 메모 기록',
              description: '점수를 가장 빠르게 올리는 방법은 이미 푼 모의고사에서 몰랐던 단어와 함정 패턴을 내 것으로 만드는 것입니다.',
              estimatedTime: '50분',
              keywords: ['오답 원인 진단', '빈출 콜로케이션 암기', 'LC 쉐도잉 복습', '취약 파트 타겟팅'],
              subTasks: [
                'Step 1 (LC 오답 복습): 틀린 LC 문제는 스크립트를 보지 않고 3번 다시 들은 뒤, 안 들렸던 연음 구간을 따라 읽기',
                'Step 2 (RC 근거 체크): 해설지를 보기 전에 지문 속에서 정답의 결정적 근거가 된 문장 1줄을 스스로 다시 찾아내기',
                'Step 3 (메모장 아카이빙): 헷갈렸던 비즈니스 어휘와 문법 포인트를 본 체크리스트의 인라인 메모에 기록해 시험장 노트로 활용하기',
              ],
            },
          ],
        },
      ],
    });
  }

  // 5. General & Custom Topic Adaptive Granular Curriculum
  return AIRoadmapSchema.parse({
    title: `${cleanTopic} ${levelLabel} 세분화 로드맵 (${input.targetDuration})`,
    topic: cleanTopic,
    targetDuration: input.targetDuration,
    summary: `'${cleanTopic}' 주제를 처음부터 막막함 없이 공부할 수 있도록, 큰 덩어리를 잘게 쪼개어 [핵심 개념 이해 → 단계별 실습 가이드 → 셀프 체크] 순서로 구성한 ${input.targetDuration} 맞춤형 로드맵입니다.`,
    chapters: [
      {
        title: `1단계: ${cleanTopic} 필수 기초 용어와 전체 그림(Big Picture) 이해하기`,
        description: `본격적인 암기나 실습에 앞서 '${cleanTopic}'이 왜 필요하고 어떤 핵심 요소들로 이루어져 있는지 뼈대를 잡습니다.`,
        items: [
          {
            title: `${cleanTopic}의 핵심 개념과 전체 동작 흐름 한눈에 파악하기`,
            description: `세부 내용에 매몰되지 않도록 전체 구조와 필수 용어 10가지를 먼저 내 언어로 쉽게 정리합니다.`,
            estimatedTime: '40분',
            keywords: [`${cleanTopic} 기초 개념`, '핵심 용어 정리', '전체 아키텍처/구조', '입문 가이드'],
            subTasks: [
              `Step 1 (개념 훑기): ${cleanTopic} 공식 입문 문서나 개요 가이드를 읽으며 가장 자주 등장하는 핵심 용어 5개 밑줄 긋기`,
              `Step 2 (도식화 실습): 각 개념이 서로 어떻게 연결되는지 화살표나 간단한 순서도로 노트에 그려보기`,
              `Step 3 (셀프 점검): 비전공자나 친구에게 "${cleanTopic}이 무엇인지" 3문장으로 쉽게 설명할 수 있는지 테스트하기`,
            ],
          },
          {
            title: `실습 및 학습 환경 구축과 첫 번째 기본 예제(Quick Start) 완주`,
            description: `눈으로만 읽는 공부를 넘어 직접 손을 움직여 결과를 확인해 볼 수 있는 기본 환경을 준비합니다.`,
            estimatedTime: '45분',
            keywords: ['환경 세팅', 'Quick Start 예제', '공식 튜토리얼', '기본 도구 사용법'],
            subTasks: [
              `Step 1 (도구 준비): ${cleanTopic} 학습에 필요한 필수 프로그램/도구 또는 교재를 준비하고 초기 설정 완료하기`,
              `Step 2 (따라 하기): 공식 가이드의 가장 기초적인 'Hello World / 첫 시작 예제'를 처음부터 끝까지 그대로 따라 해보기`,
              `Step 3 (변형 실험): 예제 속 숫자나 옵션, 텍스트를 내 마음대로 살짝 바꾸어 보며 결과가 어떻게 달라지는지 확인하기`,
            ],
          },
          {
            title: `초보자가 가장 많이 헷갈리는 핵심 원리 3가지 집중 비교`,
            description: `초반에 개념이 흔들리기 쉬운 유사 개념들의 차이점을 비교표를 통해 명확히 구분합니다.`,
            estimatedTime: '50분',
            keywords: ['핵심 원리 비교', '빈출 오개념 정리', '기본 규칙 마스터'],
            subTasks: [
              `Step 1 (비교 분석): ${cleanTopic}에서 이름은 비슷하지만 역할이 다른 주요 개념 2~3쌍을 찾아 차이점 비교하기`,
              `Step 2 (예제 확인): 각각의 개념이 실제로 어떤 상황에서 사용되는지 구체적인 사례 1개씩 매칭하기`,
              `Step 3 (메모 기록): 내가 이해한 핵심 차이를 본 항목 우측 '메모' 버튼을 눌러 3줄 요약으로 남겨두기`,
            ],
          },
        ],
      },
      {
        title: `2단계: ${cleanTopic} 핵심 기능/유형별 세부 쪼개기 훈련`,
        description: `가장 비중이 높고 자주 쓰이는 핵심 기능들을 하나씩 분리하여 원리 이해부터 반복 연습까지 진행합니다.`,
        items: [
          {
            title: `핵심 문법·규칙 파트 A: 기본 패턴 숙달 및 예제 풀이`,
            description: `${cleanTopic}의 가장 기본이 되는 표준 패턴을 익히고 손에 익을 때까지 작은 단위로 반복 실습합니다.`,
            estimatedTime: '50분',
            keywords: ['표준 패턴', '핵심 문법/규칙', '기초 응용 연습'],
            subTasks: [
              `Step 1 (원리 이해): 기본 패턴이 왜 그렇게 설계되었는지 배경 원리와 사용 규칙 읽기`,
              `Step 2 (반복 실습): 힌트나 정답을 보지 않고 기본 예제 3가지를 백지상태에서 스스로 구현/풀이해 보기`,
              `Step 3 (오답 체크): 막혔던 부분이나 실수한 조건을 체크하고 다시 한번 복습하기`,
            ],
          },
          {
            title: `핵심 문법·규칙 파트 B: 데이터/조건 조합 및 예외 상황 다루기`,
            description: `단순한 기본 예제를 넘어 여러 조건이 결합되거나 예상치 못한 에러/예외가 발생하는 상황을 해결합니다.`,
            estimatedTime: '55분',
            keywords: ['복합 조건 처리', '에러/예외 대응', '디버깅 방법', 'Best Practice'],
            subTasks: [
              `Step 1 (케이스 분석): 실전에서 자주 발생하는 오류 메시지나 오답 유형 3가지 원인 파악하기`,
              `Step 2 (해결 실습): 잘못된 입력이나 예외 상황이 들어왔을 때 안전하게 처리하는 방어 로직/풀이법 적용하기`,
              `Step 3 (가독성 개선): 더 깔끔하고 표준적인 방식(Best Practice)과 내 결과물을 비교해 교정하기`,
            ],
          },
          {
            title: `중간 점검: 1~2단계 핵심 개념 총정리 및 미니 퀴즈 테스트`,
            description: `진도를 더 나가기 전에 지금까지 배운 기초와 핵심 규칙이 머릿속에 잘 자리 잡았는지 점검합니다.`,
            estimatedTime: '40분',
            keywords: ['중간 복습', '백지 복습법', '취약점 보완'],
            subTasks: [
              `Step 1 (백지 복습): 교재를 덮고 지금까지 배운 핵심 키워드들을 기억나는 대로 종이나 메모장에 적어보기`,
              `Step 2 (약점 타겟팅): 설명이 막히거나 헷갈렸던 소주제 1~2개를 다시 찾아 15분간 집중 복습하기`,
              `Step 3 (체크 완료): 완벽히 이해된 항목들을 DONE(완료) 상태로 전환하며 성취감 확인하기`,
            ],
          },
        ],
      },
      {
        title: `3단계: ${cleanTopic} 실전 응용 및 소규모 프로젝트/실전 문제 완주`,
        description: `개별적으로 배운 조각 지식들을 하나로 연결하여 실제 동작하는 결과물이나 실전 문제를 풀어냅니다.`,
        items: [
          {
            title: `실전 미니 과제 기획 및 3단계 세부 작업 순서 설계`,
            description: `처음부터 큰 목표를 잡지 않고, 오늘 당장 완성할 수 있는 작은 규모의 실전 목표를 세분화합니다.`,
            estimatedTime: '45분',
            keywords: ['미니 프로젝트 설계', '요구사항 쪼개기', '우선순위 설정'],
            subTasks: [
              `Step 1 (목표 정의): ${cleanTopic} 지식을 활용해 만들 수 있는 작은 결과물(또는 실전 기출 세트) 1개 선정하기`,
              `Step 2 (작업 분해): 전체 과정을 [입력/준비 → 핵심 처리 → 결과 확인] 3단계로 나누어 할 일 목록 적기`,
              `Step 3 (초안 실행): 가장 쉬운 첫 번째 단계부터 30분 타이머를 맞추고 즉시 실행에 옮기기`,
            ],
          },
          {
            title: `핵심 응용 기능 결합 및 스스로 문제 해결(Troubleshooting)하기`,
            description: `검색과 공식 문서를 활용해 막히는 부분을 스스로 뚫어내는 진짜 실력을 기릅니다.`,
            estimatedTime: '60분',
            keywords: ['실전 문제 해결', '공식 문서 검색법', '트러블슈팅 로그'],
            subTasks: [
              `Step 1 (구현/풀이): 앞서 배운 2가지 이상의 핵심 개념을 결합하여 미니 과제의 중심 기능 완성하기`,
              `Step 2 (원인 추적): 막히는 부분이 생기면 바로 정답을 보지 않고 공식 문서나 에러 키워드로 10분간 먼저 탐색하기`,
              `Step 3 (해결 기록): 무엇 때문에 막혔고 어떻게 해결했는지 'Before & After'를 학습 메모에 기록하기`,
            ],
          },
          {
            title: `결과물 자체 검증 및 엣지 케이스(Edge Case) 보완하기`,
            description: `완성한 결과물이나 풀이 과정에 빈틈이 없는지 점검하고 완성도를 한 단계 끌어올립니다.`,
            estimatedTime: '45분',
            keywords: ['품질 점검', '엣지 케이스 테스트', '리팩토링/오답노트'],
            subTasks: [
              `Step 1 (극단값 테스트): 비어 있는 값, 아주 큰 값, 혹은 함정 조건이 주어졌을 때도 정상 동작하는지 확인하기`,
              `Step 2 (구조 개선): 중복되거나 비효율적인 과정을 더 간결한 방법으로 다듬기`,
              `Step 3 (레퍼런스 비교): 모범 답안이나 실무 오픈소스 사례와 내 방식을 비교해 배울 점 2가지 찾기`,
            ],
          },
        ],
      },
      {
        title: `4단계: ${cleanTopic} 심화 확장 및 나만의 요약 리포트 자산화`,
        description: `공부한 내용이 휘발되지 않도록 마크다운 문서로 정리하고 다음 단계의 심화 학습 주제를 연결합니다.`,
        items: [
          {
            title: `실무/실전 심화 주제 맛보기 및 성능·효율성 개선 포인트 학습`,
            description: `기본기를 넘어 현업이나 고득점자들이 신경 쓰는 최적화 포인트와 심화 개념을 파악합니다.`,
            estimatedTime: '50분',
            keywords: ['심화 아키텍처', '성능/효율 최적화', '현업 트렌드'],
            subTasks: [
              `Step 1 (심화 탐색): ${cleanTopic} 분야에서 중·고급자로 넘어가기 위해 자주 언급되는 키워드 3가지 조사하기`,
              `Step 2 (적용 가능성): 내가 만든 미니 과제에 해당 심화 기법을 적용한다면 어디를 고칠 수 있을지 구상하기`,
              `Step 3 (참고 링크 저장): 추후 깊게 읽어볼 양질의 기술 블로그나 공식 레퍼런스 주소를 메모 드로어에 저장하기`,
            ],
          },
          {
            title: `전체 커리큘럼 회고 및 Markdown 학습 리포트 내보내기`,
            description: `지금까지 체크한 항목들과 직접 적은 메모를 하나의 문서로 추출하여 포트폴리오나 개인 노트에 보관합니다.`,
            estimatedTime: '30분',
            keywords: ['학습 회고', 'Markdown 내보내기', 'Notion/Obsidian 아카이빙'],
            subTasks: [
              `Step 1 (최종 점검): 모든 챕터의 체크리스트를 돌아보며 빠뜨린 개념이나 미완료 항목 마무리하기`,
              `Step 2 (문서 추출): 상단의 '마크다운 복사' 또는 '.md 다운로드' 버튼을 눌러 내 학습 기록을 파일로 저장하기`,
              `Step 3 (다음 목표 설정): 연관된 후속 학습 주제로 새 로드맵을 생성하여 지속적인 성장 이어가기`,
            ],
          },
        ],
      },
    ],
  });
}
