# Image assets

Drop your photos here using **exactly** these filenames. The site references
each one directly and shows a styled placeholder until the real file exists.

## Currently in place
- `cut-1.jpg` ✅ — gallery haircut 1
- `cut-2.jpg` ✅ — gallery haircut 2

## Optional / still to add
| Filename          | Where it shows             | Suggested size         |
|-------------------|----------------------------|------------------------|
| `hero.jpg`        | Big hero background         | ~1600×1000 (landscape) |
| `interior-1.jpg`  | About section photo         | ~640×760 (portrait)    |
| `og-cover.jpg`    | Social share preview        | 1200×630               |

## Adding more haircut photos to the gallery
The gallery shows **only haircut photos**. To add another:
1. Drop the file in this folder named `cut-3.jpg` (then `cut-4.jpg`, etc.).
2. In `index.html`, copy one `<li class="gallery__item">…</li>` block inside
   `#galleryTrack`, bump the number to `cut-3.jpg`, and update the `alt` text.

(Or just send the photos in chat and I'll wire them in for you.)

All images are optional to launch — missing ones degrade gracefully to
placeholders, and photos are auto-cropped with `object-fit: cover`, so they
look good on phones regardless of exact dimensions.
