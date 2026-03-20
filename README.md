# 빨간펜 연구소 랜딩 페이지

`빨간펜 연구소`의 뉴스레터 `영양가 없는 마케팅`을 위한 1페이지 이메일 구독 랜딩입니다. 목표는 브랜드를 명확히 보여주고, 방문자가 바로 이해한 뒤 이메일을 남길 수 있게 만드는 것입니다.

## 무엇을 만들었는지
- Astro 기반의 모바일 퍼스트 단일 페이지 랜딩
- 크림 페이퍼 톤, 차콜 텍스트, 딥레드 포인트의 에디토리얼 UI
- 스크롤 시 한 카테고리씩 집중해서 보이는 sticky reveal 섹션
- Hero / 마지막 CTA 공통 구독 폼
- Netlify Forms 기본 저장 구조
- 추후 분석 도구와 외부 구독 서비스로 교체하기 쉬운 클라이언트 어댑터 구조

## 로컬 실행
```bash
npm install
npm run dev
```

기본 주소는 [http://localhost:4321](http://localhost:4321) 입니다.

## 배포 방법
### Netlify에서 가장 빠르게 배포
1. Git 저장소에 이 프로젝트를 올립니다.
2. Netlify에서 `Add new site` → `Import an existing project`를 선택합니다.
3. 빌드 설정은 아래대로 두면 됩니다.

```txt
Build command: npm run build
Publish directory: dist
```

4. 환경변수를 추가합니다.
   - `PUBLIC_SITE_URL=https://발급된-임시주소.netlify.app`
   - `PUBLIC_SUBSCRIBE_MODE=netlify`
5. 배포 후 임시 주소가 발급되면, 같은 값을 `PUBLIC_SITE_URL`에 다시 반영하고 재배포합니다.
6. Netlify 대시보드의 `Forms` 메뉴에서 수집된 이메일을 확인합니다.

`netlify.toml`이 포함되어 있어서, 기본 설정은 자동으로 맞춰집니다.

## 이메일이 어디에 저장되는지
- 기본값은 `Netlify Forms` 입니다.
- 저장되는 핵심 필드:
  - `email`
  - `formLocation`
  - `submittedAt`
  - `path`
  - `utm_source`
  - `utm_medium`
  - `utm_campaign`
  - `utm_content`
  - `utm_term`
- 스팸 방지용 허니팟 필드 `bot-field`도 포함되어 있습니다.

주의:
- 로컬 개발 서버에서는 Netlify Forms가 실제로 저장되지 않습니다.
- 실제 저장은 Netlify에 배포된 뒤부터 동작합니다.

## 환경변수
`.env.example` 기준:

```bash
PUBLIC_SITE_URL=https://your-netlify-site.netlify.app
PUBLIC_SUBSCRIBE_MODE=netlify
PUBLIC_SUBSCRIBE_ENDPOINT=
```

설명:
- `PUBLIC_SITE_URL`: canonical / OG URL 생성에 사용합니다.
- `PUBLIC_SUBSCRIBE_MODE`: `netlify` 또는 `endpoint`
- `PUBLIC_SUBSCRIBE_ENDPOINT`: 나중에 외부 구독 API로 교체할 때 사용하는 엔드포인트

## 나중에 커스텀 도메인 연결 시 수정할 포인트
1. Netlify에서 커스텀 도메인을 연결합니다.
2. `PUBLIC_SITE_URL` 값을 새 도메인으로 바꿉니다.
3. canonical / OG URL이 새 도메인을 가리키도록 재배포합니다.

## 추후 분석 도구 연결 포인트
- 파일: [src/scripts/landing.ts](/Volumes/DATA/redpenlab/src/scripts/landing.ts)
- `trackEvent()` 함수에 GTM, Plausible, Amplitude 같은 분석 도구를 붙이면 됩니다.
- 현재 기본 이벤트:
  - `landing_view`
  - `cta_click`
  - `subscribe_success`

## 실제 사용 카피
### 브랜드 표기
- 빨간펜 연구소
- 영양가 없는 마케팅

### Hero
- 건강시장의 말을 해부하는 뉴스레터
- 성분, 라벨, 광고 문구를 광고보다 먼저 읽는 기준으로 풀어드립니다.
- 무료로 받아보기
- 평일마다 짧게 또는 깊게, 건강시장의 말을 해부합니다.

### 다루는 주제
- 성분과 용량의 진실
- 상식의 탄생
- 라벨과 숫자의 기술
- 광고 해부실
- 대결과 판정

### 발행 구조
- 평일마다 뉴스레터가 도착합니다.
- 어떤 날은 짧고 선명하게,
- 어떤 날은 길고 깊게,
- 건강시장의 말을 해부합니다.

### 구독 성공 메시지
- 구독이 완료됐어요. 이제 건강시장의 말을 메일로 해부해드릴게요.

## 현재 임시인 부분
- 구독 저장은 Netlify Forms를 사용합니다.
- 아직 이메일 자동 발송 시퀀스나 ESP 연동은 하지 않았습니다.
- 오픈그래프 이미지는 간단한 SVG 에셋으로 넣어두었고, 추후 실제 브랜드 비주얼로 교체 가능합니다.
