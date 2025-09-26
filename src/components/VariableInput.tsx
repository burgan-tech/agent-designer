import React, { useState, useEffect, useMemo } from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { cn } from '../utils/cn';
import { AlertCircle, Info } from 'lucide-react';
import { FlowVariable } from '../model/flow';
import { extractVariables, findUndefinedVariables } from '../utils/variableValidation';

interface VariableInputProps {
  value: string;
  onChange: (value: string) => void;
  variables?: Record<string, FlowVariable>;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const VariableInput: React.FC<VariableInputProps> = ({
  value = '',
  onChange,
  variables = {},
  multiline = false,
  placeholder,
  className,
  disabled = false,
}) => {
  const [focused, setFocused] = useState(false);

  // Extract and validate variables
  const validation = useMemo(() => {
    const extractedVars = extractVariables(value);
    const undefinedVars = findUndefinedVariables(value, variables);
    const definedVars = extractedVars.filter(v => !undefinedVars.includes(v));

    return {
      extractedVars,
      undefinedVars,
      definedVars,
      hasErrors: undefinedVars.length > 0
    };
  }, [value, variables]);

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="relative space-y-1">
      <InputComponent
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          validation.hasErrors && 'border-amber-500 focus-visible:ring-amber-500',
          className
        )}
      />

      {/* Variable hints */}
      {(validation.extractedVars.length > 0 || (focused && Object.keys(variables).length > 0)) && (
        <div className="text-xs space-y-1">
          {/* Show undefined variables */}
          {validation.undefinedVars.length > 0 && (
            <div className="flex items-start gap-1.5 text-amber-600">
              <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Undefined variables: </span>
                {validation.undefinedVars.map((v, i) => (
                  <span key={v}>
                    <code className="bg-amber-50 px-1 py-0.5 rounded">{`{{${v}}}`}</code>
                    {i < validation.undefinedVars.length - 1 && ', '}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Show defined variables being used */}
          {validation.definedVars.length > 0 && (
            <div className="flex items-start gap-1.5 text-green-600">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Using variables: </span>
                {validation.definedVars.map((v, i) => (
                  <span key={v}>
                    <code className="bg-green-50 px-1 py-0.5 rounded">{`{{${v}}}`}</code>
                    {variables[v] && (
                      <span className="text-muted-foreground ml-1">
                        ({variables[v].type}
                        {variables[v].default && `: ${variables[v].default}`})
                      </span>
                    )}
                    {i < validation.definedVars.length - 1 && ', '}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Show available variables hint when focused */}
          {focused && Object.keys(variables).length > 0 && validation.extractedVars.length === 0 && (
            <div className="flex items-start gap-1.5 text-muted-foreground">
              <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">Available variables: </span>
                {Object.entries(variables).slice(0, 3).map(([name, variable], i) => (
                  <span key={name}>
                    <code className="bg-muted px-1 py-0.5 rounded">{`{{${name}}}`}</code>
                    {i < Math.min(2, Object.keys(variables).length - 1) && ', '}
                  </span>
                ))}
                {Object.keys(variables).length > 3 && (
                  <span className="ml-1">and {Object.keys(variables).length - 3} more...</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};