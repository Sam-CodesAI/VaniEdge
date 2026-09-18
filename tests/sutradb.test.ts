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
});
