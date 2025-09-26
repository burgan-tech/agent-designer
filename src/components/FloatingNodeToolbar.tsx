import React from 'react';
import { Panel } from '@xyflow/react';
import { nodeSchemas } from '../model/nodeDefinitions';
import { NodeType } from '../model/flow';
import { nodeIcons } from '../constants/nodeIcons';

interface FloatingNodeToolbarProps {
  onAddNode: (type: NodeType, position: { x: number; y: number }) => void;
}

export const FloatingNodeToolbar: React.FC<FloatingNodeToolbarProps> = React.memo(({ onAddNode }) => {
  const handleDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    console.log('Drag start:', nodeType);
    try {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.setData('text/plain', nodeType);
      event.dataTransfer.effectAllowed = 'move';
      console.log('Data transfer set successfully');
    } catch (error) {
      console.error('Error setting drag data:', error);
    }
  };

  return (
    <Panel position="top-left" className="floating-node-toolbar">
      <div className="toolbar-container">
        <div className="toolbar-title">Araçlar</div>
        <div className="toolbar-grid">
          {Object.entries(nodeSchemas).map(([type, schema]) => (
            <div
              key={type}
              className="toolbar-node-item"
              draggable
              onDragStart={(event) => handleDragStart(event, type as NodeType)}
              onClick={() => {
                console.log('Toolbar item clicked:', type);
                onAddNode(type as NodeType, { x: 100, y: 100 });
              }}
              title={schema.title}
            >
              <i className={`ph ${nodeIcons[type as NodeType]} node-icon`}></i>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
});

FloatingNodeToolbar.displayName = 'FloatingNodeToolbar';