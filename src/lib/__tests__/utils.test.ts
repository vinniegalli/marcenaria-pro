import { describe, it, expect } from "vitest";
import { slugify, formatCurrency, formatDate } from "../utils";

describe("slugify", () => {
  it("converte para minúsculas e substitui espaços por hífens", () => {
    expect(slugify("João Silva")).toBe("joao-silva");
  });

  it("remove acentos", () => {
    expect(slugify("Cozinha Planejada")).toBe("cozinha-planejada");
    expect(slugify("Armário de Banheiro")).toBe("armario-de-banheiro");
  });

  it("remove caracteres especiais", () => {
    expect(slugify("Projeto #1 (teste)")).toBe("projeto-1-teste");
  });

  it("colapsa múltiplos hífens em um", () => {
    expect(slugify("A  B---C")).toBe("a-b-c");
  });

  it("remove espaços no início e fim", () => {
    expect(slugify("  teste  ")).toBe("teste");
  });

  it("lida com string vazia", () => {
    expect(slugify("")).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formata valores em BRL corretamente", () => {
    expect(formatCurrency(1000)).toMatch(/1\.000/);
    expect(formatCurrency(1000)).toMatch(/R\$/);
  });

  it("formata zero", () => {
    expect(formatCurrency(0)).toMatch(/0,00/);
  });

  it("formata valores com centavos", () => {
    expect(formatCurrency(1234.56)).toMatch(/1\.234,56/);
  });

  it("formata valores negativos", () => {
    const result = formatCurrency(-500);
    expect(result).toMatch(/500/);
  });
});

describe("formatDate", () => {
  it("formata data em pt-BR (DD/MM/YYYY)", () => {
    const result = formatDate("2026-06-14T00:00:00.000Z");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("aceita objeto Date", () => {
    const date = new Date("2026-01-15");
    const result = formatDate(date);
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});
