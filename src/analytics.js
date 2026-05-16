const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

let initialized = false;

function hasAnalytics() {
  return typeof window !== "undefined" && Boolean(MEASUREMENT_ID);
}

export function initAnalytics() {
  if (!hasAnalytics() || initialized) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    send_page_view: true,
  });

  initialized = true;
}

export function trackEvent(eventName, params = {}) {
  if (!hasAnalytics() || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}
