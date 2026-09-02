# SKETCHPLAN media upload Worker

The public site is a Next.js static export with no backend. Cloudinary allowed
browser uploads through an *unsigned upload preset*; **Cloudflare R2 has no
equivalent** — its S3 API requires AWS SigV4 signing with a secret access key,
which can never ship in a `NEXT_PUBLIC_*` variable.

This Worker is that missing piece, and nothing else may write to the bucket.

## What it does

`POST /uploads` with the raw image as the request body:

| Header | Value |
| --- | --- |
| `Authorization` | `Bearer <Firebase ID token>` |
| `Content-Type` | `image/jpeg`, `image/png`, or `image/webp` |
| `X-File-Name` | Sanitized file stem, used to build the object key |

The Worker then:

1. Verifies the Firebase ID token's RS256 signature against Google's published
   JWKS, and checks `aud`, `iss`, `exp`, and `iat`.
2. Reads `admins/{uid}` through the Firestore REST API **using the caller's own
   token**, so `firestore.rules` still governs that read. The upload is rejected
   unless the document has `active: true` and an allowed role.
3. Enforces content type, 10 MB size cap, and magic-byte signature so the bytes
   really are the image type the request claims.
4. Writes to R2 under `sketchplan/<stem>-<random>.<ext>` with a one-year
   immutable cache header.

It responds `201` with `{ key, url, contentType, bytes }`.

Requests from origins outside `ALLOWED_ORIGINS` are refused.

## Credentials

**There are none to store.** The `[[r2_buckets]]` binding in `wrangler.toml` is
itself the credential — Cloudflare grants this Worker access to that bucket at
the platform level. Do not create an R2 access key ID or secret for this
project; if you ever see one in a config file, it does not belong there.

The Firebase side needs no service account either: token verification uses
Google's *public* signing keys, and the admin check reuses the caller's token.

## Setup

```bash
cd worker
npm install
```

1. Create the bucket (once), in the Cloudflare dashboard under **R2**, or:

   ```bash
   npx wrangler r2 bucket create sketchplan-media
   ```

2. Give the bucket a public base URL. Either enable the managed `r2.dev`
   development URL, or — required for image transformations — connect a custom
   domain such as `cdn.sketchplan.in` on a zone in your Cloudflare account
   (**R2 → your bucket → Settings → Public access → Custom domain**).

3. Edit `wrangler.toml` and set `FIREBASE_PROJECT_ID`, `R2_PUBLIC_BASE_URL`
   (no trailing slash), and `ALLOWED_ORIGINS` (comma-separated, exact origins).

4. Deploy:

   ```bash
   npx wrangler deploy
   ```

5. Copy the deployed URL plus `/uploads` into the site's
   `NEXT_PUBLIC_MEDIA_UPLOAD_URL`, and the bucket's public base URL into
   `NEXT_PUBLIC_R2_PUBLIC_BASE_URL`.

## Image transformations

Responsive `srcset` URLs are built as
`https://<media host>/cdn-cgi/image/format=auto,quality=85,fit=scale-down,width=<w>/<object key>`.

This requires **Image Transformations** to be enabled for the zone serving the
bucket (**Cloudflare dashboard → your zone → Images → Transformations**). It
only works on a custom domain you own — the `r2.dev` URL cannot transform, and
`srcset` will silently fall back to the untransformed original there.

## Deleting objects

Not implemented, matching the previous Cloudinary behavior: detaching an image
in the admin panel leaves the object in place. Remove orphans with
`npx wrangler r2 object delete sketchplan-media/<key>` or from the dashboard.
