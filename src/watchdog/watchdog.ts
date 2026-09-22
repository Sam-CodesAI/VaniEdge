/**
 * VaniEdge Voice Platform: Unified Telephony & Streaming Failover Watchdogs
 */

export {
  WatchdogEngine,
  type WatchdogState,
  type WatchdogConfig as StreamWatchdogConfig,
} from "../stream/watchdog.js";

export {
  TelephonyWatchdog,
  type FailoverState,
  type WatchdogConfig as TelephonyWatchdogConfig,
  TwilioCallRedirector,
  type TwilioConfig,
  type RedirectResult,
  generateStreamTwiML,
  generateFallbackTwiML,
  escapeXml,
} from "../telephony/watchdog.js";
