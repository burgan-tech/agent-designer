import { FlowVariable } from '../model/flow';

// Extract variable names from a string like "Hello {{name}}, your amount is {{amount}}"
export function extractVariables(text: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const varName = match[1].trim();
    if (varName && !variables.includes(varName)) {
      variables.push(varName);
    }
  }

  return variables;
}

// Check which variables are undefined
export function findUndefinedVariables(
  text: string,
  definedVariables: Record<string, FlowVariable> = {}
): string[] {
  const usedVariables = extractVariables(text);
  const definedVarNames = Object.keys(definedVariables);

  return usedVariables.filter(varName => !definedVarNames.includes(varName));
}

// Highlight undefined variables in text
export function highlightUndefinedVariables(
  text: string,
  definedVariables: Record<string, FlowVariable> = {}
): { text: string; hasErrors: boolean; undefinedVars: string[] } {
  const undefinedVars = findUndefinedVariables(text, definedVariables);

  if (undefinedVars.length === 0) {
    return { text, hasErrors: false, undefinedVars: [] };
  }

  // Replace undefined variables with highlighted versions
  let highlightedText = text;
  undefinedVars.forEach(varName => {
    const regex = new RegExp(`\\{\\{\\s*${varName}\\s*\\}\\}`, 'g');
    highlightedText = highlightedText.replace(
      regex,
      `<span class="undefined-var">{{${varName}}}</span>`
    );
  });

  return {
    text: highlightedText,
    hasErrors: true,
    undefinedVars
  };
}

// Get variable info for tooltip
export function getVariableInfo(
  varName: string,
  definedVariables: Record<string, FlowVariable> = {}
): { exists: boolean; variable?: FlowVariable } {
  const variable = definedVariables[varName];

  if (variable) {
    return { exists: true, variable };
  }

  return { exists: false };
}