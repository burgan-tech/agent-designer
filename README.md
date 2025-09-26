# Agent Designer

Visual flow editor for building agent or chatbot flows. Ships as a standalone web app and an embeddable iframe so you can integrate the editor directly into your own product.

- Stack: Vite + React 18 + TypeScript + React Flow + Tailwind
- Entry points: `index.html` (full demo app) and `iframe.html` (embeddable editor)

## Prerequisites

- Node.js 18+ and npm 9+

## Local Development

1) Install dependencies

```
npm install
```

2) Start the dev server

```
npm run dev
```

Vite serves:
- `http://localhost:5173/` → full app demo (uses `src/main.tsx` → `src/App.tsx`)
- `http://localhost:5173/iframe.html` → the embeddable editor (uses `src/iframe.tsx`)

## Build

```
npm run build
```

Static assets are output to `dist/`. You can deploy that folder to any static host (Netlify, Vercel, S3, Nginx, etc.). The embed target is `dist/iframe.html`.

## Embed via Iframe

The editor is designed to be embedded in your app via an iframe. It communicates with the host page using `window.postMessage`.

### Iframe URL

- During development: `http://localhost:5173/iframe.html`
- In production: `https://your-domain/path/iframe.html` (where you deploy `dist/`)

### Message Contract

- From iframe → host
  - `{ type: 'iframe-ready' }` — fired when the iframe has mounted and is ready to receive the initial flow
  - `{ type: 'iframe-flow-change', payload: FlowDefinition }` — fired whenever the user edits the flow in the iframe

- From host → iframe
  - `{ type: 'host-init-flow', payload: FlowDefinition }` — the host sends the initial (or updated) flow definition to load in the iframe

The `FlowDefinition` shape is defined in `src/model/flow.ts`.

### Minimal Host Integration (TypeScript)

```ts
// Host page code
type FlowDefinition = {
  flowId: string;
  name: string;
  version: string;
  description?: string;
  metadata?: Record<string, any>;
  triggers?: string[];
  variables?: Record<string, { name: string; type: 'string' | 'number' | 'boolean' | 'object'; default?: unknown }>;
  nodes: Array<{ id: string; type: string; position: { x: number; y: number }; properties: any }>;
  edges: Array<{ id: string; type: string; source: string; target: string | string[]; [key: string]: any }>;
};

const iframe = document.getElementById('flow-editor-iframe') as HTMLIFrameElement;

// Your initial flow definition (can be loaded from your backend)
const initialFlow: FlowDefinition = {
  flowId: 'example',
  name: 'Example Flow',
  version: '1.0.0',
  nodes: [],
  edges: []
};

// Listen for messages from the iframe
window.addEventListener('message', (event: MessageEvent) => {
  // Optionally restrict by origin: if (event.origin !== 'https://your-domain') return;
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  switch (data.type) {
    case 'iframe-ready': {
      // Send initial flow to iframe
      iframe.contentWindow?.postMessage({ type: 'host-init-flow', payload: initialFlow }, '*');
      break;
    }
    case 'iframe-flow-change': {
      const updated: FlowDefinition = data.payload;
      // Persist the flow to your backend or local state
      console.log('Flow updated from iframe', updated);
      break;
    }
  }
});
```

### Host HTML

```html
<iframe
  id="flow-editor-iframe"
  src="https://your-domain/path/iframe.html"
  style="width: 100%; height: 100%; border: 0;"
></iframe>
```

Notes:
- The iframe editor fills its container. Give the iframe a fixed height or place it in a flex container.
- For security, validate `event.origin` in your message listener and, in production, replace `'*'` with your actual allowed origin when posting messages.

### Updating the Flow from the Host

If the host changes the flow (e.g., renames it or applies a template), post the new definition to the iframe:

```ts
const nextFlow: FlowDefinition = { ...initialFlow, name: 'New Name' };
iframe.contentWindow?.postMessage({ type: 'host-init-flow', payload: nextFlow }, '*');
```

The iframe will load the provided definition and continue to emit `iframe-flow-change` on user edits.

## Local Demo of Integration

Run `npm run dev` and open `http://localhost:5173/`. The demo app shows:
- A full-featured Flow Editor
- A live iframe integration example that mirrors the message contract described above

## File Map (orienting)

- `index.html` — full app entry (demo + embedded example)
- `iframe.html` — embeddable editor entry
- `src/iframe.tsx` — iframe bootstrap and postMessage wiring
- `src/editor/FlowEditor.tsx` — main editor component and props
- `src/model/flow.ts` — core types for `FlowDefinition`, nodes, and edges
- `src/model/sampleFlow.ts` — example flow used for demos

## Testing

Optional UI tests via Playwright:

```
npm run test
```

## FAQ

- Can I hide the metadata panel in the editor?
  - Yes. The `FlowEditor` component accepts `showMetadata={false}` if you embed the component directly. In the iframe build, the default is enabled for a richer editing experience.

- How do I persist flows?
  - Listen for `iframe-flow-change` in your host, then save the payload to your backend. To reload, send it back with `host-init-flow` when needed (e.g., after a page refresh).

- Can I theme the editor from the host?
  - The iframe is isolated from host styles. If you need theming, fork and adjust Tailwind variables, or add a simple theme channel via postMessage.

## License

Proprietary — internal use while under development. Update this section if you plan to open source or distribute.
