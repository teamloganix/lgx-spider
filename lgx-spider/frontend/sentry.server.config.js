import * as Sentry from "@sentry/astro";

const dsn = process.env.PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const environment = process.env.SENTRY_ENVIRONMENT || process.env.APP_ENV || "production";
const release = process.env.SENTRY_RELEASE || process.env.VERSION || undefined;

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
      // Network errors that are often not actionable
      "ECONNREFUSED",
      "ENOTFOUND",
      "ETIMEDOUT",
      // Known third-party errors
      "ResizeObserver loop limit exceeded",
      // Version mismatch errors
      "_captureRequestSession is not a function",
      "Cannot read properties of undefined",
    ],
    
    // Filter out known non-actionable errors
    beforeSend(event, hint) {
      // Filter out non-critical errors first
      if (event.exception) {
        const error = hint.originalException;
        if (error && error.message) {
          // Ignore specific error messages
          if (error.message.includes("Non-Error promise rejection captured")) {
            return null;
          }
          // Ignore Sentry internal errors
          if (
            error.message.includes("_captureRequestSession is not a function") ||
            error.message.includes("isolationScope.setRequestSession is not a function") ||
            error.message.includes("Cannot read properties of undefined (reading 'toString')") ||
            error.message.includes("Cannot read properties of undefined")
          ) {
            return null;
          }
        }
      }
      
      // Don't send errors in development unless explicitly testing
      if (environment === "dev" || environment === "development") {
        // Uncomment to disable Sentry in dev entirely
        // return null;
      }
      
      return event;
    },
  });
}