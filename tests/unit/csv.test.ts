import { describe, expect, it } from "vitest";

import { createCsv, escapeCsvCell, protectCsvFormula } from "@/lib/csv";

describe("CSV utilities", () => {
  it.each(["=2+2", "+cmd", "-1+1", "@SUM(A1)", "  =2+2", "\t=2+2"])(
    "neutralizes spreadsheet formula input %j",
    (value) => {
      expect(protectCsvFormula(value)).toBe(`'${value}`);
    },
  );

  it("escapes quotes and delimiters", () => {
    expect(escapeCsvCell('Das, "Architect"')).toBe('"Das, ""Architect"""');
  });

  it("builds typed CSV rows with stable line endings and optional BOM", () => {
    const csv = createCsv(
      [{ name: "A", note: "=HYPERLINK(\"bad\")" }],
      [
        { header: "Name", value: (row) => row.name },
        { header: "Note", value: (row) => row.note },
      ],
      { includeBom: true, lineEnding: "\n" },
    );

    expect(csv).toBe(
      '\uFEFF"Name","Note"\n"A","\'=HYPERLINK(""bad"")"',
    );
  });
});
