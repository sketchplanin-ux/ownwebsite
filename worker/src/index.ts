/**
 * SKETCHPLAN media upload Worker.
 *
 * Replaces Cloudinary unsigned uploads. The static site has no backend, and R2
 * cannot accept anonymous writes, so this Worker is the only thing allowed to
 * write to the bucket. It authorizes each upload by verifying the caller's
 * Firebase ID token and confirming an active `admins/{uid}` document exists.
 *
 * The R2 binding is the credential: no access key or secret is stored anywhere.
 */

export interface Env {
  MEDIA_BUCKET: R2Bucket;
  FIREBASE_PROJECT_ID: string;
  R2_PUBLIC_BASE_URL: string;
  ALLOWED_ORIGINS: string;
}

const OBJECT_PREFIX = "sketchplan";
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
const JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

const EXTENSION_BY_MIME_TYPE = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

interface GoogleSigningKey {
  kid: string;
  kty: string;
  alg: string;
  n: string;
  e: string;
}

let jwksCache: { keys: Map<string, CryptoKey>; expiresAt: number } | null = null;

/* -------------------------------------------------------------------------- */
/* CORS                                                                       */
/* -------------------------------------------------------------------------- */

function resolveAllowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) {
    return null;
  }

  const allowed = env.ALLOWED_ORIGINS.split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "");

  return allowed.includes(origin) ? origin : null;
}

function corsHeaders(allowedOrigin: string | null): Record<string, string> {
  if (!allowedOrigin) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-File-Name",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(
  body: unknown,
  status: number,
  allowedOrigin: string | null,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders(allowedOrigin),
    },
  });
}

function errorResponse(
  message: string,
  status: number,
  allowedOrigin: string | null,
): Response {
  return jsonResponse({ error: { message } }, status, allowedOrigin);
}

/* -------------------------------------------------------------------------- */
/* Firebase ID token verification                                             */
/* -------------------------------------------------------------------------- */

function decodeBase64Url(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="));
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return buffer;
}

function decodeJsonSegment(segment: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(segment)),
    );
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

async function loadSigningKeys(): Promise<Map<string, CryptoKey>> {
  const now = Date.now();
  if (jwksCache && jwksCache.expiresAt > now) {
    return jwksCache.keys;
  }

  const response = await fetch(JWKS_URL);
  if (!response.ok) {
    throw new Error("Unable to load Google signing keys.");
  }

  const payload = (await response.json()) as { keys?: GoogleSigningKey[] };
  const keys = new Map<string, CryptoKey>();

  for (const key of payload.keys ?? []) {
    if (key.kty !== "RSA" || key.alg !== "RS256" || !key.kid) {
      continue;
    }
    keys.set(
      key.kid,
      await crypto.subtle.importKey(
        "jwk",
        { kty: key.kty, n: key.n, e: key.e, alg: key.alg, ext: true },
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"],
      ),
    );
  }

  // Google rotates these keys roughly daily; a short cache keeps us current.
  jwksCache = { keys, expiresAt: now + 60 * 60 * 1000 };
  return keys;
}

/** Returns the verified uid, or null when the token is not trustworthy. */
async function verifyFirebaseIdToken(
  token: string,
  projectId: string,
): Promise<string | null> {
  const segments = token.split(".");
  if (segments.length !== 3) {
    return null;
  }

  const [headerSegment, payloadSegment, signatureSegment] = segments;
  const header = decodeJsonSegment(headerSegment);
  const claims = decodeJsonSegment(payloadSegment);

  if (
    !header ||
    !claims ||
    header.alg !== "RS256" ||
    typeof header.kid !== "string"
  ) {
    return null;
  }

  const keys = await loadSigningKeys();
  const signingKey = keys.get(header.kid);
  if (!signingKey) {
    return null;
  }

  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    signingKey,
    decodeBase64Url(signatureSegment),
    new TextEncoder().encode(`${headerSegment}.${payloadSegment}`),
  );
  if (!verified) {
    return null;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const { aud, iss, sub, exp, iat } = claims;

  if (
    aud !== projectId ||
    iss !== `https://securetoken.google.com/${projectId}` ||
    typeof sub !== "string" ||
    sub.trim() === "" ||
    typeof exp !== "number" ||
    exp <= nowSeconds ||
    typeof iat !== "number" ||
    iat > nowSeconds + 60
  ) {
    return null;
  }

  return sub;
}

/**
 * Confirms the caller is an active admin by reading `admins/{uid}` through the
 * Firestore REST API with the caller's own token, so `firestore.rules` still
 * governs the read.
 */
async function isActiveAdmin(
  uid: string,
  idToken: string,
  projectId: string,
): Promise<boolean> {
  const url =
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}` +
    `/databases/(default)/documents/admins/${encodeURIComponent(uid)}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!response.ok) {
    return false;
  }

  const document = (await response.json()) as {
    fields?: {
      active?: { booleanValue?: boolean };
      role?: { stringValue?: string };
    };
  };

  const active = document.fields?.active?.booleanValue === true;
  const role = document.fields?.role?.stringValue ?? "";

  return active && ADMIN_ROLES.has(role);
}

/* -------------------------------------------------------------------------- */
/* Upload validation                                                          */
/* -------------------------------------------------------------------------- */

/** Confirms the bytes really are the image type the request claims. */
function matchesImageSignature(bytes: Uint8Array, contentType: string): boolean {
  if (contentType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (contentType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((byte, index) => bytes[index] === byte);
  }

  if (contentType === "image/webp") {
    const ascii = (start: number, end: number) =>
      String.fromCharCode(...bytes.slice(start, end));
    return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
  }

  return false;
}

function createSafeFileStem(fileName: string): string {
  const stem = fileName
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/\p{Mark}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return stem || "image";
}

/* -------------------------------------------------------------------------- */
/* Handler                                                                    */
/* -------------------------------------------------------------------------- */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigin = resolveAllowedOrigin(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: allowedOrigin ? 204 : 403,
        headers: corsHeaders(allowedOrigin),
      });
    }

    if (request.headers.get("Origin") && !allowedOrigin) {
      return errorResponse("Origin is not allowed.", 403, null);
    }

    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/uploads") {
      return errorResponse("Not found.", 404, allowedOrigin);
    }

    const authorization = request.headers.get("Authorization") ?? "";
    const idToken = authorization.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";
    if (!idToken) {
      return errorResponse("Sign in to upload images.", 401, allowedOrigin);
    }

    let uid: string | null;
    try {
      uid = await verifyFirebaseIdToken(idToken, env.FIREBASE_PROJECT_ID);
    } catch {
      return errorResponse(
        "Could not verify your session. Try again.",
        503,
        allowedOrigin,
      );
    }
    if (!uid) {
      return errorResponse("Your session is not valid.", 401, allowedOrigin);
    }

    if (!(await isActiveAdmin(uid, idToken, env.FIREBASE_PROJECT_ID))) {
      return errorResponse(
        "This account is not allowed to upload images.",
        403,
        allowedOrigin,
      );
    }

    const contentType = (request.headers.get("Content-Type") ?? "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    const extension = EXTENSION_BY_MIME_TYPE.get(contentType);
    if (!extension) {
      return errorResponse(
        "Choose a JPG, JPEG, PNG, or WebP image.",
        415,
        allowedOrigin,
      );
    }

    const declaredLength = Number(request.headers.get("Content-Length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_SIZE_BYTES) {
      return errorResponse("Image must be 10 MB or smaller.", 413, allowedOrigin);
    }

    const body = await request.arrayBuffer();
    const bytes = new Uint8Array(body);

    if (bytes.byteLength === 0) {
      return errorResponse("The selected file is empty.", 400, allowedOrigin);
    }
    if (bytes.byteLength > MAX_IMAGE_SIZE_BYTES) {
      return errorResponse("Image must be 10 MB or smaller.", 413, allowedOrigin);
    }
    if (!matchesImageSignature(bytes, contentType)) {
      return errorResponse(
        "That file is not a valid JPG, PNG, or WebP image.",
        415,
        allowedOrigin,
      );
    }

    const stem = createSafeFileStem(request.headers.get("X-File-Name") ?? "image");
    const uniqueSuffix = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const key = `${OBJECT_PREFIX}/${stem}-${uniqueSuffix}.${extension}`;

    await env.MEDIA_BUCKET.put(key, body, {
      httpMetadata: {
        contentType,
        cacheControl: "public, max-age=31536000, immutable",
      },
      customMetadata: { uploadedBy: uid },
    });

    return jsonResponse(
      {
        key,
        url: `${env.R2_PUBLIC_BASE_URL.replace(/\/+$/, "")}/${key}`,
        contentType,
        bytes: bytes.byteLength,
      },
      201,
      allowedOrigin,
    );
  },
} satisfies ExportedHandler<Env>;
