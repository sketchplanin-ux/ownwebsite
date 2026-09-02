export type CsvValue = string | number | boolean | Date | null | undefined;

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => CsvValue;
}

export interface CsvOptions {
  delimiter?: "," | ";" | "\t";
  includeBom?: boolean;
  lineEnding?: "\n" | "\r\n";
}

const FORMULA_PREFIX_PATTERN = /^[\s]*[=+\-@]/;
const LEADING_CONTROL_PATTERN = /^[\t\r\n]/;

function stringifyCsvValue(value: CsvValue): string {
  if (value == null) {
    return "";
  }
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : "";
  }
  return String(value);
}

/** Prefixes spreadsheet formulas with an apostrophe to prevent execution. */
export function protectCsvFormula(value: string): string {
  return FORMULA_PREFIX_PATTERN.test(value) ||
    LEADING_CONTROL_PATTERN.test(value)
    ? `'${value}`
    : value;
}

export function escapeCsvCell(value: CsvValue): string {
  const protectedValue = protectCsvFormula(stringifyCsvValue(value));
  return `"${protectedValue.replace(/"/g, '""')}"`;
}

export function createCsv<T>(
  rows: readonly T[],
  columns: readonly CsvColumn<T>[],
  options: CsvOptions = {},
): string {
  const delimiter = options.delimiter ?? ",";
  const lineEnding = options.lineEnding ?? "\r\n";
  const header = columns
    .map((column) => escapeCsvCell(column.header))
    .join(delimiter);
  const body = rows.map((row) =>
    columns
      .map((column) => escapeCsvCell(column.value(row)))
      .join(delimiter),
  );
  const content = [header, ...body].join(lineEnding);
  return options.includeBom ? `\uFEFF${content}` : content;
}
