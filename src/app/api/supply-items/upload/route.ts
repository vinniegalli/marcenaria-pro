import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, unauthorized } from "@/lib/api-helpers";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface ParsedRow {
  name: string;
  category?: string;
  unitPrice: number;
}

function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function extractRows(records: Record<string, string>[]): ParsedRow[] {
  return records
    .map((row) => {
      const normalized: Record<string, string> = {};
      for (const k of Object.keys(row)) {
        normalized[normalizeKey(k)] = row[k];
      }

      const name =
        normalized["nome"] ?? normalized["name"] ?? normalized["item"] ?? "";
      const priceRaw =
        normalized["preco"] ??
        normalized["price"] ??
        normalized["valor"] ??
        normalized["unitprice"] ??
        normalized["preco unitario"] ??
        normalized["valor unitario"] ??
        "";
      const category =
        normalized["categoria"] ?? normalized["category"] ?? undefined;

      const unitPrice = parseFloat(
        String(priceRaw)
          .replace(/[^\d.,]/g, "")
          .replace(",", "."),
      );

      if (!name || isNaN(unitPrice)) return null;
      return {
        name: String(name).trim(),
        category: category?.trim() || undefined,
        unitPrice,
      };
    })
    .filter(Boolean) as ParsedRow[];
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const replace = formData.get("replace") === "true";

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não enviado" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name.toLowerCase();
    let rows: ParsedRow[] = [];

    if (filename.endsWith(".csv")) {
      const text = buffer.toString("utf-8");
      const result = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
      });
      rows = extractRows(result.data);
    } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const records = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
        defval: "",
        raw: false,
      });
      rows = extractRows(records);
    } else {
      return NextResponse.json(
        { error: "Formato inválido. Envie CSV, XLSX ou XLS." },
        { status: 400 },
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "Nenhum item válido encontrado. Verifique as colunas: nome, preço, categoria (opcional).",
        },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    if (replace) {
      await prisma.supplyItem.deleteMany({ where: { userId } });
    }

    await prisma.supplyItem.createMany({
      data: rows.map((r) => ({ ...r, userId })),
      skipDuplicates: false,
    });

    return NextResponse.json({ imported: rows.length, replaced: replace });
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar arquivo" },
      { status: 500 },
    );
  }
}
