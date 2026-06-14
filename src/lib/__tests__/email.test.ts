import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do módulo resend antes de importar email.ts
const mockSend = vi.fn().mockResolvedValue({ data: { id: "mock-id" }, error: null });

vi.mock("resend", () => {
  function Resend() {
    return { emails: { send: mockSend } };
  }
  return { Resend };
});

describe("email: sendReviewSubmittedEmail", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("não envia email quando RESEND_API_KEY não está configurada", async () => {
    delete process.env.RESEND_API_KEY;
    const { sendReviewSubmittedEmail } = await import("../email");
    // Não deve lançar erro — graceful fallback
    await expect(
      sendReviewSubmittedEmail({
        to: "marceneiro@teste.com",
        carpenterName: "João",
        clientName: "Maria",
        projectName: "Cozinha Planejada",
        projectUrl: "https://app.com/dashboard/projeto/123",
      }),
    ).resolves.toBeUndefined();
  });

  it("envia email quando RESEND_API_KEY está configurada", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const { sendReviewSubmittedEmail } = await import("../email");
    await expect(
      sendReviewSubmittedEmail({
        to: "marceneiro@teste.com",
        carpenterName: "João",
        clientName: "Maria",
        projectName: "Cozinha Planejada",
        projectUrl: "https://app.com/dashboard/projeto/123",
      }),
    ).resolves.not.toThrow();
  });
});

describe("email: sendReviewConfirmedEmail", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("não envia email quando RESEND_API_KEY não está configurada", async () => {
    delete process.env.RESEND_API_KEY;
    const { sendReviewConfirmedEmail } = await import("../email");
    await expect(
      sendReviewConfirmedEmail({
        to: "cliente@teste.com",
        clientName: "Maria",
        carpenterName: "João",
        carpenterPhone: "(11) 99999-9999",
        projectName: "Cozinha Planejada",
        projectUrl: "https://app.com/p/abc123",
      }),
    ).resolves.toBeUndefined();
  });

  it("funciona sem telefone do marceneiro", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    const { sendReviewConfirmedEmail } = await import("../email");
    await expect(
      sendReviewConfirmedEmail({
        to: "cliente@teste.com",
        clientName: "Maria",
        carpenterName: "João",
        carpenterPhone: null,
        projectName: "Cozinha Planejada",
        projectUrl: "https://app.com/p/abc123",
      }),
    ).resolves.not.toThrow();
  });
});
