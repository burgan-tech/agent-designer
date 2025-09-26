import { NodeType } from '../model/flow';

// Professional icon mapping for node types using Phosphor Icons
export const nodeIcons: Record<NodeType, string> = {
  start: 'ph-play-circle',
  end: 'ph-check-circle',
  message: 'ph-chat-circle',
  button: 'ph-radio-button',
  input: 'ph-keyboard',
  condition: 'ph-git-branch',
  function: 'ph-function',
  agent: 'ph-robot',
  api: 'ph-globe',
  form: 'ph-list-checks',
  table: 'ph-table',
  decision_tree: 'ph-tree',
};