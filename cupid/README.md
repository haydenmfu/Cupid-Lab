# Cupid — Compatibility lab

A dependency-free personal proof of concept for building and testing compatibility graphs. The application is a working surface, not a production dating service.

## Run

Install Node.js 22 or newer, then clone this repository (or download and extract its ZIP). From the directory containing `package.json`, run:

```sh
npm start
```

Your default browser opens automatically. No `npm install`, build step, API key, or account is required. Keep the terminal open; press Ctrl+C to stop. The server listens only on your own computer at http://127.0.0.1:4173/.

- **Windows:** you can also double-click `Start Cupid.cmd`.
- **macOS:** run `sh "Start Cupid.command"` from Terminal. For Finder double-click launching, first run `chmod +x "Start Cupid.command"`. If your Node installation is managed through a shell version manager, use `npm start` in your usual Terminal.
- **Without opening a browser:** run `npm run serve`.
- **Tests:** run `npm test`.

Start with [the ten-minute feedback guide](FEEDBACK.md). The tree editor is the main focus of this test build; the other tabs are a two-person simulation.

### Saved work and troubleshooting

Edits stay in the browser on your device, not in Git or on anyone else's computer. Keep using the same browser and address. Export your tree before clearing browser data or changing browsers/ports. Import through Advanced editor and click Apply changes. Exports include your rule labels and preferences.

If the port is busy, check whether Cupid is already running. To choose another port, use `$env:PORT=4174; npm start` in PowerShell or `PORT=4174 npm start` on macOS. A different port has separate browser storage. Fonts need an internet connection; the app falls back to local fonts when offline.

The macOS launcher is provided but still needs a smoke test on a real Mac. No native installer or code signing is needed for the recommended Terminal launch.

## Try it

1. Open My tree. New users start with a blank tree. Click Add your first node, then click it to edit; drag to reposition it. Each branch can point to any other node as long as it does not create a loop.
2. For a scalar, use the From/To number fields and Continue to dropdown for each range. Add or remove ranges with the buttons. Every whole number in the scale must belong to exactly one range.
3. Add a Yes / no, Scalar ranges, Category, At least N, Compatible hobbies, or Outcome node. Then connect an existing branch to it. The advanced editor offers JSON editing and import. Export saves the tree only, not profile data.
4. To create an appearance fast track, add a scalar node with source My appearance rating and route the high band past any desired steps.
5. Switch between You and Alex at the top to edit both profiles, trees, answers, and directional attraction ratings. Public/private hobbies are separate. Exact names and a small synonym/related-interest dictionary power the demo overlap matcher.
6. Questions are derived from the other person's tree. The next unresolved question is prioritized. At-least-N rules can resolve early if enough known answers establish pass or fail. Other questions remain available for optional advance answering.
7. Match lab evaluates both graphs, shows both paths, and reveals the other person's public profile only after both graphs succeed and both attraction ratings are at least 6/10. This threshold is a demo convention.

## Graph contract

`start` names a node in `nodes`. Every node has an `id`, `type`, `label`, and nonnegative canvas coordinates `x` and `y`. Branches reference node IDs. All branches must exist; cycles are rejected. Unconnected nodes may be staged while constructing a tree.

* `boolean`: `key`, `yes`, `no`.
* `scale`: `key`, integer `min` and `max`, `ranges: [{ min, max, to }]`; optional `source: "attraction"` reads the observer's rating of the candidate instead of the candidate's answer. `source: "answer"` is the default.
* `category`: `key`, `options: [{ value, to }]`.
* `count`: `inputs: [binaryQuestionId, ...]`, integer `threshold`, `yes`, `no`. Defaults to three inputs requiring two yes answers.
* `sum`: `inputs: [scalarQuestionId, ...]`, numeric `threshold`, `yes`, `no`. Proceeds only when all scores are known and their sum is strictly greater than the threshold.
* `hobbies`: `yes`, `no`. Reads public and private hobbies on both profiles. No questionnaire entry.
* `terminal`: `outcome: "match" | "friends" | "reject"`.

Keys are shared question identities. Use the same wording, meaning, answer type, and scalar bounds wherever a key is reused. This prototype does not normalize arbitrary question meanings with an LLM. Missing/invalid answers result in `pending`, not rejection. Outcomes are categorical; there is no invented personality percentage.

## Privacy and limitations

This is an explicitly device-local two-person simulation. Both people and their private data are stored together in localStorage. The person switcher and lab traces are debugging tools, not access control. Use sample information. There are no separate accounts, server database, discovery pool, messaging, or production security claims. Hosted access is owner-private; sharing the site later does not share browser-local edits. Uploaded photos are local data URLs, not uploaded to a server. Clearing browser storage loses edits; tree JSON export offers portability for rules.

The hobby matcher is deliberately labeled as a local approximation, not an LLM. `hobbyOverlap` in `dist/engine.js` is the replacement point for live inference. A real deployment should call a server-side model service with a secret API key, structured output, and a defined consent/data-retention model; it must not ship a key in client JavaScript. Private names must not appear in explanations. The app currently reports only generic hobby compatibility, which does not eliminate inference from matching outcomes.

The sample graph demonstrates logic from the user's references (branching, fast tracks, thresholds, multiple outcomes), without importing either person's exact personal criteria. All labels and rules are editable.

## Files

- `dist/app.js`: interface, device-local persistence, editor and simulation screens.
- `dist/engine.js`: validation, branching, hobby adapter and mutual matching.
- `dist/style.css`: responsive layout and graph styling.
- `server.mjs`: local static preview server.
- `tests/engine.test.mjs`: boundary, reciprocal matching, missing-answer and validation checks.

## Tree editor

The light theme uses soft blue binary questions, green scalar questions, and purple organizational blocks. Click a node to open a floating settings panel. Drag an output to a compatible input to connect; numbered block inputs accept only the matching question type. Red dots indicate missing branch destinations or block inputs; green dots are connected. Unused optional value outputs and the start inlet are neutral, not errors. Value outputs can supply a block independently of branch destinations. Set a binary or scalar question to `mode: "input"` to supply a block without requiring yes/no or range destinations. The flow input is the leftmost dot; numbered dots are block inputs.

Click a connection to delete it; Undo restores the previous tree edit. Edges follow node dragging live. While drawing a connection, compatible inputs highlight and the preview snaps within 30 screen pixels. Release to connect; Escape or dropping on empty space cancels. The canvas scrolls when dragging near its edges. Keyboard users can activate an output and then an input. Clean up tree uses layered ranking and crossing-reduction sweeps, with smooth Bézier connections. It reduces clutter but cannot guarantee zero crossings for every graph. Fit and zoom controls help navigate larger trees. Advanced JSON editing remains available. Legacy count items migrate to separate binary question nodes while retaining their answer keys and existing user labels. A pre-migration browser backup is stored once as `cupid-before-blocks`.

Editor implementation: `dist/editor.js`, `dist/editor.css`, and `dist/graph-model.js`. Block evaluation and layout regression checks: `tests/blocks.test.mjs`.


Canvas controls: scroll up/down to zoom around the pointer; left-drag empty grid to pan. Node settings open beside their node, constrained to the visible editor. Drag the Settings header to reposition the popup. Long settings scroll inside the popup, keeping the header reachable.


Typography: Patrick Hand provides non-cursive handwritten lettering for headings, navigation, and compact tree labels on a warm paper canvas. DM Sans remains on forms and longer text for readability. Fonts load from Google Fonts, with local fallback stacks.

## Anonymous matching preview

Matches shows the number of mutually compatible trees, independent of the separate attraction rating. It displays one unresolved question at a time without owner identity, branch destinations, or rejection traces. Rejected and completed trees stop contributing questions. Skips last for the current session. This local prototype still stores both test profiles together; the person switcher is not an account privacy boundary.

Progress summaries count decision nodes, excluding outcomes and contained input questions. The denominator is decisions already passed plus the longest remaining route to Compatible after the selected branches. Invalid/empty trees report 0/0. Completion thresholds are integers from 1–100 (default 100); partial acceptance applies to unresolved compatible paths, while explicit Reject/Friends outcomes remain final. These aggregate metrics can still reveal changes in progress; this remains a local UI prototype.
