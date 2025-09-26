import React, { useMemo } from 'react';
import { Handle, Position } from 'reactflow';
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

const FlowNodeComponent: React.FC<{ data: DesignerNodeData }> = ({ data }) => {
  const summary = useMemo(() => data.schema.summary?.(data.properties) ?? [], [data]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Badge>{data.type}</Badge>
        <span className="text-xs text-slate-400">{data.id}</span>
      </div>
      <div>
        <h4 className="m-0 text-base font-semibold flex items-center gap-2">
          <span className="text-lg">{nodeIcons[data.type]}</span>
          {data.properties?.title ?? data.schema.title}
        </h4>
        <p className="m-0 text-xs text-slate-500 leading-relaxed">
          {data.schema.description}
        </p>
      </div>
      <div className="space-y-1">
        {summary.map((item) => (
          <div key={item.label} className="text-xs">
            <span className="font-semibold text-slate-500 mr-1">{item.label}:</span>
            <span className="text-slate-700">{formatSummaryValue(item.value)}</span>
          </div>
        ))}
      </div>
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
          className="handle-label input-label"
          style={{
            top: calculateHandlePosition(index, data.inputs.length),
            transform: 'translateX(-100%) translateY(-50%)'
          }}
        >
          {input}
        </div>
      ))}
      {/* Output Labels */}
      {data.outputs.map((output, index) => (
        <div
          key={`output-label-${output}`}
          className="handle-label output-label"
          style={{
            top: calculateHandlePosition(index, data.outputs.length),
            transform: 'translateX(100%) translateY(-50%)'
          }}
        >
          {output}
        </div>
      ))}
    </div>
  );
};

export default FlowNodeComponent;
