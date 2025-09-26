import { NodeType } from '../model/flow';

// Icon mapping for node types
export const nodeIcons: Record<NodeType, string> = {
  start: '🚀',
  end: '🏁',
  message: '💬',
  button: '🔘',
  input: '📝',
  condition: '🔀',
  function: '⚙️',
  agent: '🤖',
  api: '🌐',
  form: '📋',
  table: '📊',
  decision_tree: '🌳',
};