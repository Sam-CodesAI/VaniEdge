import { describe, it, expect, beforeEach } from "vitest";
import { SutraHybridEngine, tokenize, computeDenseVector, cosineSimilarity } from "../src/engine/sutradb.js";

describe("SutraDB Edge Hybrid Engine", () => {
  let engine: SutraHybridEngine;

  beforeEach(() => {
    engine = new SutraHybridEngine([
      {
        id: "doc-1",
        title: "Clinic Timings and Fees",
        content: "Dr. Sharma clinic is open from 9 AM to 1:30 PM. Consultation fee is 500 rupees.",
        category: "clinic",
      },
      {
        id: "doc-2",
        title: "Bhojanalaya Kitchen Menu",
        content: "Special North Indian Thali available daily for 140 rupees. Includes paneer and roti.",
        category: "restaurant",
      },
      {
        id: "doc-3",
        title: "Apex Emergency Roadside Assistance",
        content: "24/7 towing and flat tyre change available with 20 minute response time.",
        category: "auto",
      },
    ]);
  });

  it("tokenizes mixed alphanumeric and Indian scripts correctly", () => {
    const tokens = tokenize("Dr. Sharma Clinic timings! ₹500 fee.");
    expect(tokens).toContain("sharma");
    expect(tokens).toContain("clinic");
    expect(tokens).toContain("timings");
    expect(tokens).toContain("500");
  });

  it("computes normalized dense character n-gram vectors", () => {
    const vec1 = computeDenseVector("Dr. Sharma Clinic");
    const vec2 = computeDenseVector("Dr. Sharma Clinic");
    const vecDiff = computeDenseVector("Bhojanalaya Restaurant Thali");

    expect(vec1.length).toBe(64);
    const simExact = cosineSimilarity(vec1, vec2);
    expect(simExact).toBeCloseTo(1.0, 2);

    const simDiff = cosineSimilarity(vec1, vecDiff);
    expect(simDiff).toBeLessThan(simExact);
  });

  it("retrieves the exact matching document with highest fused score", () => {
    const results = engine.query("What is the consultation fee for Dr Sharma?", 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].document.id).toBe("doc-1");
    expect(results[0].matchedTerms).toContain("sharma");
    expect(results[0].fusedScore).toBeGreaterThan(0);
  });

  it("supports dynamic insertion of new knowledge entries", () => {
    expect(engine.size()).toBe(3);
    engine.insert({
      id: "doc-4",
      title: "Sunday Dental Camp",
      content: "Free dental checkup camp this Sunday from 10 AM to 2 PM.",
      category: "clinic",
    });
    expect(engine.size()).toBe(4);

    const results = engine.query("Sunday dental camp", 1);
    expect(results[0].document.id).toBe("doc-4");
  });

  it("handles empty or whitespace queries gracefully without throwing", () => {
    expect(engine.query("")).toEqual([]);
    expect(engine.query("   ")).toEqual([]);
    expect(engine.query("!@#$%^&*()")).toEqual([]);
  });

  it("handles multi-lingual Indian script documents and queries (Hindi & Kannada)", () => {
    engine.insert({
      id: "doc-hi",
      title: "डॉक्टर शर्मा क्लिनिक",
      content: "अपॉइंटमेंट बुकिंग सुबह 9 बजे से शुरू होती है। फीस 500 रुपये है।",
      category: "clinic",
    });

    const resultsHi = engine.query("डॉक्टर शर्मा फीस", 1);
    expect(resultsHi.length).toBe(1);
    expect(resultsHi[0].document.id).toBe("doc-hi");
    expect(resultsHi[0].matchedTerms).toContain("शर्मा");

    engine.insert({
      id: "doc-kn",
      title: "ವೈದ್ಯರ ಕ್ಲಿನಿಕ್",
      content: "ಬೆಳಗ್ಗೆ 9 ಗಂಟೆಯಿಂದ ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಲಭ್ಯವಿದೆ.",
      category: "clinic",
    });

    const resultsKn = engine.query("ವೈದ್ಯರ ಕ್ಲಿನಿಕ್", 1);
    expect(resultsKn.length).toBe(1);
    expect(resultsKn[0].document.id).toBe("doc-kn");
  });

  it("supports dynamic deletion of documents from index", () => {
    expect(engine.size()).toBe(3);
    const deleted = engine.delete("doc-2");
    expect(deleted).toBe(true);
    expect(engine.size()).toBe(2);

    const deleteNonExistent = engine.delete("doc-999");
    expect(deleteNonExistent).toBe(false);
  });

  it("filters search results strictly by category", () => {
    const clinicResults = engine.query("What are the timings?", {
      category: "clinic",
      topK: 5,
    });
    expect(clinicResults.length).toBeGreaterThan(0);
    expect(clinicResults.every((r) => r.document.category === "clinic")).toBe(true);

    const autoResults = engine.query("What are the timings?", {
      category: "auto",
      topK: 5,
    });
    expect(autoResults.every((r) => r.document.category === "auto")).toBe(true);
  });

  it("filters search results using arbitrary metadata key-value pairs", () => {
    engine.insert({
      id: "doc-meta-1",
      title: "Pediatric Emergency Ward",
      content: "Pediatric intensive care available 24/7.",
      category: "clinic",
      metadata: { department: "pediatrics", tier: "emergency" },
    });

    engine.insert({
      id: "doc-meta-2",
      title: "Dental OPD",
      content: "General dental outpatient department open 9 AM to 5 PM.",
      category: "clinic",
      metadata: { department: "dental", tier: "routine" },
    });

    const emergencyResults = engine.query("care available", {
      filter: { department: "pediatrics" },
    });
    expect(emergencyResults.length).toBe(1);
    expect(emergencyResults[0].document.id).toBe("doc-meta-1");

    const dentalResults = engine.query("department open", {
      filter: { department: "dental" },
    });
    expect(dentalResults.length).toBe(1);
    expect(dentalResults[0].document.id).toBe("doc-meta-2");
  });

  it("tokenizes Pan-Indian Indic scripts including Tamil, Telugu, and Bengali", () => {
    // Tamil: பல் மருத்துவமனை (Dental Clinic)
    const tamilTokens = tokenize("பல் மருத்துவமனை நேரங்கள் ₹300 கட்டணம்");
    expect(tamilTokens).toContain("மருத்துவமனை");

    // Telugu: దంత వైద్యశాల (Dental Hospital)
    const teluguTokens = tokenize("దంత వైద్యశాల వేళలు ₹400 ఫీజు");
    expect(teluguTokens).toContain("వైద్యశాల");

    // Bengali: ডেন্টাল ক্লিনিক
    const bengaliTokens = tokenize("ডেন্টাল ক্লিনিক সময়সূচী");
    expect(bengaliTokens).toContain("ক্লিনিক");
  });

  it("handles document upserts cleanly without corrupting totalDocs or frequencies", () => {
    const initialSize = engine.size();
    engine.insert({
      id: "doc-1",
      title: "Updated Clinic Timings",
      content: "Dr. Sharma clinic is now open from 8 AM to 3 PM with fee 600 rupees.",
      category: "clinic",
    });

    expect(engine.size()).toBe(initialSize); // Same size after update
    const updated = engine.get("doc-1");
    expect(updated?.title).toBe("Updated Clinic Timings");
    expect(updated?.content).toContain("8 AM to 3 PM");

    const results = engine.query("8 AM to 3 PM", 1);
    expect(results[0].document.id).toBe("doc-1");
  });

  it("exports and imports snapshots faithfully", () => {
    const snapshot = engine.exportSnapshot();
    expect(snapshot.length).toBe(engine.size());

    const newEngine = new SutraHybridEngine();
    expect(newEngine.size()).toBe(0);

    newEngine.importSnapshot(snapshot);
    expect(newEngine.size()).toBe(snapshot.length);

    const queryResults = newEngine.query("Dr Sharma fee", 1);
    expect(queryResults.length).toBe(1);
    expect(queryResults[0].document.id).toBe("doc-1");
  });

  it("filters results below minScore threshold", () => {
    const allResults = engine.query("clinic", { topK: 10, minScore: 0 });
    const filteredResults = engine.query("clinic", { topK: 10, minScore: 0.5 });
    expect(filteredResults.length).toBeLessThanOrEqual(allResults.length);
    expect(filteredResults.every((r) => r.fusedScore >= 0.5)).toBe(true);
  });
});
