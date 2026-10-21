# Design reference files

Mockups for the demo shop "Zaib Mobiles" (mobile phone niche). Use them as the visual reference when building the real pages.

| File | Screen | PLAN.md section |
|---|---|---|
| `Main.dc.html` | Storefront home: header, hero, brands, category tabs + "View all", trust strip, text reviews, video reviews, visit shop, footer | §4.1 |
| `Category.dc.html` | Category page: breadcrumb, sort, Brand + PTA filters (no "Sab" pill), product grid, empty state | §4.2 |
| `Product.dc.html` | Product page: gallery with TikTok video thumb, badges, Storage + PTA variant pickers with live price, WhatsApp button + message preview, condition cards, features, box contents, specs, reviews, related | §4.3–4.4 |
| `Dashboard.dc.html` | Dashboard "Add product": photos + video, basic info (+ new category), used-only fields, variants table, colors, features, specs, With/Without box, warranty, SEO with Google preview, visibility toggles | §5.2 |

## How to read them
- Each file is HTML with inline styles. The markup inside `<x-dc>` is the layout.
- `{{name}}` is a value from the `renderVals()` function in the `<script type="text/x-dc">` block at the bottom.
- `<sc-for list="{{items}}" as="item">` = map over a list. `<sc-if value="{{flag}}">` = conditional.
- `onClick="{{fn}}"` handlers + `this.state` show the intended interactions (tabs, filters, variant pickers, gallery).
- Links like `href="Product.dc.html"` are just mockup navigation.
- Text in `[BRACKETS]` is a placeholder the shopkeeper fills in from the dashboard.
- Prices, reviews and names are sample data only.

These files will not render on their own in a browser (they need the design tool's runtime). Open them in a code editor, or view them on the shared design canvas.
