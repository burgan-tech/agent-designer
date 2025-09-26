import { NodeType } from './flow';

export type PrimitiveFieldType = 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'json' | 'decision_tree';

export interface BaseField {
  name: string;
  label: string;
  description?: string;
  required?: boolean;
}

export interface PrimitiveField extends BaseField {
  type: PrimitiveFieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
}

export interface ObjectField extends BaseField {
  type: 'object';
  fields: NodeSchemaField[];
}

export interface ListField extends BaseField {
  type: 'list';
  itemLabel?: string;
  defaultItem?: Record<string, unknown> | string | number | boolean;
  fields: NodeSchemaField[];
}

export interface KeyValueField extends BaseField {
  type: 'keyValue';
  keyLabel?: string;
  valueLabel?: string;
}

export type NodeSchemaField = PrimitiveField | ObjectField | ListField | KeyValueField;

export interface NodeSchema<TProperties = Record<string, unknown>> {
  type: NodeType;
  title: string;
  description?: string;
  fields: NodeSchemaField[];
  summary: (properties: TProperties) => { label: string; value: string }[];
  defaultProperties: () => TProperties;
  computeOutputs?: (properties: TProperties) => string[];
  computeInputs?: (properties: TProperties) => string[];
}
