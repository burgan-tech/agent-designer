import React, { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { DesignerNodeData } from '../editor/types';
import { Badge } from '../components/ui/badge';
import { nodeIcons } from '../constants/nodeIcons';

const calculateHandlePosition = (index: number, total: number) => {
  if (total === 1) return '50%';
  const spacing = 100 / (total + 1);
  return `${(index + 1) * spacing}%`;
};

const formatSummaryValue = (value: string) => {
  if (!value) return '—';
  if (value.length > 80) {
    return `${value.slice(0, 77)}...`;
  }
  return value;
};

const FlowNodeComponent: React.FC<{ data: DesignerNodeData; selected?: boolean }> = React.memo(({ data }) => {
  const summary = useMemo(() => data.schema.summary?.(data.properties) ?? [], [data.schema, data.properties]);

  // Calculate minimum height based on number of handles
  const maxHandles = Math.max(data.inputs.length, data.outputs.length);
  const minHeight = Math.max(60, maxHandles * 30); // 30px per handle minimum

  return (
    <div className="space-y-2 group relative" data-node-type={data.type} style={{ minHeight: `${minHeight}px` }}>
      <div>
        <h4 className="m-0 text-sm font-semibold flex items-center gap-2">
          <i className={`ph ${nodeIcons[data.type]} text-lg text-primary`}></i>
          {data.properties?.title ?? data.schema.title}
        </h4>
      </div>
      {summary.length > 0 && summary[0] && (
        <div className="text-xs text-slate-600">
          {formatSummaryValue(summary[0].value)}
        </div>
      )}
      {data.inputs.map((input, index) => (
        <Handle
          key={`input-${input}`}
          type="target"
          position={Position.Left}
          id={input}
          style={{
            top: calculateHandlePosition(index, data.inputs.length),
            transform: 'translateY(-50%)'
          }}
        />
      ))}
      {data.outputs.map((output, index) => (
        <Handle
          key={`output-${output}`}
          type="source"
          position={Position.Right}
          id={output}
          style={{
            top: calculateHandlePosition(index, data.outputs.length),
            transform: 'translateY(-50%)'
          }}
        />
      ))}
      {/* Input Labels */}
      {data.inputs.map((input, index) => (
        <div
          key={`input-label-${input}`}
          className={`absolute text-xs font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-sm border border-border whitespace-nowrap pointer-events-none z-10 transition-opacity duration-200 shadow-sm ${
            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{
            top: calculateHandlePosition(index, data.inputs.length),
            left: '-8px',
            transform: 'translateX(-100%) translateY(-50%)',
          }}
        >
          {input}
        </div>
      ))}
      {/* Output Labels */}
      {data.outputs.map((output, index) => (
        <div
          key={`output-label-${output}`}
          className={`absolute text-xs font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-sm border border-border whitespace-nowrap pointer-events-none z-10 transition-opacity duration-200 shadow-sm ${
            selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{
            top: calculateHandlePosition(index, data.outputs.length),
            right: '-8px',
            transform: 'translateX(100%) translateY(-50%)',
          }}
        >
          {output}
        </div>
      ))}
    </div>
  );
});

FlowNodeComponent.displayName = 'FlowNodeComponent';

export default FlowNodeComponent;
