import React from 'react';
import { Panel } from 'reactflow';
import { nodeSchemas } from '../model/nodeDefinitions';
import { NodeType } from '../model/flow';
import { nodeIcons } from '../constants/nodeIcons';

interface FloatingNodeToolbarProps {
  onAddNode: (type: NodeType, position: { x: number; y: number }) => void;
}

export const FloatingNodeToolbar: React.FC<FloatingNodeToolbarProps> = ({ onAddNode }) => {
  const handleDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    console.log('Drag start:', nodeType);
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
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
              title={schema.title}
            >
              <div className="node-icon">{nodeIcons[type as NodeType]}</div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};