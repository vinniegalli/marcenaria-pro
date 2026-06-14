import { describe, it, expect } from "vitest";
import { getLimit, PLAN_LIMITS } from "../plans";

describe("getLimit", () => {
  it("retorna limite correto para o plano free", () => {
    expect(getLimit("free", "clients")).toBe(2);
    expect(getLimit("free", "projects")).toBe(3);
    expect(getLimit("free", "uploads")).toBe(3);
    expect(getLimit("free", "reviews")).toBe(1);
    expect(getLimit("free", "supplyItems")).toBe(10);
  });

  it("retorna limite correto para o plano starter", () => {
    expect(getLimit("starter", "clients")).toBe(15);
    expect(getLimit("starter", "projects")).toBe(30);
    expect(getLimit("starter", "uploads")).toBe(20);
    expect(getLimit("starter", "reviews")).toBe(Infinity);
    expect(getLimit("starter", "supplyItems")).toBe(Infinity);
  });

  it("retorna Infinity para o plano pro em todos os recursos", () => {
    expect(getLimit("pro", "clients")).toBe(Infinity);
    expect(getLimit("pro", "projects")).toBe(Infinity);
    expect(getLimit("pro", "uploads")).toBe(Infinity);
    expect(getLimit("pro", "reviews")).toBe(Infinity);
    expect(getLimit("pro", "supplyItems")).toBe(Infinity);
  });

  it("cai no plano free quando plano desconhecido é passado", () => {
    expect(getLimit("enterprise", "clients")).toBe(PLAN_LIMITS.free.clients);
    expect(getLimit("", "projects")).toBe(PLAN_LIMITS.free.projects);
  });

  it("plano free bloqueia criação ao atingir limite", () => {
    const count = 2;
    const limit = getLimit("free", "clients");
    expect(count >= limit).toBe(true);
  });

  it("plano starter permite criar acima do limite free", () => {
    const count = 3; // acima do limite free (2)
    const limit = getLimit("starter", "clients");
    expect(count >= limit).toBe(false);
  });
});
