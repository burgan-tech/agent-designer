import React, { useMemo } from 'react';
import { Position } from '@xyflow/react';
import { nodeIcons } from '../constants/nodeIcons';
import { DesignerNodeData } from '../editor/types';
import { LabeledHandle } from '../components/labeled-handle';
import { BaseNode } from '../components/base-node';

const formatSummaryValue = (value: any): string => {
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }
  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 50) + '...';
  }
  return String(value);
};

const FlowNodeWithLabels: React.FC<{ data: DesignerNodeData; selected?: boolean }> = React.memo(({ data }) => {
  const summary = useMemo(() => data.schema.summary?.(data.properties) ?? [], [data.schema, data.properties]);

  return (
    <BaseNode
      className="px-0 py-2 bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-md hover:shadow-lg transition-shadow"
      data-node-type={data.type}
      style={{ width: '200px' }}
    >
      {/* Node Header */}
      <div className="px-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <i className={`ph ${nodeIcons[data.type]} text-sm text-primary`}></i>
          <span className="text-xs font-semibold text-slate-700">
            {data.properties?.title ?? data.schema.title}
          </span>
        </div>
      </div>

      {/* Node Summary */}
      {summary.length > 0 && summary[0] && (
        <div className="px-3 py-1.5 text-[10px] text-slate-500 bg-slate-50/50">
          {formatSummaryValue(summary[0].value)}
        </div>
      )}

      {/* Handles Container */}
      <div className="relative" style={{ minHeight: `${Math.max(data.inputs.length, data.outputs.length) * 28}px` }}>
        {/* Input Handles */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-evenly">
          {data.inputs.map((input) => (
            <LabeledHandle
              key={`input-${input}`}
              id={input}
              type="target"
              position={Position.Left}
              title={input}
              labelClassName="text-[10px] font-medium"
            />
          ))}
        </div>

        {/* Output Handles */}
        <div className="absolute right-0 top-0 h-full flex flex-col justify-evenly">
          {data.outputs.map((output) => (
            <LabeledHandle
              key={`output-${output}`}
              id={output}
              type="source"
              position={Position.Right}
              title={output}
              labelClassName="text-[10px] font-medium"
            />
          ))}
        </div>
      </div>
    </BaseNode>
  );
});

FlowNodeWithLabels.displayName = 'FlowNodeWithLabels';

export default FlowNodeWithLabels;