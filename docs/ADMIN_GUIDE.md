# SKETCHPLAN admin guide

## Sign in

1. Open `/admin/login/`.
2. Enter the Firebase Authentication email and password supplied by the project owner.
3. The application verifies the matching `admins/{uid}` document, its `active` flag, and role before opening the dashboard.

There is no registration page. If access is rejected, confirm the Authentication user and Firestore admin document use the same UID and email, and that `active` is `true`.

## Navigation

Desktop admin navigation is in the fixed left rail. On mobile, use the menu button to open the left drawer. The topbar shows the logged-in administrator and live India date/time.

The dashboard summarizes services, projects, published work, blogs, active promotions, and new enquiries. It also shows recent leads and recently updated content.

## Homepage and managed pages

Use **Homepage** to edit the Home, About, and Contact page documents.

- Save repeatable items as the validated JSON shape shown beside each field.
- Keep a page unpublished while preparing content.
- Only publish verified claims, people, awards, projects, and contact information.
- A save updates Firestore immediately; public browser caches may refresh shortly afterward.

## Services

- Create or edit the title first to generate a slug; adjust the slug only when necessary.
- Supply a concise card description, full description, meaningful image alt text, features, display order, and optional SEO values.
- `Featured` controls homepage eligibility; `Published` controls public visibility.
- Confirm destructive deletion. Stored image files are not destroyed automatically.

## Projects and categories

Create categories before assigning projects. Each project supports a cover image and an ordered gallery.

- Add meaningful alternative text for every image.
- Drag/reorder with the provided ordering controls before saving.
- Use `YYYY-MM-DD` for completion date when it is known.
- Preview before publishing.
- Category renaming updates linked project category names atomically.

## Blogs

- Draft articles are private to active admins.
- Use the TipTap editor; content is saved as structured JSON.
- Set a featured image, alt text, author, category, excerpt, and SEO fields.
- Publishing records a publication timestamp. Archived articles are removed from public queries.
- Preview the rendered article before publishing.

## Banners and offers

- Banner desktop media is required; mobile media is optional.
- Start and end times are optional, but the end must not precede the start.
- `Active` is required for public eligibility.
- Use display order to control priority.
- Offers may appear in the homepage section and, independently, as a dismissible once-per-session popup.

## Leads

Editors have view/export access. Admins and Super Admins can update status and internal notes or delete a lead.

1. Open a lead to read the full message and contact details.
2. Move it through `NEW`, `CONTACTED`, `FOLLOW_UP`, `CONVERTED`, `CLOSED`, or `SPAM`.
3. Keep operational notes in **Internal notes**; they are never public.
4. Use **Export visible CSV** to download only the current page after search/status filtering.
5. Export or copy anything needed before deletion; deletion is permanent.

## Settings

General settings control company name, brand images, phone, WhatsApp, email, address, map embed, hours, footer, and accent color. Social and SEO tabs control their corresponding documents.

Only Admins and Super Admins can change settings. Empty phone/address/social fields are preferred over invented placeholders.

After changing the site URL or static SEO expectations, rebuild and redeploy the static site.

## Image uploads

Accepted browser uploads are JPG/JPEG, PNG, and WebP up to 10 MB. Wait for the upload to complete before saving the form. A successful upload stores both the HTTPS image URL and the storage object key in Firestore.

Replacing or deleting a reference does not delete the stored image file. Ask a developer to remove orphaned objects from the Cloudflare R2 bucket.

## Roles

| Task | Super Admin | Admin | Editor |
| --- | :---: | :---: | :---: |
| Manage services/projects/blogs/banners/offers | Yes | Yes | Yes |
| View leads | Yes | Yes | Yes |
| Update/delete leads | Yes | Yes | No |
| Manage pages/settings | Yes | Yes | No |
| Manage admins when added | Yes | No | No |

## Safe publishing checklist

- Confirm image rights, alt text, spelling, links, and contact details.
- Do not publish unverified client names, locations, awards, or project claims.
- Preview services, projects, and blogs.
- Confirm scheduling uses the intended local time.
- Keep at least one active Super Admin.
- Never share passwords, Firebase private keys, or Cloudflare API tokens.
