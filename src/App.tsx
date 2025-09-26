import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import FlowEditor from './editor/FlowEditor';
import { sampleFlow } from './model/sampleFlow';
import { FlowDefinition } from './model/flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';

interface FlowIntegrationDemoProps {
  currentFlow: FlowDefinition;
  onFlowChange: (definition: FlowDefinition) => void;
}

const FlowIntegrationDemo: React.FC<FlowIntegrationDemoProps> = ({ currentFlow, onFlowChange }) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [hostName, setHostName] = useState(currentFlow.name);
  const flowRef = useRef(currentFlow);

  useEffect(() => {
    flowRef.current = currentFlow;
    setHostName(currentFlow.name);
  }, [currentFlow]);

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
        onFlowChange(event.data.payload as FlowDefinition);
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
    onFlowChange(updated);
    postFlowToIframe(updated);
  };

  const connectionStatus = useMemo(() => (iframeReady ? 'Editor hazır' : 'Editor yükleniyor...'), [iframeReady]);

  return (
    <div className="h-full flex gap-4">
      <Card className="h-full flex flex-col overflow-hidden w-1/4 min-w-[300px]">
        <CardHeader>
          <CardTitle>Sunucu Uygulaması</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-3 overflow-hidden">
          <p className="text-xs text-slate-600">
            Bu kart, flow editörünü iframe olarak barındıran ana uygulamanın nasıl iletişim kuracağını gösterir.
          </p>
          <div className="space-y-2">
            <label className="text-xs font-medium leading-none">Flow Adı</label>
            <Input value={hostName} onChange={(event) => setHostName(event.target.value)} className="h-8 text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" onClick={hostUpdate} size="sm">
              Iframe'e Gönder
            </Button>
            <span className="text-xs text-slate-500">{connectionStatus}</span>
          </div>
          <div className="flex-1 flex flex-col space-y-2 min-h-0">
            <label className="text-xs font-medium leading-none">Güncel Flow JSON</label>
            <pre className="text-xs bg-muted p-2 rounded-md border flex-1 overflow-auto">{JSON.stringify(currentFlow, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
      <Card className="flex-1 h-full flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>Embedded Flow Editor (Iframe)</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-3 min-h-0 flex flex-col">
          <iframe
            ref={iframeRef}
            title="Flow Editor"
            src="/iframe.html"
            className="w-full flex-1 border-0 rounded-lg"
          />
        </CardContent>
      </Card>
    </div>
  );
};

const App: React.FC = () => {
  const [currentFlow, setCurrentFlow] = useState<FlowDefinition>(sampleFlow);

  const handleFlowChange = useCallback((definition: FlowDefinition) => {
    console.log('App received flow change:', definition);
    setCurrentFlow(definition);
  }, []);

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      <header className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Yeni Flow Designer</h1>
            <p className="text-sm text-muted-foreground">
              Görsel akış tasarım editörü ve iframe entegrasyon demosu
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="#integration">Iframe Demo</a>
          </Button>
        </div>
      </header>
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 p-6" id="integration">
        <Tabs defaultValue="designer" className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="designer">Flow Editörü</TabsTrigger>
            <TabsTrigger value="integration">Iframe Entegrasyonu</TabsTrigger>
          </TabsList>
          <TabsContent value="designer" className="flex-1 mt-4 overflow-hidden min-h-0">
            <FlowEditor initialFlow={currentFlow} onFlowChange={handleFlowChange} />
          </TabsContent>
          <TabsContent value="integration" className="flex-1 mt-4 w-full overflow-hidden min-h-0 flex flex-col">
            <FlowIntegrationDemo currentFlow={currentFlow} onFlowChange={handleFlowChange} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default App;
