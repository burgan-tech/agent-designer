import { NodeSchema } from '../model/nodeSchemas';
import { NodeType } from '../model/flow';

export interface DesignerNodeData {
  id: string;
  type: NodeType;
  title: string;
  schema: NodeSchema<any>;
  properties: any;
  inputs: string[];
  outputs: string[];
}
