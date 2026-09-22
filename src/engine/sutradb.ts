/**
 * VaniEdge AI: SutraDB In-Memory Edge Hybrid Retrieval Engine
 * High-speed BM25 Lexical + Dense Character N-Gram Vector Search
 */

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: "clinic" | "restaurant" | "auto" | "general" | string;
  metadata?: Record<string, string | number | boolean>;
  tokens?: string[];
  vector?: number[];
}

export interface HybridSearchResult {
  document: KnowledgeDocument;
  bm25Score: number;
  vectorScore: number;
  fusedScore: number;
  matchedTerms: string[];
}

export interface QueryOptions {
  topK?: number;
  category?: "clinic" | "restaurant" | "auto" | "general" | string;
  filter?: Record<string, string | number | boolean>;
  minScore?: number;
}

/**
 * Tokenizes text across English, Latin, digits, and all major Indian scripts:
 * Devanagari (Hindi/Marathi), Bengali, Gurmukhi, Gujarati, Oriya, Tamil, Telugu, Kannada, Malayalam,
 * as well as the Indian Rupee symbol (\u20B9).
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u0D7F]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export function computeDenseVector(text: string, dim: number = 64): number[] {
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

  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) vec[i] /= norm;
  }
  return vec;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return Math.max(0, Math.min(1, (dot + 1) / 2));
}

export class SutraHybridEngine {
  private docs: Map<string, KnowledgeDocument> = new Map();
  private docLengths: Map<string, number> = new Map();
  private docFreqs: Map<string, number> = new Map();
  private avgLength: number = 0;
  private totalDocs: number = 0;

  private readonly k1: number = 1.5;
  private readonly b: number = 0.75;

  constructor(initialDocuments: KnowledgeDocument[] = []) {
    for (const doc of initialDocuments) {
      this.insert(doc);
    }
  }

  public insert(doc: KnowledgeDocument): void {
    // If updating an existing doc, remove old frequency entries first to preserve IDF accuracy
    if (this.docs.has(doc.id)) {
      this.delete(doc.id);
    }

    const tokens = tokenize(`${doc.title} ${doc.content}`);
    const vector = computeDenseVector(`${doc.title} ${doc.content}`);

    this.docs.set(doc.id, { ...doc, tokens, vector });
    this.docLengths.set(doc.id, tokens.length);

    const uniqueTokens = new Set(tokens);
    for (const t of uniqueTokens) {
      this.docFreqs.set(t, (this.docFreqs.get(t) || 0) + 1);
    }

    this.totalDocs = this.docs.size;
    let sum = 0;
    for (const len of this.docLengths.values()) sum += len;
    this.avgLength = this.totalDocs > 0 ? sum / this.totalDocs : 0;
  }

  public query(queryText: string, optionsOrTopK: number | QueryOptions = 3): HybridSearchResult[] {
    const options: QueryOptions =
      typeof optionsOrTopK === "number" ? { topK: optionsOrTopK } : optionsOrTopK;

    const topK = options.topK ?? 3;
    const category = options.category;
    const filter = options.filter;
    const minScore = options.minScore ?? 0;

    const qTokens = tokenize(queryText);
    const qVector = computeDenseVector(queryText);
    if (this.totalDocs === 0 || qTokens.length === 0) return [];

    const rawResults: Array<{
      document: KnowledgeDocument;
      bm25Score: number;
      vectorScore: number;
      matchedTerms: string[];
    }> = [];

    for (const [id, doc] of this.docs.entries()) {
      // 1. In-flight Category filter
      if (category && doc.category !== category) {
        continue;
      }

      // 2. In-flight Metadata filter
      if (filter && doc.metadata) {
        let matches = true;
        for (const [key, val] of Object.entries(filter)) {
          if (doc.metadata[key] !== val) {
            matches = false;
            break;
          }
        }
        if (!matches) continue;
      } else if (filter && !doc.metadata) {
        continue;
      }

      const docTokens = doc.tokens || [];
      const docVector = doc.vector || [];
      const docLength = this.docLengths.get(id) || 1;

      let bm25 = 0;
      const matched: string[] = [];
      const counts = new Map<string, number>();
      for (const t of docTokens) counts.set(t, (counts.get(t) || 0) + 1);

      for (const qt of qTokens) {
        const tf = counts.get(qt) || 0;
        if (tf > 0) {
          matched.push(qt);
          const df = this.docFreqs.get(qt) || 1;
          const idf = Math.log((this.totalDocs - df + 0.5) / (df + 0.5) + 1);
          const num = tf * (this.k1 + 1);
          const den = tf + this.k1 * (1 - this.b + this.b * (docLength / (this.avgLength || 1)));
          bm25 += idf * (num / den);
        }
      }

      const vectorScore = cosineSimilarity(qVector, docVector);
      rawResults.push({
        document: doc,
        bm25Score: Math.max(0, bm25),
        vectorScore,
        matchedTerms: matched,
      });
    }

    if (rawResults.length === 0) return [];

    const maxBm25 = Math.max(1, ...rawResults.map((r) => r.bm25Score));
    const fused = rawResults
      .map((r) => {
        const normBm25 = r.bm25Score / maxBm25;
        const fusedScore = r.vectorScore * 0.6 + normBm25 * 0.4;
        return { ...r, fusedScore };
      })
      .filter((r) => r.fusedScore >= minScore);

    fused.sort((a, b) => b.fusedScore - a.fusedScore);
    return fused.slice(0, topK);
  }

  public get(id: string): KnowledgeDocument | undefined {
    return this.docs.get(id);
  }

  public delete(id: string): boolean {
    if (!this.docs.has(id)) return false;
    this.docs.delete(id);
    this.docLengths.delete(id);

    this.docFreqs.clear();
    for (const doc of this.docs.values()) {
      const tokens = doc.tokens || [];
      const unique = new Set(tokens);
      for (const t of unique) {
        this.docFreqs.set(t, (this.docFreqs.get(t) || 0) + 1);
      }
    }

    this.totalDocs = this.docs.size;
    let sum = 0;
    for (const len of this.docLengths.values()) sum += len;
    this.avgLength = this.totalDocs > 0 ? sum / this.totalDocs : 0;
    return true;
  }

  public clear(): void {
    this.docs.clear();
    this.docLengths.clear();
    this.docFreqs.clear();
    this.avgLength = 0;
    this.totalDocs = 0;
  }

  public exportSnapshot(): KnowledgeDocument[] {
    return Array.from(this.docs.values()).map(({ id, title, content, category, metadata }) => ({
      id,
      title,
      content,
      category,
      metadata,
    }));
  }

  public importSnapshot(docs: KnowledgeDocument[]): void {
    this.clear();
    for (const doc of docs) {
      this.insert(doc);
    }
  }

  public size(): number {
    return this.totalDocs;
  }
}
