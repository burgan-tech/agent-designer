import React from 'react';
import ReactDOM from 'react-dom/client';
import { useEffect, useMemo, useState } from 'react';
import FlowEditor from './editor/FlowEditor';
import { FlowDefinition } from './model/flow';
import './index.css';
import { sampleFlow } from './model/sampleFlow';

const IframeApp: React.FC = () => {
  const [flow, setFlow] = useState<FlowDefinition | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'host-init-flow') {
        setFlow(event.data.payload as FlowDefinition);
      }
    };

    window.addEventListener('message', handleMessage);
    window.parent.postMessage({ type: 'iframe-ready' }, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const initialFlow = useMemo(() => flow ?? sampleFlow, [flow]);

  return (
    <div className="flow-editor-container">
      <FlowEditor
        initialFlow={initialFlow}
        onFlowChange={(updated) => {
          window.parent.postMessage({ type: 'iframe-flow-change', payload: updated }, '*');
          setFlow(updated);
        }}
        showMetadata={false}
      />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('flow-editor') as HTMLElement).render(
  <React.StrictMode>
    <IframeApp />
  </React.StrictMode>
);
