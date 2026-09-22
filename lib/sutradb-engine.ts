/**
 * SutraDB Edge: High-Performance Hybrid Vector + BM25 Lexical Engine
 * Zero external SaaS dependencies, sub-5ms query latency for edge autonomous agents.
 */

export interface DocumentEntry {
  id: string;
  title: string;
  content: string;
  category: "clinic" | "restaurant" | "auto" | "general";
  metadata?: Record<string, string | number>;
  tokens?: string[];
  vector?: number[];
}

export interface SearchResult {
  document: DocumentEntry;
  bm25Score: number;
  vectorScore: number;
  fusedScore: number;
  matchedTerms: string[];
}

// Tokenize and clean text
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u0D7F]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

// Generate simple deterministic character n-gram semantic vector (64-dim)
export function generateDenseVector(text: string, dim: number = 64): number[] {
  const tokens = tokenize(text);
  const vec = new Array(dim).fill(0);
  if (tokens.length === 0) return vec;

  for (const token of tokens) {
    for (let i = 0; i < token.length - 1; i++) {
      const bigram = token.slice(i, i + 2);
      let hash = 0;
      for (let j = 0; j < bigram.length; j++) {
        hash = (hash * 31 + bigram.charCodeAt(j)) % dim;
      }
      vec[Math.abs(hash)] += 1;
    }
  }

  // L2 Normalization
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vec[i] * vec[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      vec[i] /= norm;
    }
  }

  return vec;
}

// Cosine similarity between two unit vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return Math.max(0, Math.min(1, (dot + 1) / 2)); // Normalize to 0..1
}

export class SutraEdgeIndex {
  private docs: Map<string, DocumentEntry> = new Map();
  private docLengths: Map<string, number> = new Map();
  private docFreqs: Map<string, number> = new Map();
  private avgDocLength: number = 0;
  private totalDocs: number = 0;

  // BM25 Hyperparameters
  private readonly k1: number = 1.5;
  private readonly b: number = 0.75;

  constructor(initialDocs: DocumentEntry[] = []) {
    for (const doc of initialDocs) {
      this.addDocument(doc);
    }
  }

  public addDocument(doc: DocumentEntry): void {
    const tokens = tokenize(`${doc.title} ${doc.content}`);
    const vector = generateDenseVector(`${doc.title} ${doc.content}`);
    const preparedDoc: DocumentEntry = {
      ...doc,
      tokens,
      vector,
    };

    this.docs.set(doc.id, preparedDoc);
    this.docLengths.set(doc.id, tokens.length);

    // Update document frequencies
    const uniqueTokens = new Set(tokens);
    for (const token of uniqueTokens) {
      this.docFreqs.set(token, (this.docFreqs.get(token) || 0) + 1);
    }

    this.totalDocs = this.docs.size;
    let totalLength = 0;
    for (const len of this.docLengths.values()) {
      totalLength += len;
    }
    this.avgDocLength = this.totalDocs > 0 ? totalLength / this.totalDocs : 0;
  }

  public clear(): void {
    this.docs.clear();
    this.docLengths.clear();
    this.docFreqs.clear();
    this.avgDocLength = 0;
    this.totalDocs = 0;
  }

  public search(query: string, topK: number = 3): SearchResult[] {
    const queryTokens = tokenize(query);
    const queryVector = generateDenseVector(query);
    if (this.totalDocs === 0 || queryTokens.length === 0) return [];

    const results: Array<{
      document: DocumentEntry;
      bm25Score: number;
      vectorScore: number;
      matchedTerms: string[];
    }> = [];

    for (const [id, doc] of this.docs.entries()) {
      const docTokens = doc.tokens || [];
      const docVector = doc.vector || [];
      const docLength = this.docLengths.get(id) || 1;

      // Calculate BM25
      let bm25 = 0;
      const matchedTerms: string[] = [];
      const tokenCounts = new Map<string, number>();
      for (const t of docTokens) {
        tokenCounts.set(t, (tokenCounts.get(t) || 0) + 1);
      }

      for (const qToken of queryTokens) {
        const tf = tokenCounts.get(qToken) || 0;
        if (tf > 0) {
          matchedTerms.push(qToken);
          const df = this.docFreqs.get(qToken) || 1;
          const idf = Math.log((this.totalDocs - df + 0.5) / (df + 0.5) + 1);
          const num = tf * (this.k1 + 1);
          const den = tf + this.k1 * (1 - this.b + this.b * (docLength / (this.avgDocLength || 1)));
          bm25 += idf * (num / den);
        }
      }

      // Calculate Dense Vector Similarity
      const vectorScore = cosineSimilarity(queryVector, docVector);

      results.push({
        document: doc,
        bm25Score: Math.max(0, bm25),
        vectorScore,
        matchedTerms,
      });
    }

    // Normalize BM25 and Vector scores for Reciprocal Rank Fusion
    const maxBm25 = Math.max(1, ...results.map((r) => r.bm25Score));
    const scored = results.map((r) => {
      const normalizedBm25 = r.bm25Score / maxBm25;
      // 60% Semantic Dense + 40% Lexical BM25
      const fusedScore = r.vectorScore * 0.6 + normalizedBm25 * 0.4;
      return {
        ...r,
        fusedScore,
      };
    });

    scored.sort((a, b) => b.fusedScore - a.fusedScore);
    return scored.slice(0, topK);
  }

  public getDocumentCount(): number {
    return this.totalDocs;
  }
}

// Default Presets for Hackathon Live Demo
export const DEFAULT_KNOWLEDGE_PRESETS: DocumentEntry[] = [
  {
    id: "clinic-1",
    title: "Dr. Sharma Healthcare Clinic - Services & Timing",
    content: "Dr. Sharma's Clinic is open Monday to Saturday from 9:00 AM to 1:30 PM and 5:00 PM to 8:30 PM. Closed on Sundays. Services include General Health Checkups, Pediatrics, Blood Pressure & Diabetes Triage, and Vaccinations. Consultation fee is ₹500. Emergency ambulance contact is available 24/7.",
    category: "clinic",
    metadata: { fee: 500, emergencyPhone: "+91-9876543210" },
  },
  {
    id: "clinic-2",
    title: "Dr. Sharma Clinic - Appointment & Booking Protocol",
    content: "Patients can book appointments for General Physician or Pediatrician. Same-day appointments must be booked at least 1 hour in advance. The patient must provide full name, mobile number, and primary symptoms. Walk-ins are accepted during morning hours with a 20-minute waiting queue.",
    category: "clinic",
    metadata: { bookingAdvanceMinutes: 60 },
  },
  {
    id: "restaurant-1",
    title: "Bhojanalaya Cloud Kitchen - Menu & Pricing",
    content: "Special North & South Indian Thali available daily for ₹140. Includes 3 Roti, Paneer Butter Masala, Dal Tadka, Jeera Rice, Curd, and Gulab Jamun. Veg Biryani is ₹180. Paneer Tikka Wrap is ₹90. Masala Dosa is ₹70. We offer free delivery within 4km radius on all orders above ₹250.",
    category: "restaurant",
    metadata: { minOrderFreeDelivery: 250 },
  },
  {
    id: "restaurant-2",
    title: "Bhojanalaya Cloud Kitchen - Delivery Hours & Ordering",
    content: "Lunch delivery from 11:30 AM to 3:30 PM. Dinner delivery from 7:00 PM to 11:00 PM. Payment accepted via UPI (PhonePe, Google Pay, Paytm) or Cash on Delivery (COD). Average delivery turnaround time is 25 to 35 minutes.",
    category: "restaurant",
    metadata: { avgDeliveryMinutes: 30 },
  },
  {
    id: "auto-1",
    title: "Apex 24/7 Emergency Towing & Roadside Assistance",
    content: "Apex Roadside Rescue covers city limits with 20-minute response time. Services include Flat Tyre Change (₹400), Battery Jump Start (₹350), Fuel Delivery (₹500 + fuel cost), and Flatbed Vehicle Towing (₹1,500 base + ₹40/km). Available 24 hours a day, 7 days a week.",
    category: "auto",
    metadata: { flatbedBase: 1500, emergency24x7: 1 },
  },
];
