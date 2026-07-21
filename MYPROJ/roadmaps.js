/* PathForge — 전공별 상세 로드맵 데이터 (오프라인 폴백 & 렌더 공통 스키마)
 *
 * 로드맵 스키마: { title, intro, steps: [{ label, category, difficulty, estimatedHours, description, topics[] }] }
 * 이 스키마는 server.mjs의 Claude API 응답(structured output)과 동일하게 맞춰져 있어
 * AI 생성 로드맵과 내장 로드맵을 같은 렌더러로 표시할 수 있다.
 *
 * IIFE로 감싸 최상위 const가 전역 렉시컬 스코프를 오염시키지 않도록 한다
 * (클래식 스크립트끼리 같은 이름의 최상위 const는 중복 선언 에러를 낸다).
 */

(() => {
const MAJOR_META = {
  fe:       { label: '프론트엔드', emoji: '🎨', tint: '#e8f2ff' },
  be:       { label: '백엔드',     emoji: '🗄️', tint: '#e7f9f1' },
  devops:   { label: 'DevOps',     emoji: '🚀', tint: '#fff4e5' },
  em:       { label: '임베디드',   emoji: '🔌', tint: '#fff0e8' },
  flutter:  { label: 'Flutter',    emoji: '💙', tint: '#e6f6ff' },
  ios:      { label: 'iOS',        emoji: '🍎', tint: '#f2f2f7' },
  android:  { label: 'Android',    emoji: '🤖', tint: '#e9f8ef' },
  ai:       { label: 'AI',         emoji: '🧠', tint: '#f1ecff' },
  uiux:     { label: 'UI/UX',      emoji: '✨', tint: '#fdeef6' },
  game:     { label: '게임',       emoji: '🎮', tint: '#eae8ff' },
  security: { label: '보안',       emoji: '🛡️', tint: '#ffeef0' },
};

const CATEGORY_LABEL = { concept: '개념', practice: '실습', project: '프로젝트' };
const DIFFICULTY_LABEL = { beginner: '입문', intermediate: '중급', advanced: '심화' };

/** 전공 추론용 키워드 (한/영) */
const MAJOR_KEYWORDS = {
  fe:       ['프론트', '프론트엔드', '웹', '리액트', 'react', '뷰', 'vue', '자바스크립트', 'javascript', 'html', 'css', 'ui개발', '퍼블리싱', '넥스트', 'next'],
  be:       ['백엔드', '서버', 'api', '노드', 'node', '스프링', 'spring', '데이터베이스', 'db', 'sql', '자바', 'java', '파이썬 서버', '장고', 'django', 'nest', 'express'],
  devops:   ['데브옵스', 'devops', '인프라', '배포', '도커', 'docker', '쿠버네티스', 'kubernetes', 'k8s', 'ci/cd', '테라폼', 'terraform', '젠킨스', 'jenkins', 'sre', '파이프라인', '클라우드', 'aws', '운영'],
  em:       ['임베디드', '펌웨어', '하드웨어', 'iot', '아두이노', 'arduino', 'mcu', 'stm', 'c언어', '회로', '라즈베리', 'rtos', '센서', '전자'],
  flutter:  ['플러터', 'flutter', 'dart', '다트', '크로스플랫폼', '크로스 플랫폼'],
  ios:      ['ios', '아이폰', '아이오에스', 'swift', '스위프트', 'swiftui', 'xcode', '애플 앱'],
  android:  ['안드로이드', 'android', '코틀린', 'kotlin', 'jetpack', 'compose', '구글 앱', '갤럭시 앱'],
  ai:       ['ai', '인공지능', '머신러닝', 'ml', '딥러닝', 'deep learning', '데이터 사이언스', 'llm', '모델', '텐서플로', 'pytorch', '파이토치', 'nlp', '컴퓨터비전'],
  uiux:     ['ui/ux', 'uiux', 'ux', 'ui디자인', 'ui 디자인', '디자인', '피그마', 'figma', '사용자경험', '프로토타입', '와이어프레임'],
  game:     ['게임', 'game', '유니티', 'unity', '언리얼', 'unreal', '게임개발', 'c#', '게임엔진'],
  security: ['보안', 'security', '해킹', '해커', '침투', 'pentest', '취약점', '워게임', 'ctf', '포렌식', '암호', '네트워크 보안', '웹 해킹'],
};

const ROADMAPS = {
  fe: {
    title: '프론트엔드 개발자 로드맵',
    intro: '웹 화면을 만드는 개발자예요. HTML/CSS로 시작해 JavaScript, TypeScript, React를 거쳐 실제 배포되는 SPA 포트폴리오까지 만드는 흐름으로 구성했어요.',
    steps: [
      { label: 'HTML / CSS 기초', category: 'concept', difficulty: 'beginner', estimatedHours: 25, description: '웹의 뼈대와 스타일. 시맨틱 마크업으로 구조를 잡고 반응형 레이아웃을 만들 수 있어야 해요.', topics: ['시맨틱 태그', 'Flexbox / Grid', '반응형 미디어쿼리', '박스 모델'] },
      { label: 'JavaScript 핵심', category: 'concept', difficulty: 'beginner', estimatedHours: 45, description: '프론트엔드의 언어. 문법뿐 아니라 비동기와 DOM 조작까지 확실히 잡아야 이후가 수월해요.', topics: ['ES2015+ 문법', 'DOM / 이벤트', 'Promise · async/await', 'fetch로 API 호출'] },
      { label: 'Git & 개발 환경', category: 'practice', difficulty: 'beginner', estimatedHours: 12, description: '협업과 포트폴리오의 필수 도구. GitHub에 코드를 올리고 관리하는 습관을 들여요.', topics: ['Git 브랜치 전략', 'GitHub PR', 'npm / 패키지 관리', 'VS Code 세팅'] },
      { label: 'TypeScript', category: 'concept', difficulty: 'intermediate', estimatedHours: 25, description: '타입으로 안전한 코드를 작성해요. 규모가 커질수록 필수가 되는 기술이에요.', topics: ['기본 타입 · 인터페이스', '제네릭', '유니온 · 타입 가드', 'tsconfig'] },
      { label: 'React', category: 'practice', difficulty: 'intermediate', estimatedHours: 50, description: '컴포넌트 기반 UI 라이브러리. Hooks로 상태와 로직을 다루는 것이 핵심이에요.', topics: ['컴포넌트 · props', 'useState · useEffect', '커스텀 훅', '리스트 · 폼 처리'] },
      { label: '상태관리 & 데이터 패칭', category: 'practice', difficulty: 'intermediate', estimatedHours: 22, description: '실제 앱의 데이터 흐름을 다뤄요. 서버 상태와 전역 상태를 구분하는 감각이 중요해요.', topics: ['TanStack Query', 'Zustand / Redux', '라우팅(React Router)', '로딩 · 에러 처리'] },
      { label: '스타일링 & 접근성', category: 'practice', difficulty: 'intermediate', estimatedHours: 18, description: '보기 좋고 누구나 쓸 수 있는 UI. 디자인 시스템 개념을 익혀요.', topics: ['Tailwind CSS', '컴포넌트 라이브러리', '웹 접근성(a11y)', '반응형 · 다크모드'] },
      { label: 'Next.js & 배포', category: 'project', difficulty: 'advanced', estimatedHours: 30, description: 'SSR/SSG로 실전 웹앱을 만들고 실제 인터넷에 배포해요.', topics: ['App Router', 'SSR / SSG', 'Vercel 배포', '성능 최적화'] },
      { label: '포트폴리오 SPA', category: 'project', difficulty: 'advanced', estimatedHours: 60, description: '기획부터 배포까지 혼자 완성하는 캡스톤. GitHub에 정리해 취업 무기로 만들어요.', topics: ['기획 · 와이어프레임', 'API 연동', '테스트 작성', 'README · 회고'] },
    ],
  },
  be: {
    title: '백엔드 개발자 로드맵',
    intro: '서비스의 데이터와 로직을 책임지는 개발자예요. 언어 기초 → 서버/API → 데이터베이스 → 인증·배포 순으로, 실제 운영 가능한 API 서버를 목표로 해요.',
    steps: [
      { label: '프로그래밍 언어 기초', category: 'concept', difficulty: 'beginner', estimatedHours: 45, description: '백엔드 언어 하나를 깊게. JS/TS, Java, Python 중 하나를 골라 자료구조까지 익혀요.', topics: ['문법 · 함수 · OOP', '기본 자료구조', '예외 처리', '패키지 관리'] },
      { label: 'HTTP & 네트워크', category: 'concept', difficulty: 'beginner', estimatedHours: 18, description: '웹이 동작하는 원리. 요청/응답과 상태코드를 이해해야 API를 설계할 수 있어요.', topics: ['HTTP 메서드 · 상태코드', 'REST 원칙', '쿠키 · 세션', 'CORS'] },
      { label: '서버 프레임워크', category: 'practice', difficulty: 'intermediate', estimatedHours: 35, description: '라우팅과 미들웨어로 API를 만들어요. Express/NestJS, Spring 등에서 하나를 익혀요.', topics: ['라우팅 · 컨트롤러', '미들웨어', '입력 검증', '에러 핸들링'] },
      { label: '데이터베이스 & SQL', category: 'practice', difficulty: 'intermediate', estimatedHours: 35, description: '데이터를 저장하고 조회해요. 관계형 모델링과 쿼리를 확실히 잡아요.', topics: ['SQL 기본 · JOIN', '스키마 · 정규화', '인덱스 기초', 'ORM(Prisma/JPA)'] },
      { label: '인증 & 보안', category: 'practice', difficulty: 'advanced', estimatedHours: 22, description: '로그인과 권한을 안전하게 처리해요. 웹 취약점의 기본도 함께 익혀요.', topics: ['JWT · 세션 인증', 'OAuth 2.0', '비밀번호 해싱', 'OWASP 기초'] },
      { label: '아키텍처 & 테스트', category: 'concept', difficulty: 'advanced', estimatedHours: 25, description: '유지보수하기 좋은 구조와 신뢰할 수 있는 코드. 레이어 분리와 테스트를 익혀요.', topics: ['계층형 아키텍처', '의존성 주입', '단위 · 통합 테스트', '캐싱(Redis)'] },
      { label: '배포 & 인프라 기초', category: 'practice', difficulty: 'advanced', estimatedHours: 25, description: '만든 서버를 실제로 띄워요. 컨테이너와 클라우드 기초를 다뤄요.', topics: ['Docker', '리눅스 명령어', '클라우드(AWS) 배포', '환경변수 · 로깅'] },
      { label: 'API 서버 프로젝트', category: 'project', difficulty: 'advanced', estimatedHours: 60, description: 'DB·인증·배포를 모두 갖춘 실전 백엔드 캡스톤을 완성해요.', topics: ['API 설계 · 문서화', 'DB 연동', 'CI/CD', '부하 · 예외 대응'] },
    ],
  },
  devops: {
    title: 'DevOps 엔지니어 로드맵',
    intro: '개발과 운영을 잇고 배포를 자동화하는 엔지니어예요. 리눅스·Git 기초 위에 컨테이너, CI/CD, 클라우드, 쿠버네티스를 쌓아 무중단 자동 배포 파이프라인을 만드는 것이 목표예요.',
    steps: [
      { label: 'Linux & Shell', category: 'concept', difficulty: 'beginner', estimatedHours: 30, description: '모든 서버의 기반. 커맨드라인과 셸 스크립팅에 익숙해져야 해요.', topics: ['파일 · 권한 · 프로세스', 'bash 스크립팅', 'SSH', '패키지 관리'] },
      { label: 'Git & GitHub', category: 'concept', difficulty: 'beginner', estimatedHours: 15, description: '협업과 자동화의 시작점. 브랜치 전략을 익혀요.', topics: ['브랜치 · 머지', 'Pull Request', '태그 · 릴리스', '.gitignore'] },
      { label: '네트워크 & 클라우드 기초', category: 'concept', difficulty: 'intermediate', estimatedHours: 25, description: '인프라의 언어. IP·포트·DNS와 클라우드 개념을 이해해요.', topics: ['TCP/IP · 포트 · DNS', 'HTTP · 로드밸런서', 'AWS EC2 · S3', 'IAM · 보안그룹'] },
      { label: 'Docker', category: 'practice', difficulty: 'intermediate', estimatedHours: 30, description: '어디서나 똑같이 돌아가는 환경을 만들어요. DevOps의 핵심 도구예요.', topics: ['이미지 · 컨테이너', 'Dockerfile', 'Docker Compose', '레지스트리'] },
      { label: 'CI/CD', category: 'practice', difficulty: 'intermediate', estimatedHours: 28, description: '빌드·테스트·배포를 자동화해요. 커밋만 하면 배포되는 흐름을 만들어요.', topics: ['GitHub Actions', '빌드 · 테스트 자동화', '배포 자동화', '시크릿 관리'] },
      { label: 'IaC (Terraform)', category: 'practice', difficulty: 'advanced', estimatedHours: 28, description: '인프라를 코드로 관리해요. 재현 가능한 환경을 만들어요.', topics: ['Terraform 문법', '상태(state) 관리', '모듈화', '프로비저닝'] },
      { label: 'Kubernetes', category: 'practice', difficulty: 'advanced', estimatedHours: 40, description: '컨테이너를 대규모로 운영해요. 오케스트레이션의 표준이에요.', topics: ['Pod · Deployment', 'Service · Ingress', 'ConfigMap · Secret', '오토스케일링'] },
      { label: '모니터링 & 로깅', category: 'practice', difficulty: 'advanced', estimatedHours: 22, description: '문제를 빠르게 발견하고 대응해요. 관측 가능성을 갖춰요.', topics: ['Prometheus · Grafana', '로그 수집', '알림(Alerting)', '헬스체크'] },
      { label: '자동 배포 파이프라인 캡스톤', category: 'project', difficulty: 'advanced', estimatedHours: 55, description: '앱을 컨테이너화해 클라우드에 무중단 자동 배포하는 파이프라인을 완성해요.', topics: ['Docker화', 'CI/CD 구축', '쿠버네티스 배포', '모니터링 연동'] },
    ],
  },
  em: {
    title: '임베디드(펌웨어/하드웨어) 개발자 로드맵',
    intro: '하드웨어를 직접 제어하는 개발자예요. C언어와 컴퓨터 구조를 바탕으로 MCU 펌웨어, RTOS, IoT까지 다뤄 실제 동작하는 하드웨어를 만들어요.',
    steps: [
      { label: 'C 언어', category: 'concept', difficulty: 'beginner', estimatedHours: 50, description: '임베디드의 핵심 언어. 포인터와 메모리를 손에 익혀야 펌웨어를 다룰 수 있어요.', topics: ['포인터 · 배열', '구조체 · 비트 연산', '메모리 모델', '컴파일 과정'] },
      { label: '디지털 논리 & 전자 기초', category: 'concept', difficulty: 'beginner', estimatedHours: 30, description: '하드웨어의 언어. 회로와 신호를 이해해야 센서·액추에이터를 다뤄요.', topics: ['옴의 법칙 · 회로', '디지털 논리', '멀티미터 · 브레드보드', '데이터시트 읽기'] },
      { label: '컴퓨터 구조', category: 'concept', difficulty: 'intermediate', estimatedHours: 30, description: 'CPU가 코드를 실행하는 방식. 레지스터와 인터럽트가 펌웨어의 기본이에요.', topics: ['레지스터 · 메모리 맵', '인터럽트', '버스 · 클록', '어셈블리 개념'] },
      { label: 'MCU 펌웨어(Arduino/STM32)', category: 'practice', difficulty: 'intermediate', estimatedHours: 45, description: '실제 보드를 제어해요. GPIO로 LED·버튼부터 센서 제어까지 실습해요.', topics: ['GPIO 입출력', 'ADC · PWM', 'UART · I2C · SPI', '타이머'] },
      { label: '센서 & 통신', category: 'practice', difficulty: 'intermediate', estimatedHours: 25, description: '외부 세계와 연결해요. 다양한 센서를 읽고 데이터를 주고받아요.', topics: ['온습도 · 거리 센서', '모터 · 서보 제어', 'UART/I2C 통신', '신호 필터링'] },
      { label: 'RTOS', category: 'practice', difficulty: 'advanced', estimatedHours: 35, description: '여러 작업을 동시에. 실시간 운영체제로 태스크를 관리해요.', topics: ['태스크 · 스케줄링', '세마포어 · 뮤텍스', '큐 · 이벤트', 'FreeRTOS'] },
      { label: 'IoT & 무선', category: 'practice', difficulty: 'advanced', estimatedHours: 28, description: '기기를 인터넷에 연결해요. 무선 통신과 클라우드 연동을 다뤄요.', topics: ['Wi-Fi(ESP32)', 'MQTT', '센서 네트워크', '전력 관리'] },
      { label: '하드웨어 캡스톤', category: 'project', difficulty: 'advanced', estimatedHours: 60, description: '센서·제어·통신을 통합한 실제 동작 제품을 만들어요.', topics: ['회로 설계', '펌웨어 통합', 'PCB · 3D 프린팅', '디버깅 · 시연'] },
    ],
  },
  flutter: {
    title: 'Flutter 앱 개발자 로드맵',
    intro: '하나의 코드로 iOS·Android를 동시에 만드는 개발자예요. Dart 언어와 위젯을 익혀 상태관리, 서버 연동을 거쳐 스토어 출시까지 목표해요.',
    steps: [
      { label: 'Dart 언어', category: 'concept', difficulty: 'beginner', estimatedHours: 30, description: 'Flutter의 언어. 널 안전성과 비동기가 특징이에요.', topics: ['변수 · 함수 · 클래스', 'null-safety', 'Future · async', '컬렉션'] },
      { label: 'Flutter 기초 & 위젯', category: 'concept', difficulty: 'beginner', estimatedHours: 40, description: '모든 것이 위젯. 화면을 구성하는 방법을 익혀요.', topics: ['Stateless/Stateful', '레이아웃 위젯', 'Material · Cupertino', 'setState'] },
      { label: '레이아웃 & 네비게이션', category: 'practice', difficulty: 'intermediate', estimatedHours: 25, description: '여러 화면과 반응형 UI를 다뤄요.', topics: ['Row/Column/Stack', '라우팅(go_router)', 'ListView · Grid', '반응형 대응'] },
      { label: '상태관리', category: 'practice', difficulty: 'intermediate', estimatedHours: 28, description: '앱 데이터의 흐름을 관리해요. Provider/Riverpod을 익혀요.', topics: ['Provider', 'Riverpod', 'Bloc 개념', '상태 분리'] },
      { label: '네트워크 & 로컬 저장', category: 'practice', difficulty: 'intermediate', estimatedHours: 25, description: '서버 API와 통신하고 데이터를 저장해요.', topics: ['http · dio', 'JSON 파싱', 'SharedPreferences', 'SQLite/Hive'] },
      { label: 'Firebase 연동', category: 'practice', difficulty: 'advanced', estimatedHours: 25, description: '백엔드 없이도 인증·DB·푸시를 붙여요.', topics: ['인증(Auth)', 'Firestore', '푸시 알림(FCM)', 'Storage'] },
      { label: '애니메이션 & 성능', category: 'practice', difficulty: 'advanced', estimatedHours: 20, description: '부드러운 UX와 최적화를 익혀요.', topics: ['암시적/명시적 애니메이션', 'Hero', '위젯 리빌드 최적화', 'DevTools'] },
      { label: '앱 출시 프로젝트', category: 'project', difficulty: 'advanced', estimatedHours: 55, description: '실제 앱을 만들어 스토어에 출시해요.', topics: ['앱 아이콘 · 스플래시', '빌드(APK/IPA)', '스토어 심사', '포트폴리오 정리'] },
    ],
  },
  ios: {
    title: 'iOS 개발자 로드맵',
    intro: '아이폰 앱을 만드는 개발자예요. Swift와 SwiftUI를 중심으로 네트워크·데이터·아키텍처를 익혀 App Store 출시까지 목표해요.',
    steps: [
      { label: 'Swift 언어', category: 'concept', difficulty: 'beginner', estimatedHours: 40, description: 'iOS의 언어. 옵셔널과 프로토콜이 핵심이에요.', topics: ['옵셔널', '구조체 · 클래스', '프로토콜', '클로저'] },
      { label: 'Xcode & iOS 기초', category: 'concept', difficulty: 'beginner', estimatedHours: 20, description: '개발 도구와 앱 생명주기를 익혀요.', topics: ['Xcode 사용법', '앱 생명주기', '시뮬레이터', '디버깅'] },
      { label: 'SwiftUI', category: 'practice', difficulty: 'intermediate', estimatedHours: 45, description: '선언형 UI로 화면을 만들어요. 애플의 최신 방식이에요.', topics: ['View · Modifier', 'State · Binding', 'List · NavigationStack', '레이아웃'] },
      { label: '데이터 흐름 & 아키텍처', category: 'practice', difficulty: 'intermediate', estimatedHours: 25, description: '앱 상태를 체계적으로 관리해요.', topics: ['ObservableObject', 'MVVM', 'Combine 개념', '의존성 분리'] },
      { label: '네트워크 & 저장', category: 'practice', difficulty: 'intermediate', estimatedHours: 25, description: 'API 통신과 로컬 데이터 저장을 다뤄요.', topics: ['URLSession · async/await', 'Codable(JSON)', 'SwiftData/Core Data', 'UserDefaults'] },
      { label: '기기 기능 활용', category: 'practice', difficulty: 'advanced', estimatedHours: 22, description: '카메라·위치 등 하드웨어 기능을 써요.', topics: ['권한 처리', '카메라 · 사진', '위치(CoreLocation)', '푸시 알림'] },
      { label: '앱 완성도 & 배포', category: 'practice', difficulty: 'advanced', estimatedHours: 22, description: '테스트와 심사를 거쳐 배포해요.', topics: ['접근성', '단위 테스트', 'TestFlight', 'App Store 심사'] },
      { label: 'App Store 출시 프로젝트', category: 'project', difficulty: 'advanced', estimatedHours: 55, description: '기획부터 출시까지 나만의 앱을 완성해요.', topics: ['앱 기획', 'UI 구현', 'API 연동', '출시 · 회고'] },
    ],
  },
  android: {
    title: 'Android 개발자 로드맵',
    intro: '안드로이드 앱을 만드는 개발자예요. Kotlin과 Jetpack Compose를 중심으로 아키텍처·비동기·데이터를 익혀 Play Store 출시까지 목표해요.',
    steps: [
      { label: 'Kotlin 언어', category: 'concept', difficulty: 'beginner', estimatedHours: 40, description: '안드로이드 공식 언어. 널 안전성과 확장 함수가 특징이에요.', topics: ['변수 · 함수 · 클래스', 'null-safety', '데이터 클래스', '고차 함수 · 람다'] },
      { label: 'Android 기초', category: 'concept', difficulty: 'beginner', estimatedHours: 25, description: '앱 구성요소와 생명주기를 익혀요.', topics: ['Activity · 생명주기', 'Intent', '리소스 · 권한', 'Android Studio'] },
      { label: 'Jetpack Compose', category: 'practice', difficulty: 'intermediate', estimatedHours: 45, description: '선언형 UI 툴킷으로 화면을 만들어요.', topics: ['Composable', 'State · remember', 'Layout · Modifier', 'Navigation'] },
      { label: '아키텍처 & 비동기', category: 'practice', difficulty: 'intermediate', estimatedHours: 28, description: '유지보수 좋은 구조와 비동기 처리를 익혀요.', topics: ['MVVM · ViewModel', 'Coroutine · Flow', 'Repository 패턴', '의존성 주입(Hilt)'] },
      { label: '네트워크 & 로컬 DB', category: 'practice', difficulty: 'intermediate', estimatedHours: 25, description: '서버 통신과 데이터 저장을 다뤄요.', topics: ['Retrofit', 'JSON 파싱', 'Room DB', 'DataStore'] },
      { label: '기기 기능 & 백그라운드', category: 'practice', difficulty: 'advanced', estimatedHours: 22, description: '카메라·알림·백그라운드 작업을 다뤄요.', topics: ['권한 처리', '카메라 · 위치', '알림(Notification)', 'WorkManager'] },
      { label: '테스트 & 최적화', category: 'practice', difficulty: 'advanced', estimatedHours: 20, description: '품질과 성능을 챙겨요.', topics: ['단위 테스트', 'UI 테스트', '성능 프로파일링', 'ProGuard'] },
      { label: 'Play Store 출시 프로젝트', category: 'project', difficulty: 'advanced', estimatedHours: 55, description: '앱을 완성해 Play Store에 출시해요.', topics: ['앱 기획', 'UI · 기능 구현', '서명 · 빌드', '스토어 등록'] },
    ],
  },
  ai: {
    title: 'AI / 머신러닝 개발자 로드맵',
    intro: '데이터로 학습하는 모델을 만드는 개발자예요. Python과 수학 기초 위에 머신러닝·딥러닝을 쌓고, 실제 데이터로 모델을 만들어 서비스에 배포까지 해봐요.',
    steps: [
      { label: 'Python & 데이터 도구', category: 'concept', difficulty: 'beginner', estimatedHours: 35, description: 'AI의 언어. 데이터 처리 라이브러리를 함께 익혀요.', topics: ['Python 문법', 'NumPy', 'Pandas', 'Matplotlib 시각화'] },
      { label: '수학 기초', category: 'concept', difficulty: 'intermediate', estimatedHours: 30, description: '모델을 이해하는 언어. 필요한 만큼 실용적으로 익혀요.', topics: ['선형대수(벡터·행렬)', '미분 · 경사하강', '확률 · 통계', '정규화'] },
      { label: '머신러닝 기초', category: 'practice', difficulty: 'intermediate', estimatedHours: 40, description: '전통적 ML 알고리즘으로 예측 문제를 풀어요.', topics: ['지도 · 비지도 학습', '회귀 · 분류', 'scikit-learn', '과적합 · 평가지표'] },
      { label: '데이터 전처리 & EDA', category: 'practice', difficulty: 'intermediate', estimatedHours: 25, description: '실전 데이터는 지저분해요. 정제와 탐색이 성능을 좌우해요.', topics: ['결측치 · 이상치', '피처 엔지니어링', '데이터 시각화', '교차검증'] },
      { label: '딥러닝', category: 'practice', difficulty: 'advanced', estimatedHours: 45, description: '신경망으로 복잡한 패턴을 학습해요. 프레임워크를 익혀요.', topics: ['신경망 · 역전파', 'PyTorch / TensorFlow', 'CNN(이미지)', '학습 · 튜닝'] },
      { label: '심화 분야 선택', category: 'practice', difficulty: 'advanced', estimatedHours: 35, description: '관심 분야를 정해 깊게 파요.', topics: ['컴퓨터 비전', 'NLP · 트랜스포머', 'LLM 활용 · 파인튜닝', '추천 시스템'] },
      { label: 'MLOps & 배포', category: 'practice', difficulty: 'advanced', estimatedHours: 22, description: '모델을 실제 서비스로 만들어요.', topics: ['모델 저장 · 서빙', 'FastAPI 연동', 'Docker', '실험 관리'] },
      { label: 'AI 캡스톤 프로젝트', category: 'project', difficulty: 'advanced', estimatedHours: 60, description: '데이터 수집부터 배포까지 하나의 AI 서비스를 만들어요.', topics: ['문제 정의 · 데이터', '모델 학습 · 평가', '웹 데모', '결과 발표'] },
    ],
  },
  uiux: {
    title: 'UI/UX 디자이너 로드맵',
    intro: '사용자가 쓰기 좋은 화면을 설계하는 디자이너예요. 디자인 기본기와 UX 리서치, Figma 실무를 거쳐 실제 프로덕트를 디자인한 포트폴리오를 만들어요.',
    steps: [
      { label: '디자인 기본 원리', category: 'concept', difficulty: 'beginner', estimatedHours: 25, description: '좋은 디자인의 규칙. 눈이 아니라 원리로 판단하는 힘을 길러요.', topics: ['레이아웃 · 그리드', '타이포그래피', '색채 이론', '시각적 위계'] },
      { label: 'UX 기초 & 사용자 이해', category: 'concept', difficulty: 'beginner', estimatedHours: 25, description: 'UX는 공감에서 시작해요. 사용자의 문제를 정의해요.', topics: ['UX vs UI', '사용자 리서치', '페르소나', '유저 플로우'] },
      { label: 'Figma 실무', category: 'practice', difficulty: 'intermediate', estimatedHours: 35, description: '업계 표준 툴. 화면을 빠르고 체계적으로 만들어요.', topics: ['프레임 · 오토레이아웃', '컴포넌트 · 배리언트', '스타일 · 변수', '협업 · 코멘트'] },
      { label: '와이어프레임 & 프로토타입', category: 'practice', difficulty: 'intermediate', estimatedHours: 25, description: '아이디어를 눈에 보이게. 인터랙션까지 설계해요.', topics: ['로우/하이 와이어프레임', '인터랙션 설계', '프로토타입 연결', '사용성 테스트'] },
      { label: '디자인 시스템', category: 'practice', difficulty: 'advanced', estimatedHours: 25, description: '일관되고 확장 가능한 디자인. 규칙을 만들어요.', topics: ['컬러 · 타이포 토큰', '컴포넌트 라이브러리', '스페이싱 · 그리드', '문서화'] },
      { label: '모바일 & 반응형', category: 'practice', difficulty: 'intermediate', estimatedHours: 20, description: '기기별 경험을 설계해요.', topics: ['iOS/Android 가이드', '반응형 레이아웃', '터치 · 제스처', '접근성'] },
      { label: '개발자 협업', category: 'concept', difficulty: 'advanced', estimatedHours: 15, description: '디자인이 코드가 되는 과정을 이해해요.', topics: ['핸드오프 · 스펙', '디자인 QA', '기본 HTML/CSS 감각', '커뮤니케이션'] },
      { label: '포트폴리오 프로젝트', category: 'project', difficulty: 'advanced', estimatedHours: 55, description: '문제 정의부터 최종 UI까지, 과정이 보이는 케이스 스터디를 만들어요.', topics: ['문제 · 리서치', '설계 과정', '최종 UI', '케이스 스터디 정리'] },
    ],
  },
  game: {
    title: '게임 개발자 로드맵',
    intro: '직접 노는 게임을 만드는 개발자예요. 프로그래밍과 게임 엔진(Unity)을 익히고, 2D·3D·물리·최적화를 거쳐 완성된 게임을 배포하는 것이 목표예요.',
    steps: [
      { label: '프로그래밍 기초(C#)', category: 'concept', difficulty: 'beginner', estimatedHours: 40, description: 'Unity의 언어. OOP를 확실히 잡아야 게임 로직을 짜요.', topics: ['C# 문법', '클래스 · 상속', '컬렉션', '이벤트 · 델리게이트'] },
      { label: 'Unity 기초', category: 'concept', difficulty: 'beginner', estimatedHours: 35, description: '게임 엔진에 익숙해져요. 씬과 오브젝트 개념을 익혀요.', topics: ['씬 · 게임오브젝트', '컴포넌트', 'MonoBehaviour', 'Prefab'] },
      { label: '2D 게임 만들기', category: 'practice', difficulty: 'intermediate', estimatedHours: 35, description: '작은 2D 게임으로 핵심 루프를 경험해요.', topics: ['스프라이트 · 애니메이션', '입력 처리', '충돌 · 물리 2D', 'UI · 점수'] },
      { label: '게임 물리 & 수학', category: 'concept', difficulty: 'intermediate', estimatedHours: 25, description: '움직임과 충돌의 원리. 벡터를 게임에 활용해요.', topics: ['벡터 연산', 'Rigidbody · 충돌', '레이캐스트', '보간(Lerp)'] },
      { label: '3D & 그래픽', category: 'practice', difficulty: 'advanced', estimatedHours: 35, description: '3D 공간과 카메라, 조명을 다뤄요.', topics: ['3D 좌표 · 카메라', '조명 · 머티리얼', '캐릭터 컨트롤', '애니메이터'] },
      { label: '사운드 · UI · 저장', category: 'practice', difficulty: 'intermediate', estimatedHours: 20, description: '게임의 완성도를 높이는 요소들.', topics: ['사운드', 'UI · 메뉴', '세이브 · 로드', '씬 전환'] },
      { label: '최적화 & 빌드', category: 'practice', difficulty: 'advanced', estimatedHours: 22, description: '부드럽게 돌아가게 만들고 배포해요.', topics: ['프로파일링', '오브젝트 풀링', '플랫폼 빌드', '배포(itch.io 등)'] },
      { label: '게임 캡스톤', category: 'project', difficulty: 'advanced', estimatedHours: 60, description: '기획부터 배포까지 완성된 게임 하나를 만들어요.', topics: ['게임 기획', '핵심 루프 구현', '플레이테스트', '출시 · 시연'] },
    ],
  },
  security: {
    title: '보안(Security) 전문가 로드맵',
    intro: '시스템을 지키기 위해 먼저 공격을 이해하는 전문가예요. 네트워크·시스템 기초 위에 웹/시스템 해킹을 익히고, CTF와 취약점 분석으로 실력을 증명해요.',
    steps: [
      { label: '네트워크 & 시스템 기초', category: 'concept', difficulty: 'beginner', estimatedHours: 35, description: '보안의 토대. 인터넷과 OS가 동작하는 원리를 알아야 지켜요.', topics: ['TCP/IP · HTTP', '리눅스 명령어', '프로세스 · 권한', 'DNS · 포트'] },
      { label: '프로그래밍 & 스크립팅', category: 'concept', difficulty: 'beginner', estimatedHours: 35, description: '도구를 만들고 자동화해요. Python과 C를 익혀요.', topics: ['Python 스크립팅', 'C · 메모리 구조', '정규표현식', '스크립트 자동화'] },
      { label: '웹 해킹 기초', category: 'practice', difficulty: 'intermediate', estimatedHours: 40, description: '가장 흔한 공격 표면. OWASP Top 10을 실습으로 익혀요.', topics: ['SQL Injection', 'XSS · CSRF', '인증 우회', 'Burp Suite'] },
      { label: '시스템 해킹 기초', category: 'practice', difficulty: 'advanced', estimatedHours: 40, description: '메모리 취약점을 이해해요. 저수준 보안의 핵심이에요.', topics: ['버퍼 오버플로', '스택 · 힙', '어셈블리 · gdb', 'ROP 개념'] },
      { label: '암호학 기초', category: 'concept', difficulty: 'intermediate', estimatedHours: 22, description: '데이터를 지키는 수학. 개념과 취약점을 익혀요.', topics: ['대칭 · 비대칭 암호', '해시', 'TLS 개념', '흔한 암호 실수'] },
      { label: 'CTF & 워게임', category: 'practice', difficulty: 'advanced', estimatedHours: 45, description: '실력을 겨루며 성장해요. 문제 풀이가 최고의 훈련이에요.', topics: ['pwnable · webhacking.kr', 'Web · Pwn · Reversing', '포렌식 · 암호', '라이트업 작성'] },
      { label: '방어 & 대응', category: 'concept', difficulty: 'advanced', estimatedHours: 25, description: '공격을 알았으니 방어를 배워요. 실무 관점을 익혀요.', topics: ['보안 코딩', '로그 · 탐지', '취약점 진단', '모의해킹 리포트'] },
      { label: '보안 프로젝트 / CTF 성과', category: 'project', difficulty: 'advanced', estimatedHours: 55, description: '취약점 분석 리포트나 CTF 성과로 실력을 증명해요.', topics: ['취약점 분석 리포트', 'CTF 입상', '보안 도구 제작', '기술 블로그'] },
    ],
  },
};

// 브라우저(window)와 Node(module) 양쪽에서 재사용
const PATHFORGE_DATA = { MAJOR_META, CATEGORY_LABEL, DIFFICULTY_LABEL, MAJOR_KEYWORDS, ROADMAPS };
if (typeof window !== 'undefined') window.PATHFORGE_DATA = PATHFORGE_DATA;
if (typeof module !== 'undefined' && module.exports) module.exports = PATHFORGE_DATA;
})();
