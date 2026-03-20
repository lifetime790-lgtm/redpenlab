type TrackPayload = Record<string, string | number | boolean | null | undefined>;
type SubscribeMode = "netlify" | "endpoint";
type FormState = "idle" | "loading" | "error" | "success";

const FORM_NAME = "newsletter-subscribe";
const NETLIFY_FORM_PATH = "/netlify-form.html";
const SUCCESS_MESSAGE = "구독이 완료됐어요. 이제 건강시장의 말을 메일로 해부해드릴게요.";
const INVALID_MESSAGE = "이메일 주소를 한 번만 다시 확인해주세요.";
const INVALID_FORMAT_MESSAGE = "입력한 주소 형식이 맞는지 확인해볼까요?";
const SAVE_ERROR_MESSAGE = "잠깐 문제가 생겼어요. 조금 뒤에 다시 시도해주세요.";
const UNKNOWN_ERROR_MESSAGE = "지금은 저장을 마치지 못했어요. 잠시 뒤에 다시 시도해주세요.";
const LOADING_MESSAGE = "입력 내용을 확인하고 있어요.";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

let initialized = false;

function encodeFormBody(payload: Record<string, string>) {
  return Object.entries(payload)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

function getConfig() {
  const body = document.body;

  return {
    subscribeMode: (body.dataset.subscribeMode || "netlify") as SubscribeMode,
    subscribeEndpoint: body.dataset.subscribeEndpoint || "",
  };
}

function getUtmPayload() {
  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
  };
}

function trackEvent(event: string, detail: TrackPayload = {}) {
  const payload = { event, ...detail };
  const withDataLayer = window as Window & {
    dataLayer?: Array<Record<string, unknown>>;
  };

  window.dispatchEvent(new CustomEvent("redpen:track", { detail: payload }));

  if (Array.isArray(withDataLayer.dataLayer)) {
    withDataLayer.dataLayer.push(payload);
  }

  if (import.meta.env.DEV) {
    console.info(`[track] ${event}`, payload);
  }
}

function setDisabledState(form: HTMLFormElement, disabled: boolean) {
  const elements = form.querySelectorAll<HTMLInputElement | HTMLButtonElement>("input, button");
  elements.forEach((element) => {
    if (element.name === "bot-field") {
      return;
    }
    element.disabled = disabled;
  });
}

function setFormState(form: HTMLFormElement, state: FormState, message = "") {
  const status = form.querySelector<HTMLElement>("[data-form-status]");
  form.dataset.state = state;

  if (status) {
    status.textContent = message;
    status.dataset.status = state;
  }

  if (state === "loading") {
    setDisabledState(form, true);
    return;
  }

  if (state === "success") {
    setDisabledState(form, true);
    return;
  }

  setDisabledState(form, false);
}

function syncHiddenFields(form: HTMLFormElement, payload: Record<string, string>) {
  Object.entries(payload).forEach(([key, value]) => {
    const field = form.querySelector<HTMLInputElement>(`input[name="${key}"]`);
    if (field) {
      field.value = value;
    }
  });
}

async function submitViaNetlify(payload: Record<string, string>) {
  const response = await fetch(NETLIFY_FORM_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: encodeFormBody(payload),
  });

  if (!response.ok) {
    throw new Error(`netlify-submit-failed:${response.status}`);
  }
}

async function submitViaEndpoint(payload: Record<string, string>, endpoint: string) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(response.status >= 500 ? "endpoint-failed" : "endpoint-invalid");
  }
}

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function isEditableTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function initTopicCarousel() {
  const carousel = document.querySelector<HTMLElement>("[data-topic-carousel]");
  const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-topic-card]"));
  const dots = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-topic-dot]"));
  const prevButton = document.querySelector<HTMLButtonElement>("[data-topic-prev]");
  const nextButton = document.querySelector<HTMLButtonElement>("[data-topic-next]");
  const current = document.querySelector<HTMLElement>("[data-topic-current]");

  if (!carousel || !cards.length) {
    return;
  }

  let activeIndex = 0;
  let locked = false;
  let lockTimeout = 0;

  const canUseWheelPaging = () =>
    window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const syncActive = (index: number) => {
    activeIndex = index;

    if (current) {
      current.textContent = formatIndex(index);
    }

    dots.forEach((dot, dotIndex) => {
      dot.dataset.active = dotIndex === index ? "true" : "false";
    });

    if (prevButton) {
      prevButton.disabled = index === 0;
    }

    if (nextButton) {
      nextButton.disabled = index === cards.length - 1;
    }
  };

  const scrollToCard = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, cards.length - 1));
    carousel.scrollTo({
      left: cards[nextIndex].offsetLeft,
      behavior: "smooth",
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

      if (!visibleEntries.length) {
        return;
      }

      const index = cards.indexOf(visibleEntries[0].target as HTMLElement);
      if (index >= 0) {
        syncActive(index);
      }
    },
    {
      root: carousel,
      threshold: [0.55, 0.72, 0.9],
    },
  );

  cards.forEach((card) => observer.observe(card));
  syncActive(0);

  prevButton?.addEventListener("click", () => scrollToCard(activeIndex - 1));
  nextButton?.addEventListener("click", () => scrollToCard(activeIndex + 1));

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => scrollToCard(index));
  });

  carousel.addEventListener(
    "wheel",
    (event) => {
      if (!canUseWheelPaging() || event.ctrlKey || event.metaKey || isEditableTarget(event.target)) {
        return;
      }

      const directionSource =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;

      if (Math.abs(directionSource) < 18) {
        return;
      }

      const nextIndex = activeIndex + (directionSource > 0 ? 1 : -1);
      if (nextIndex < 0 || nextIndex >= cards.length) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (locked) {
        return;
      }

      locked = true;
      scrollToCard(nextIndex);
      window.clearTimeout(lockTimeout);
      lockTimeout = window.setTimeout(() => {
        locked = false;
      }, 700);
    },
    { passive: false },
  );

  carousel.addEventListener("keydown", (event) => {
    if (isEditableTarget(event.target)) {
      return;
    }

    let targetIndex: number | null = null;

    switch (event.key) {
      case "ArrowRight":
        targetIndex = activeIndex + 1;
        break;
      case "ArrowLeft":
        targetIndex = activeIndex - 1;
        break;
      case "Home":
        targetIndex = 0;
        break;
      case "End":
        targetIndex = cards.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    scrollToCard(targetIndex);
  });
}

function initPanelNavigation() {
  const shell = document.querySelector<HTMLElement>("[data-slide-shell]");
  const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-panel]"));

  if (!shell || !panels.length) {
    return;
  }

  const currentPanel = document.querySelector<HTMLElement>("[data-current-panel]");
  const currentLabel = document.querySelector<HTMLElement>("[data-current-label]");
  const totalPanels = document.querySelectorAll<HTMLElement>("[data-total-panels]");
  let activeIndex = 0;
  let locked = false;
  let lockTimeout = 0;

  const canUsePagedScroll = () =>
    window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const syncProgress = (index: number) => {
    activeIndex = index;
    if (currentPanel) {
      currentPanel.textContent = formatIndex(index);
    }

    if (currentLabel) {
      currentLabel.textContent = panels[index].dataset.panelLabel || formatIndex(index);
    }

    totalPanels.forEach((node) => {
      node.textContent = String(panels.length).padStart(2, "0");
    });
  };

  const scrollToPanel = (index: number) => {
    const nextIndex = Math.max(0, Math.min(index, panels.length - 1));
    const target = panels[nextIndex];

    shell.scrollTo({
      top: target.offsetTop,
      behavior: "smooth",
    });
  };

  syncProgress(0);

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

      if (!visibleEntries.length) {
        return;
      }

      const index = panels.indexOf(visibleEntries[0].target as HTMLElement);
      if (index >= 0) {
        syncProgress(index);
      }
    },
    {
      root: shell,
      threshold: [0.45, 0.65, 0.85],
    },
  );

  panels.forEach((panel) => observer.observe(panel));

  shell.addEventListener(
    "wheel",
    (event) => {
      if (!canUsePagedScroll() || event.ctrlKey || event.metaKey || isEditableTarget(event.target)) {
        return;
      }

      event.preventDefault();

      if (locked || Math.abs(event.deltaY) < 18) {
        return;
      }

      const nextIndex = activeIndex + (event.deltaY > 0 ? 1 : -1);
      if (nextIndex === activeIndex || nextIndex < 0 || nextIndex >= panels.length) {
        return;
      }

      locked = true;
      scrollToPanel(nextIndex);
      window.clearTimeout(lockTimeout);
      lockTimeout = window.setTimeout(() => {
        locked = false;
      }, 760);
    },
    { passive: false },
  );

  window.addEventListener("keydown", (event) => {
    if (!canUsePagedScroll() || isEditableTarget(event.target)) {
      return;
    }

    let targetIndex: number | null = null;

    switch (event.key) {
      case "ArrowDown":
      case "PageDown":
        targetIndex = activeIndex + 1;
        break;
      case "ArrowUp":
      case "PageUp":
        targetIndex = activeIndex - 1;
        break;
      case "Home":
        targetIndex = 0;
        break;
      case "End":
        targetIndex = panels.length - 1;
        break;
      case " ":
        targetIndex = event.shiftKey ? activeIndex - 1 : activeIndex + 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    scrollToPanel(targetIndex);
  });
}

function initSubscribeForms() {
  const { subscribeMode, subscribeEndpoint } = getConfig();
  const forms = Array.from(document.querySelectorAll<HTMLFormElement>("[data-subscribe-form]"));

  if (!forms.length) {
    return;
  }

  window.sessionStorage.removeItem("redpen:subscribed");

  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (form.dataset.state === "loading" || form.dataset.state === "success") {
        return;
      }

      const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
      const nicknameInput = form.querySelector<HTMLInputElement>('input[name="nickname"]');
      const honeypotInput = form.querySelector<HTMLInputElement>('input[name="bot-field"]');
      const formLocation = form.dataset.formLocation || "unknown";
      const nickname = nicknameInput?.value.trim() || "";
      const email = emailInput?.value.trim() || "";

      if (!email) {
        setFormState(form, "error", INVALID_MESSAGE);
        emailInput?.focus();
        return;
      }

      if (!EMAIL_REGEX.test(email)) {
        setFormState(form, "error", INVALID_FORMAT_MESSAGE);
        emailInput?.focus();
        return;
      }

      if (honeypotInput?.value.trim()) {
        setFormState(form, "success", SUCCESS_MESSAGE);
        return;
      }

      const utmPayload = getUtmPayload();
      const payload = {
        "form-name": FORM_NAME,
        nickname,
        email,
        formLocation,
        submittedAt: new Date().toISOString(),
        path: `${window.location.pathname}${window.location.search}`,
        ...utmPayload,
        "bot-field": "",
      };

      syncHiddenFields(form, payload);
      setFormState(form, "loading", LOADING_MESSAGE);
      trackEvent("cta_click", {
        formLocation,
        path: window.location.pathname,
        ...utmPayload,
      });

      try {
        if (subscribeMode === "endpoint") {
          if (!subscribeEndpoint) {
            throw new Error("missing-endpoint");
          }
          await submitViaEndpoint(payload, subscribeEndpoint);
        } else {
          await submitViaNetlify(payload);
        }

        setFormState(form, "success", SUCCESS_MESSAGE);
        trackEvent("subscribe_success", {
          formLocation,
          path: window.location.pathname,
          ...utmPayload,
        });
        } catch (error) {
          if (error instanceof TypeError) {
            setFormState(form, "error", SAVE_ERROR_MESSAGE);
            return;
          }

          if (error instanceof Error && error.message === "endpoint-invalid") {
            setFormState(form, "error", INVALID_FORMAT_MESSAGE);
            return;
          }

          if (error instanceof Error && error.message.startsWith("netlify-submit-failed:404")) {
            setFormState(form, "error", SAVE_ERROR_MESSAGE);
            return;
          }

          if (error instanceof Error && error.message === "missing-endpoint") {
            setFormState(form, "error", UNKNOWN_ERROR_MESSAGE);
            return;
          }

        setFormState(form, "error", SAVE_ERROR_MESSAGE);
      }
    });
  });
}

export function setupLandingPage() {
  if (initialized) {
    return;
  }

  initialized = true;

  initTopicCarousel();
  initPanelNavigation();
  initSubscribeForms();
  trackEvent("landing_view", {
    path: window.location.pathname,
    ...getUtmPayload(),
  });
}
