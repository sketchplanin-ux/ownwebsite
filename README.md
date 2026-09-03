# SKETCHPLAN website and content admin

Production-oriented public website and client-side admin panel for **SKETCHPLAN — Architecture, Interior & Planning**. The project uses Next.js static export, Firebase Authentication, Cloud Firestore, Cloudinary image delivery, TanStack Query, React Hook Form, Zod, TipTap, Tailwind CSS, and shadcn/ui.

The public site uses a fixed architectural navigation rail on desktop, a left drawer on mobile, a clean live-IST utility bar, and Firestore-managed content. The protected admin area is available under `/admin/` and includes the SKETCHPLAN identity plus a `Product by Creative Link` credit.

## Architecture

```text
Browser / static Firebase Hosting files
  ├─ Public pages → bounded Firestore reads of published/active documents
  ├─ Contact form → validated Firestore lead create
  ├─ Admin login → Firebase email/password authentication
  ├─ Admin access → admins/{uid} active-role check
  ├─ Admin CRUD → role-enforced Firestore reads/writes
  └─ Admin media → restricted unsigned Cloudinary uploads
```

There is intentionally no Express server, API route, Server Action, Cloud Function, Firebase Storage bucket, service account, or Cloudinary API secret in this repository.

## Technology stack

- Next.js App Router with `output: "export"`
- React and strict TypeScript
- Tailwind CSS v4 and shadcn/ui
- Firebase Authentication and Cloud Firestore
- Cloudinary unsigned uploads for admin media
- TanStack Query for bounded client-side data caching
- React Hook Form and Zod for forms
- TipTap JSON for blog content
- Vitest, Testing Library, and Firebase Rules Unit Testing
- Firebase Hosting serving the generated `out/` directory

## Project structure

```text
public/
  brand/                  Exact invoice-derived SKETCHPLAN/Creative Link assets
  images/                 Conceptual fallback visual
src/
  app/
    (website)/            Public static routes
    admin/                Login and protected admin routes
  components/
    admin/                Admin rail, topbar, uploader, permission controls
    common/               Shared async states, pagination, headings, badges
    ui/                   shadcn/ui primitives
    website/              Public rail, footer, navigation, media controls
  features/               Public and admin feature slices
  firebase/               Client config, auth, Firestore and error helpers
  hooks/                  Shared auth/admin hooks
  lib/                    Date, URL, CSV, slug, env and utility helpers
  providers/              Query and authentication providers
  types/                  Firestore domain types
tests/
  unit/                   Fast unit tests
  rules/                  Firestore emulator security tests
firebase.json             Hosting, Firestore and emulator configuration
firestore.rules           Production role and validation rules
firestore.indexes.json    Compound indexes required by application queries
```

## Local setup

Requirements:

- Node.js compatible with the installed Next.js version
- npm
- A Firebase web app and Firestore database
- A Cloudinary cloud with a restricted unsigned upload preset
- Java JDK 11 or newer only when running Firestore emulator tests

Install and configure:

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000/` for the public site and `http://localhost:3000/admin/login/` for admin login.

## Environment variables

Populate `.env.local`; never commit it.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=

NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

Firebase web configuration is public by design. Authorization is enforced by Firebase Authentication and `firestore.rules`. The Cloudinary cloud name and unsigned preset name are also public client values, so the preset itself must be tightly restricted.

Never add any of the following to this project:

- Firebase service-account JSON or private key
- Cloudinary API secret
- SMTP credentials
- private server credentials in a `NEXT_PUBLIC_*` variable

## Firebase project setup

1. In Firebase Console, open project `sketchplan-web` or update `.firebaserc` deliberately if a different project is intended.
2. Register a Web app and copy its client configuration into `.env.local`.
3. Enable Firestore in Production mode.
4. Under Authentication → Sign-in method, enable Email/Password.
5. Add local and production domains under Authentication → Settings → Authorized domains.
6. Do not enable public admin registration.

### Create the first admin

1. In Firebase Console → Authentication → Users, create an email/password user.
2. Copy the user UID.
3. In Firestore Console, manually create `admins/{uid}` using that exact UID as the document ID:

```json
{
  "uid": "THE_AUTH_UID",
  "name": "Administrator name",
  "email": "the-auth-email@example.com",
  "role": "SUPER_ADMIN",
  "active": true,
  "createdAt": "Firestore timestamp"
}
```

Use the Firestore timestamp field type, not a text date. The first administrator must be created through the trusted Firebase Console; the public application has no registration or admin-creation flow.

Roles:

| Role | Access |
| --- | --- |
| `SUPER_ADMIN` | Full content, settings, lead, and future admin-management access |
| `ADMIN` | Content, settings, and lead management |
| `EDITOR` | Services, projects, blogs, banners, offers, and view-only lead access |

Inactive or missing admin documents are rejected after Firebase authentication.

## Firestore collections

```text
admins/{uid}
pages/home
pages/about
pages/contact
services/{serviceId}
projects/{projectId}
projectCategories/{categoryId}
blogs/{blogId}
banners/{bannerId}
offers/{offerId}
leads/{leadId}
siteSettings/general
siteSettings/social
siteSettings/seo
```

Creates and updates use Firestore server timestamps. Date-only project completion dates use `YYYY-MM-DD`; scheduled banners and offers use Firestore timestamps.

### Initial content

Create content through the admin UI after security rules and the first admin are configured.

Suggested services:

- Architecture Design
- Interior Design
- Building Planning
- Renovation and Remodeling
- Residential Design
- Commercial Design

Suggested project categories:

- Residential
- Commercial
- Interior
- Renovation
- Planning

Suggested `siteSettings/general` starting values:

```json
{
  "companyName": "SKETCHPLAN",
  "logoUrl": "/brand/sketchplan-mark.png",
  "logoAlt": "SKETCHPLAN",
  "faviconUrl": "",
  "phone": "",
  "whatsappNumber": "",
  "email": "sketchplan.amc@gmail.com",
  "address": "",
  "googleMapsUrl": "",
  "officeHours": "",
  "footerText": "Architecture, Interior & Planning",
  "brandAccentColor": ""
}
```

Do not invent phone numbers, addresses, awards, certifications, projects, or client claims.

## Firestore security rules and indexes

The checked-in rules enforce:

- published/active-only anonymous content reads
- strict valid public lead creation with forced `NEW` status and empty notes
- no anonymous lead reads
- self-read of `admins/{uid}` for login authorization
- active `SUPER_ADMIN`, `ADMIN`, and `EDITOR` role checks
- settings and lead mutation restrictions by role
- allowed fields, basic types, lengths, timestamps, and immutable audit fields

Install the Firebase CLI and authenticate:

```bash
npm install -g firebase-tools
firebase login
firebase use sketchplan-web
```

Run security tests before deploying rules:

```bash
npm run test:rules
```

The Firestore emulator requires Java JDK 11 or newer available through `PATH`.

Deploy only rules and indexes after reviewing the target project:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

Rules are not query filters. Public queries in this app therefore include the same `published`, `status`, or `active` predicates required by the rules.

## Cloudinary setup

Create a dedicated **unsigned** upload preset in Cloudinary and put its name in `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

Recommended preset restrictions:

- unsigned upload enabled
- allowed formats: `jpg`, `jpeg`, `png`, `webp`
- maximum raw upload size: 10 MB or lower
- dedicated asset folder: `sketchplan`
- disallow arbitrary incoming transformations unless required
- use unique filenames and do not overwrite existing assets
- restrict delivery/types as tightly as the Cloudinary account permits

The client performs MIME type, extension, size, count, and response validation and displays upload progress. The preset remains publicly discoverable because it is used by a static browser application; client-side admin authentication cannot make an unsigned preset secret.

Deleting or replacing a Firestore image reference does **not** securely destroy the Cloudinary asset. Signed destruction requires the Cloudinary API secret and therefore must be done manually in Cloudinary or through a separately authorized backend that is outside this project’s scope.

## Development and validation commands

```bash
npm run dev
npm run typecheck
npm run lint
npm test
npm run test:rules
npm run build
```

`npm run build` must generate `out/`. The regular unit suite excludes emulator tests; `npm run test:rules` starts the Firestore emulator and runs only the rule suite.

## Firebase Hosting deployment

No deployment command should be run until the owner approves the target and release.

```bash
npm run typecheck
npm run lint
npm test
npm run test:rules
npm run build
firebase use sketchplan-web
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only hosting
```

`firebase.json` serves `out/`, uses clean/trailing-slash URLs, and gives immutable caching to fingerprinted JS/CSS assets.

### Custom domain

After Hosting is deployed:

1. Open Firebase Console → Hosting → Add custom domain.
2. Enter the apex or subdomain and choose the preferred redirect.
3. Add the exact verification and routing DNS records shown by Firebase.
4. Wait for DNS and the managed SSL certificate to reach `Connected`.
5. Add the final domain to Firebase Authentication authorized domains.
6. Set `NEXT_PUBLIC_SITE_URL`, update `siteSettings/seo.siteUrl`, rebuild, and redeploy.

## Admin usage

See [`docs/ADMIN_GUIDE.md`](docs/ADMIN_GUIDE.md) for the client-facing workflow. Main routes include:

```text
/admin/login/
/admin/dashboard/
/admin/homepage/
/admin/services/
/admin/projects/
/admin/blogs/
/admin/banners/
/admin/offers/
/admin/leads/
/admin/settings/
```

## Static-export limitations

- Firestore content loads in the browser after the static shell is served.
- Managed SEO values affect client content, but static route metadata and sitemap changes require a rebuild.
- Service, project, and blog detail pages use fixed static routes with `?slug=` because arbitrary runtime dynamic routes are not compatible with a pure export without a known build-time slug list.
- A missing runtime detail is a client-rendered not-found state rather than a server-generated HTTP 404.
- Blog and lead substring search is limited to the bounded page already fetched; Firestore is not a full-text search engine.
- Contact cooldown and honeypot checks are defense-in-depth, not a server-enforced global rate limiter. Firestore rules remain the security boundary.
- Scheduled banners/offers are queried as active and then time-filtered in the browser because their start/end fields are optional.
- The public site includes a clearly labelled conceptual fallback architecture image; it is not represented as a completed client project.

## Backup and maintenance

- Export or back up Firestore content on a regular schedule appropriate to the project plan.
- Keep original brand/media files outside Cloudinary as a source archive.
- Record orphaned Cloudinary public IDs when replacing media and remove them through a trusted account workflow.
- Review active admins and authorized domains periodically.
- Monitor Firebase/Cloudinary usage and configure budget alerts where available.
- Test rules after every schema or role change and deploy rules before UI changes that depend on them.
- Run dependency audit, typecheck, lint, unit tests, rule tests, and static build before each release.

## Branding assets

- `public/brand/sketchplan-mark.png` is the SKETCHPLAN mark extracted from the supplied invoice.
- `public/brand/creative-link.png` is the exact supplied Creative Link logo used for the product credit.
- `public/images/architecture-concept-hero.webp` is an AI-generated conceptual fallback visual.

These assets should be replaced only with owner-approved originals of equal or better quality.
