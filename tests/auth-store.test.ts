import { describe, it, expect } from "vitest";
import { authDb } from "../lib/auth-store";

describe("AuthDatabase & Credentials Vault", () => {
  it("authenticates seeded default developer user", () => {
    const { user, token } = authDb.authenticate("developer@vaniedge.ai", "password123");
    expect(user.email).toBe("developer@vaniedge.ai");
    expect(token).toMatch(/^vsk_[a-f0-9]{64}$/);
    expect(user.credentials.apiKey).toMatch(/^ve_live_[a-f0-9]{32}$/);
  });

  it("fails authentication with invalid password", () => {
    expect(() => {
      authDb.authenticate("developer@vaniedge.ai", "wrong-password");
    }).toThrow("Invalid password. Please verify your credentials.");
  });

  it("fails authentication for non-existent email", () => {
    expect(() => {
      authDb.authenticate("nonexistent@domain.com", "any-password");
    }).toThrow("No account found with this email address.");
  });

  it("registers a new user with PBKDF2 salt and generates credentials", () => {
    const uniqueEmail = `test_${Date.now()}@vaniedge.ai`;
    const { user, token } = authDb.register(
      "Test Engineer",
      uniqueEmail,
      "securePass123",
      "Test Corp",
      "email"
    );

    expect(user.name).toBe("Test Engineer");
    expect(user.email).toBe(uniqueEmail);
    expect(user.passwordHash).toBeDefined();
    expect(user.salt).toBeDefined();
    expect(user.credentials.apiKey).toMatch(/^ve_live_[a-f0-9]{32}$/);
    expect(user.credentials.webhookSecret).toMatch(/^whsec_[a-f0-9]{48}$/);
    expect(user.credentials.sipEndpoint).toBe("sip:blr-edge.vaniedge.ai:5060");
    expect(token).toMatch(/^vsk_[a-f0-9]{64}$/);

    // Retrieve via session
    const sessionUser = authDb.getSessionUser(token);
    expect(sessionUser?.id).toBe(user.id);
  });

  it("prevents duplicate registration with the same email", () => {
    const email = `dupe_${Date.now()}@vaniedge.ai`;
    authDb.register("User One", email, "password123");

    expect(() => {
      authDb.register("User Two", email, "differentPassword");
    }).toThrow("An account with this email address already exists.");
  });



  it("rotates API key and updates lookup index", () => {
    const email = `rotate_${Date.now()}@vaniedge.ai`;
    const { user } = authDb.register("Rotate Tester", email, "secret123");
    const oldApiKey = user.credentials.apiKey;

    // Lookup by old key succeeds
    const userByOldKey = authDb.getUserByApiKey(oldApiKey);
    expect(userByOldKey?.id).toBe(user.id);

    // Rotate key
    const newCredentials = authDb.rotateApiKey(user.id);
    expect(newCredentials.apiKey).not.toBe(oldApiKey);
    expect(newCredentials.apiKey).toMatch(/^ve_live_[a-f0-9]{32}$/);

    // Old key lookup fails, new key succeeds
    expect(authDb.getUserByApiKey(oldApiKey)).toBeNull();
    expect(authDb.getUserByApiKey(newCredentials.apiKey)?.id).toBe(user.id);
  });

  it("strips passwordHash and salt in safeUser serializer", () => {
    const user = authDb.register(
      "Safe User",
      `safe_${Date.now()}@vaniedge.ai`,
      "myPassword123"
    ).user;

    const safe = authDb.safeUser(user);
    expect("passwordHash" in safe).toBe(false);
    expect("salt" in safe).toBe(false);
    expect(safe.id).toBe(user.id);
    expect(safe.email).toBe(user.email);
  });
});
