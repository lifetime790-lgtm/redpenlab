export type CategoryItem = {
  title: string;
  description: string;
};

export type SampleCard = {
  category: string;
  title: string;
  preview: string[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export const siteMeta = {
  title: "건강시장의 말을 해부하는 뉴스레터 | 영양가 없는 마케팅",
  description:
    "빨간펜 연구소의 뉴스레터 영양가 없는 마케팅. 성분, 라벨, 광고 문구를 광고보다 먼저 읽는 기준으로 풀어드립니다.",
};

export const brand = {
  studio: "빨간펜 연구소",
  newsletter: "영양가 없는 마케팅",
  message: "건강시장의 말을 해부한다",
};

export const hero = {
  eyebrow: "빨간펜 연구소 · 영양가 없는 마케팅",
  headline: "건강시장의 말을 해부하는 뉴스레터",
  subcopy: "성분, 라벨, 광고 문구를 광고보다 먼저 읽는 기준으로 풀어드립니다.",
  cta: "무료로 받아보기",
  note: "평일마다 짧게 또는 깊게, 건강시장의 말을 해부합니다.",
};

export const intro = {
  eyebrow: "뉴스레터 소개",
  title: "인스타는 질문을 던지고, 뉴스레터는 본편을 보냅니다.",
  description:
    "피드에서 멈칫하게 만든 질문을, 뉴스레터에서는 근거와 기준으로 더 길게 풀어냅니다.",
  cards: [
    {
      label: "Instagram",
      title: "질문을 던집니다",
      text: "인스타에서는 익숙한 표현과 상식을 다시 보게 만드는 질문을 먼저 던집니다.",
    },
    {
      label: "Newsletter",
      title: "본편을 보냅니다",
      text: "뉴스레터에서는 그 질문이 어디서 시작됐고, 무엇을 기준으로 읽어야 하는지 끝까지 해부합니다.",
    },
  ],
};

export const categories: CategoryItem[] = [
  {
    title: "성분과 용량의 진실",
    description: "익숙한 성분 이름보다, 실제로 봐야 할 용량·형태·조건을 짚습니다.",
  },
  {
    title: "상식의 탄생",
    description: "너무 당연해서 의심하지 않았던 건강 상식이 어떻게 만들어졌는지 해부합니다.",
  },
  {
    title: "라벨과 숫자의 기술",
    description: "제로, 하루치, 고단백 같은 표현이 어떻게 인상을 만드는지 읽어냅니다.",
  },
  {
    title: "광고 해부실",
    description: "좋아 보이는 문장이 어떤 불안과 욕망을 건드리는지 차분하게 뜯어봅니다.",
  },
  {
    title: "대결과 판정",
    description: "A와 B 중 무엇이 더 낫냐는 질문을, 상황과 조건에 따라 다시 판정합니다.",
  },
];

export const issueStructure = {
  eyebrow: "발행 구조",
  title: "평일마다, 짧게 또는 깊게 보냅니다.",
  description:
    "한 번은 짧고 선명하게, 또 한 번은 길고 깊게. 매일 같은 형식이 아니라, 읽어야 할 만큼만 정확하게 보냅니다.",
  lines: [
    "평일마다 뉴스레터가 도착합니다.",
    "어떤 날은 짧고 선명하게,",
    "어떤 날은 길고 깊게,",
    "건강시장의 말을 해부합니다.",
  ],
  modes: [
    {
      label: "Mini",
      title: "짧게 판독하는 날",
      text: "표현 하나, 숫자 하나, 라벨 하나를 빠르게 읽어내는 날입니다.",
    },
    {
      label: "Full",
      title: "깊게 해부하는 날",
      text: "상식과 광고 문구의 배경, 생략된 조건, 비교 기준까지 차분히 따라갑니다.",
    },
  ],
};

export const samples: SampleCard[] = [
  {
    category: "라벨과 숫자의 기술",
    title: "제로는 왜 0처럼 들릴까",
    preview: [
      "제로라는 말은 숫자처럼 보이지만, 실제로는 인상을 먼저 만드는 표현일 때가 많습니다.",
      "문제는 0이라는 단어가 아니라, 그 숫자가 어떤 기준 위에 서 있는지 잘 보이지 않는다는 점입니다.",
    ],
  },
  {
    category: "광고 해부실",
    title: "하루야채는 왜 하루치처럼 들릴까",
    preview: [
      "좋아 보이는 문장은 종종 설명보다 안심을 먼저 팝니다.",
      "이럴수록 문구가 주는 기분보다, 그 말이 생략한 조건을 먼저 봐야 합니다.",
    ],
  },
];

export const audience = {
  eyebrow: "이런 사람에게 맞아요",
  title: "기분보다 기준으로 읽고 싶은 사람에게 맞습니다.",
  items: [
    "성분표를 봐도 어디를 먼저 봐야 할지 늘 헷갈렸다면",
    "광고 문구를 그대로 믿기 전에 한 번 더 읽는 기준이 필요했다면",
    "건강 정보를 내 기준으로 해석하고 싶었다면",
  ],
  closing: "이 뉴스레터가 잘 맞습니다.",
};

export const faq: FaqItem[] = [
  {
    question: "제품 추천 계정인가요?",
    answer: "아니요. 제품보다 먼저 읽는 기준을 이야기합니다.",
  },
  {
    question: "왜 뉴스레터까지 하나요?",
    answer: "인스타에선 질문을 던지고, 뉴스레터에선 더 깊게 해부하기 위해서입니다.",
  },
  {
    question: "어떤 내용을 다루나요?",
    answer: "성분, 라벨, 광고 문구, 건강 상식, 비교 판정을 중심으로 다룹니다.",
  },
  {
    question: "얼마나 자주 발행하나요?",
    answer: "평일 기준으로 발행합니다.",
  },
];

export const finalCta = {
  eyebrow: "마지막 CTA",
  title: "이제 건강시장의 말을, 광고보다 먼저 읽어보세요.",
  description: "평일마다 짧게 또는 깊게, 건강시장의 말을 해부합니다.",
};

export const formCopy = {
  placeholder: "이메일 주소를 입력해주세요",
  success: "구독이 완료됐어요. 이제 건강시장의 말을 메일로 해부해드릴게요.",
  loading: "입력 내용을 확인하고 있어요.",
  invalid: "이메일 주소를 한 번만 다시 확인해주세요.",
  invalidFormat: "입력한 주소 형식이 맞는지 확인해볼까요?",
  saveError: "잠깐 문제가 생겼어요. 조금 뒤에 다시 시도해주세요.",
  unknownError: "지금은 저장을 마치지 못했어요. 잠시 뒤에 다시 시도해주세요.",
};
