type TrackPayload = Record<string, string | number | boolean | null | undefined>;
type SubscribeMode = "netlify" | "endpoint";
type FormState = "idle" | "loading" | "error" | "success";

const FORM_NAME = "newsletter-subscribe";
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
  const response = await fetch("/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: encodeFormBody(payload),
  });

  if (!response.ok) {
    throw new Error("netlify-submit-failed");
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

function markAllFormsAsSuccess(message: string) {
  const forms = document.querySelectorAll<HTMLFormElement>("[data-subscribe-form]");
  forms.forEach((form) => {
    setFormState(form, "success", message);
  });
}

function initTopicFocus() {
  const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-topic-card]"));
  const steps = Array.from(document.querySelectorAll<HTMLElement>("[data-topic-step]"));

  if (!cards.length || !steps.length) {
    return;
  }

  const updateActiveCard = (currentIndex: number) => {
    cards.forEach((card, index) => {
      if (index === currentIndex) {
        card.dataset.state = "current";
        card.setAttribute("aria-hidden", "false");
        return;
      }

      card.dataset.state = index < currentIndex ? "before" : "after";
      card.setAttribute("aria-hidden", "true");
    });
  };

  updateActiveCard(0);

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

      if (!visibleEntries.length) {
        return;
      }

      const index = Number((visibleEntries[0].target as HTMLElement).dataset.topicIndex || "0");
      updateActiveCard(index);
    },
    {
      threshold: [0.25, 0.5, 0.75],
      rootMargin: "-18% 0px -18% 0px",
    },
  );

  steps.forEach((step) => observer.observe(step));
}

function initSubscribeForms() {
  const { subscribeMode, subscribeEndpoint } = getConfig();
  const forms = Array.from(document.querySelectorAll<HTMLFormElement>("[data-subscribe-form]"));

  if (!forms.length) {
    return;
  }

  if (window.sessionStorage.getItem("redpen:subscribed") === "true") {
    markAllFormsAsSuccess(SUCCESS_MESSAGE);
  }

  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (form.dataset.state === "loading" || form.dataset.state === "success") {
        return;
      }

      const emailInput = form.querySelector<HTMLInputElement>('input[name="email"]');
      const honeypotInput = form.querySelector<HTMLInputElement>('input[name="bot-field"]');
      const formLocation = form.dataset.formLocation || "unknown";
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

        window.sessionStorage.setItem("redpen:subscribed", "true");
        markAllFormsAsSuccess(SUCCESS_MESSAGE);
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

  initTopicFocus();
  initSubscribeForms();
  trackEvent("landing_view", {
    path: window.location.pathname,
    ...getUtmPayload(),
  });
}
