import { describe, it, expect } from "vitest";

// Lógica de precificação — espelha o que o servidor e a UI calculam
function calcTotalCost(
  items: { quantity: number; unitPrice: number; altUnitPrice?: number | null; activeOption?: string }[],
) {
  return items.reduce((sum, item) => {
    const price =
      item.activeOption === "alternative" && item.altUnitPrice != null
        ? item.altUnitPrice
        : item.unitPrice;
    return sum + item.quantity * price;
  }, 0);
}

function calcFinalPrice(totalCost: number, marginPercent: number) {
  return totalCost * (1 + marginPercent / 100);
}

describe("cálculo de orçamento", () => {
  const baseItems = [
    { quantity: 2, unitPrice: 100 },
    { quantity: 5, unitPrice: 20 },
  ];

  it("calcula custo total corretamente", () => {
    expect(calcTotalCost(baseItems)).toBe(300);
  });

  it("aplica margem de lucro sobre o custo total", () => {
    expect(calcFinalPrice(300, 30)).toBeCloseTo(390);
    expect(calcFinalPrice(300, 0)).toBe(300);
    expect(calcFinalPrice(300, 100)).toBe(600);
  });

  it("usa preço alternativo quando activeOption é 'alternative'", () => {
    const items = [
      { quantity: 1, unitPrice: 200, altUnitPrice: 150, activeOption: "alternative" },
      { quantity: 1, unitPrice: 100 },
    ];
    expect(calcTotalCost(items)).toBe(250);
  });

  it("usa preço primário quando activeOption não é 'alternative'", () => {
    const items = [
      { quantity: 1, unitPrice: 200, altUnitPrice: 150, activeOption: "primary" },
    ];
    expect(calcTotalCost(items)).toBe(200);
  });

  it("usa preço primário quando altUnitPrice é null mesmo com activeOption alternative", () => {
    const items = [
      { quantity: 1, unitPrice: 200, altUnitPrice: null, activeOption: "alternative" },
    ];
    expect(calcTotalCost(items)).toBe(200);
  });

  it("filtra corretamente itens que não vão para o PDF do cliente", () => {
    const allItems = [
      { quantity: 1, unitPrice: 500, requiresReview: true },
      { quantity: 1, unitPrice: 50, requiresReview: false },  // custo interno
      { quantity: 2, unitPrice: 100, requiresReview: true },
    ];

    const clientItems = allItems.filter((i) => i.requiresReview);
    const internalItems = allItems.filter((i) => !i.requiresReview);

    expect(clientItems).toHaveLength(2);
    expect(internalItems).toHaveLength(1);
    expect(calcTotalCost(clientItems)).toBe(700);
    expect(calcTotalCost(internalItems)).toBe(50);
  });
});

describe("revisão de orçamento", () => {
  it("determina activeOption correto a partir do status de revisão do cliente", () => {
    function resolveActiveOption(itemStatus: string, selectedOption: string) {
      return itemStatus !== "contested" && selectedOption === "alternative"
        ? "alternative"
        : "primary";
    }

    expect(resolveActiveOption("alternative", "alternative")).toBe("alternative");
    expect(resolveActiveOption("approved", "primary")).toBe("primary");
    expect(resolveActiveOption("contested", "alternative")).toBe("primary");
    expect(resolveActiveOption("approved", "alternative")).toBe("alternative");
  });

  it("verifica que itens contestados ficam com opção primária", () => {
    function resolveActiveOption(itemStatus: string, selectedOption: string) {
      return itemStatus !== "contested" && selectedOption === "alternative"
        ? "alternative"
        : "primary";
    }

    const reviewItems = [
      { itemStatus: "approved", selectedOption: "primary" },
      { itemStatus: "alternative", selectedOption: "alternative" },
      { itemStatus: "contested", selectedOption: "alternative" },
    ];

    const resolved = reviewItems.map((r) => resolveActiveOption(r.itemStatus, r.selectedOption));
    expect(resolved).toEqual(["primary", "alternative", "primary"]);
  });
});
