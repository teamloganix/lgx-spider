import * as Sentry from "@sentry/astro";

// Try multiple ways to get the DSN
const dsn = import.meta.env.PUBLIC_SENTRY_DSN || 
            import.meta.env.SENTRY_DSN ||
            // Fallback to hardcoded DSN if env var not set (for backward compatibility)
            "https://5a9475088ae2b46c4f8b06b0ab3e1f94@o4510384535830528.ingest.us.sentry.io/4510384537010176";
const environment = import.meta.env.SENTRY_ENVIRONMENT || import.meta.env.APP_ENV || "production";
const release = import.meta.env.SENTRY_RELEASE || import.meta.env.VERSION || undefined;

// Debug logging (only in development)
if (typeof window !== "undefined" && (environment === "dev" || environment === "development")) {
  console.log("[Sentry Client Config] DSN:", dsn ? "✓ Set" : "✗ Missing");
  console.log("[Sentry Client Config] Environment:", environment);
  console.log("[Sentry Client Config] Release:", release);
}

// Only initialize Sentry if DSN is provided
if (dsn) {
  Sentry.init({
    dsn,
    environment,
    release,
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/astro/configuration/options/#sendDefaultPii
    sendDefaultPii: true,
    
    // Performance monitoring
    tracesSampleRate: environment === "production" ? 0.1 : 1.0, // 10% in prod, 100% in dev
    
    // Error filtering - ignore common non-critical errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      "originalCreateNotification",
      "canvas.contentDocument",
      "MyApp_RemoveAllHighlights",
      "atomicFindClose",
      // Network errors that are often not actionable
      "NetworkError",
      "Network request failed",
      // Known third-party errors
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
    ],
    
    // Filter out known non-actionable errors
    beforeSend(event, hint) {
      // Don't send errors in development unless explicitly testing
      if (environment === "dev" || environment === "development") {
        // Optionally log to console in dev
        console.error("Sentry Event (dev mode):", event);
        // Return null to prevent sending in dev, or return event to send
        // return null; // Uncomment to disable Sentry in dev
      }
      
      // Filter out 404s and other non-critical errors if needed
      if (event.exception) {
        const error = hint.originalException;
        if (error && error.message) {
          // Example: Ignore specific error messages
          if (error.message.includes("Non-Error promise rejection captured")) {
            return null;
          }
        }
      }
      
      return event;
    },
  });
}