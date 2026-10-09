# Dumo — Design review (Android pilot)

Clickable design prototype and delivery plan for **Dumo The Fame (Pty) Ltd**. Confidential, shared under NDA. All designs belong to Dumo The Fame (Pty) Ltd.

Live: https://blacklayerscorp.github.io/dumo-design-review/

| Page | What it is |
| --- | --- |
| `index.html` | Hub: status, what to review, how to comment |
| `app/` | Clickable Android app prototype, covering every screen in the pilot contract (hash routes, e.g. `app/#/wallet`) |
| `board.html` | Every screen side by side, grouped by flow and milestone |
| `admin/` | Admin web dashboard prototype |
| `plan.html` | Delivery plan: process, stack, architecture, milestones, costs, risks |
| `questions.html` | Discovery questions for the client, answered in the page |
| `design-system.html` | Tokens, type, components and handoff notes |

## Comments
`assets/review.js` adds Figma-style pin comments to every page. Press **C** and click anywhere to add one. Comments are stored in the reviewer's browser. **Send feedback** exports them by email, as a GitHub issue, as a file or as copied text. Open the **Feedback** panel and choose **Import** to load a reviewer's file and see their pins in place.

## Run locally
Static files only. Serve them with any web server:

```
python3 -m http.server 8000
```

Then open http://localhost:8000/.
