import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FlowEditor from './editor/FlowEditor';
import { sampleFlow } from './model/sampleFlow';
import { FlowDefinition } from './model/flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

const FlowIntegrationDemo: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [flow, setFlow] = useState<FlowDefinition>(sampleFlow);
  const [iframeReady, setIframeReady] = useState(false);
  const [hostName, setHostName] = useState(flow.name);
  const flowRef = useRef(flow);

  useEffect(() => {
    flowRef.current = flow;
    setHostName(flow.name);
  }, [flow]);

  const postFlowToIframe = useCallback((definition: FlowDefinition) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'host-init-flow', payload: definition },
        '*'
      );
    }
  }, []);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'iframe-ready') {
        setIframeReady(true);
        postFlowToIframe(flowRef.current);
      }
      if (event.data?.type === 'iframe-flow-change') {
        setFlow(event.data.payload as FlowDefinition);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [postFlowToIframe]);

  const hostUpdate = () => {
    const updated: FlowDefinition = {
      ...flowRef.current,
      name: hostName
    };
    setFlow(updated);
    postFlowToIframe(updated);
  };

  const connectionStatus = useMemo(() => (iframeReady ? 'Editor hazır' : 'Editor yükleniyor...'), [iframeReady]);

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
      <Card>
        <CardHeader>
          <CardTitle>Sunucu Uygulaması</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Bu kart, flow editörünü iframe olarak barındıran ana uygulamanın nasıl iletişim kuracağını
            gösterir. Flow adı gibi verileri güncelleyin ve iframe içinde gerçek zamanlı olarak nasıl
            senkronize olduğunu görün.
          </p>
          <div className="space-y-1">
            <label className="label">Flow Adı</label>
            <Input value={hostName} onChange={(event) => setHostName(event.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" onClick={hostUpdate}>
              Iframe'e Gönder
            </Button>
            <span className="text-xs text-slate-500">Durum: {connectionStatus}</span>
          </div>
          <div>
            <label className="label">Güncel Flow JSON</label>
            <pre style={{ maxHeight: 280, overflow: 'auto' }}>{JSON.stringify(flow, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Embedded Flow Editor (Iframe)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <iframe
            ref={iframeRef}
            title="Flow Editor"
            src="/iframe.html"
            style={{ width: '100%', height: 420, border: '1px solid rgba(148, 163, 184, 0.5)', borderRadius: 12 }}
          />
          <p className="text-xs text-slate-500">
            İframe içerisindeki editör, host uygulamasından gelen mesajları dinler ve her değişiklikte
            güncel flow'u host uygulamasına geri gönderir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="flow-editor-container">
      <header className="shad-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="m-0 text-2xl font-bold">Yeni Flow Designer</h1>
          <p className="m-0 text-sm text-slate-500">
            Görsel akış tasarım editörü ve iframe entegrasyon demosu
          </p>
        </div>
        <a className="shad-button" href="#integration">Iframe Demo</a>
      </header>
      <main className="p-4 space-y-4" id="integration">
        <Tabs defaultValue="designer">
          <TabsList>
            <TabsTrigger value="designer">Flow Editörü</TabsTrigger>
            <TabsTrigger value="integration">Iframe Entegrasyonu</TabsTrigger>
          </TabsList>
          <TabsContent value="designer">
            <FlowEditor initialFlow={sampleFlow} />
          </TabsContent>
          <TabsContent value="integration">
            <FlowIntegrationDemo />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default App;
