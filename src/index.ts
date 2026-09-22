/**
 * VaniEdge Voice Platform 🎙️⚡
 * Enterprise Edge Telephony & Multi-Lingual Voice AI with Sub-Second Failover & SutraDB RAG
 */

// Engine: SutraDB Edge Vector & Lexical RAG
export {
  SutraHybridEngine,
  tokenize,
  computeDenseVector,
  cosineSimilarity,
  type KnowledgeDocument,
  type HybridSearchResult,
  type QueryOptions,
} from "./engine/sutradb.js";

// Telephony Infrastructure & Signatures
export {
  validateTwilioSignature,
  computeTwilioSignature,
} from "./telephony/signature.js";

export {
  TwilioClient,
} from "./telephony/client.js";

export {
  generateStreamTwiML,
  generateFallbackTwiML,
  escapeXml,
  type StreamTwiMLOptions,
  type FallbackTwiMLOptions,
} from "./telephony/twiml.js";

// Stream Bridge & Watchdog
export {
  StreamBridge,
  type StreamBridgeOptions,
} from "./stream/bridge.js";

export {
  WatchdogEngine,
  type WatchdogState,
  type WatchdogConfig,
} from "./stream/watchdog.js";

export {
  TelephonyWatchdog,
  type FailoverState,
  TwilioCallRedirector,
} from "./telephony/watchdog.js";

// Telemetry & Metrics
export {
  MetricsCollector,
  type LatencyRecord,
  type FailoverEvent,
} from "./telemetry/metrics.js";

// Autonomous Ticket & Dispatch
export {
  TicketDispatcher,
  generateChecksum,
  generateSmsConfirmation,
  phoneMatches,
  normalizePhone,
  type TicketRequest,
  type TicketRecord,
  type TicketStatus,
  type SupportedLanguage,
} from "./dispatch/tickets.js";

// Universal Edge & Node HTTP Router
export {
  createVaniEdgeHandler,
  type VaniEdgeServerConfig,
} from "./server.js";

// Mission Control Dashboard
export {
  renderDashboardHtml,
} from "./dashboard/html.js";

// Cloudflare Worker Handler
import worker from "./worker.js";
export { worker };
export default worker;
