/**
 * VaniEdge AI: SutraDB In-Memory Edge Hybrid Retrieval Engine
 * High-speed BM25 Lexical + Dense Character N-Gram Vector Search
 */

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: "clinic" | "restaurant" | "auto" | "general";
  metadata?: Record<string, string | number>;
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

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F\u0C80-\u0CFF]/g, " ")
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

  public query(queryText: string, topK: number = 3): HybridSearchResult[] {
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

    const maxBm25 = Math.max(1, ...rawResults.map((r) => r.bm25Score));
    const fused = rawResults.map((r) => {
      const normBm25 = r.bm25Score / maxBm25;
      const fusedScore = r.vectorScore * 0.6 + normBm25 * 0.4;
      return { ...r, fusedScore };
    });

    fused.sort((a, b) => b.fusedScore - a.fusedScore);
    return fused.slice(0, topK);
  }

  public size(): number {
    return this.totalDocs;
  }
}
