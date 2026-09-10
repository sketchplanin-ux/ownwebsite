#!/usr/bin/env node
/**
 * Verifies that every composite index declared in firestore.indexes.json
 * actually exists in the live Firebase project.
 *
 * Declaring an index does not create it: it only exists after
 * `firebase deploy --only firestore:indexes`. A missing one makes the matching
 * query fail at runtime with FAILED_PRECONDITION, which reaches users as an
 * empty or errored page. This script surfaces that before they do.
 *
 * It sends a 1-document probe query per declared index, using the public web
 * API key, so it needs no service account and writes nothing.
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Probe filters need a correctly typed value, and where firestore.rules gates
 * public reads on a specific value the probe must use that value or the rule
 * rejects it and the index is never reached.
 */
const BOOLEAN_FIELDS = new Set(["published", "featured", "active"]);
const RULE_GATED_VALUES = new Map([["status", "PUBLISHED"]]);

async function readEnvironment() {
  for (const candidate of [".env", ".env.local"]) {
    try {
      const raw = await readFile(join(projectRoot, candidate), "utf8");
      const values = new Map();

      for (const line of raw.split(/\r?\n/)) {
        const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
        if (match) {
          values.set(match[1], match[2].trim());
        }
      }

      const projectId = values.get("FIREBASE_PROJECT_ID");
      const apiKey = values.get("FIREBASE_API_KEY");

      if (projectId && apiKey) {
        return { projectId, apiKey, source: candidate };
      }
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(
    "Could not read FIREBASE_PROJECT_ID and FIREBASE_API_KEY from .env",
  );
}

function probeValue(fieldPath) {
  if (BOOLEAN_FIELDS.has(fieldPath)) {
    return { booleanValue: true };
  }

  return {
    stringValue: RULE_GATED_VALUES.get(fieldPath) ?? "__index_probe__",
  };
}

/**
 * Every query in this codebase is "equality filters, then one sort", which is
 * also how the declared indexes are ordered, so the last field is the sort.
 */
function buildProbeQuery(index) {
  const fields = index.fields.filter((field) => field.fieldPath !== "__name__");
  const sortField = fields[fields.length - 1];
  const filterFields = fields.slice(0, -1);

  const filters = filterFields.map((field) => ({
    fieldFilter: {
      field: { fieldPath: field.fieldPath },
      op: "EQUAL",
      value: probeValue(field.fieldPath),
    },
  }));

  return {
    structuredQuery: {
      from: [{ collectionId: index.collectionGroup }],
      ...(filters.length > 0
        ? {
            where:
              filters.length === 1
                ? filters[0]
                : { compositeFilter: { op: "AND", filters } },
          }
        : {}),
      orderBy: [
        {
          field: { fieldPath: sortField.fieldPath },
          direction: sortField.order === "DESCENDING" ? "DESCENDING" : "ASCENDING",
        },
      ],
      limit: 1,
    },
  };
}

function describe(index) {
  return `${index.collectionGroup}: ${index.fields
    .map((field) => `${field.fieldPath} ${field.order === "DESCENDING" ? "desc" : "asc"}`)
    .join(", ")}`;
}

async function checkIndex({ projectId, apiKey }, index) {
  const endpoint =
    `https://firestore.googleapis.com/v1/projects/${projectId}` +
    `/databases/(default)/documents:runQuery?key=${apiKey}`;

  let body;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildProbeQuery(index)),
    });
    body = await response.json();
  } catch (error) {
    return { state: "UNKNOWN", detail: `network error: ${error.message}` };
  }

  const error = Array.isArray(body) ? body[0]?.error : body?.error;

  if (!error) {
    return { state: "OK" };
  }

  if (error.status === "FAILED_PRECONDITION") {
    const link = /create it here: (\S+)/.exec(error.message)?.[1] ?? null;
    return { state: "MISSING", link };
  }

  if (error.status === "PERMISSION_DENIED") {
    // Admin-only collections cannot be probed anonymously.
    return { state: "SKIPPED", detail: "rules require an authenticated admin" };
  }

  return { state: "UNKNOWN", detail: `${error.status}: ${error.message}` };
}

async function main() {
  const environment = await readEnvironment();
  const declared = JSON.parse(
    await readFile(join(projectRoot, "firestore.indexes.json"), "utf8"),
  );

  console.log(
    `Checking ${declared.indexes.length} declared indexes against project ` +
      `"${environment.projectId}" (from ${environment.source})\n`,
  );

  const results = await Promise.all(
    declared.indexes.map(async (index) => ({
      index,
      result: await checkIndex(environment, index),
    })),
  );

  const missing = [];

  for (const { index, result } of results) {
    const label = {
      OK: "  ok     ",
      MISSING: "  MISSING",
      SKIPPED: "  skipped",
      UNKNOWN: "  unknown",
    }[result.state];

    console.log(`${label}  ${describe(index)}`);
    if (result.detail) {
      console.log(`            ${result.detail}`);
    }
    if (result.state === "MISSING") {
      missing.push({ index, link: result.link });
    }
  }

  if (missing.length === 0) {
    console.log("\nAll probeable indexes exist.");
    return;
  }

  console.log(`\n${missing.length} index(es) missing. Create them all with:`);
  console.log(
    `\n  firebase use ${environment.projectId} && firebase deploy --only firestore:indexes\n`,
  );
  console.log("Or create individually:");
  for (const entry of missing) {
    if (entry.link) {
      console.log(`\n  ${describe(entry.index)}\n  ${entry.link}`);
    }
  }

  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
