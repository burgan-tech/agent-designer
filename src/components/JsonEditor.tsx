import React, { useState, useEffect, useMemo } from 'react';
import { Textarea } from './ui/textarea';
import { cn } from '../utils/cn';
import { AlertCircle, Check, Copy, Info } from 'lucide-react';
import { FlowVariable } from '../model/flow';
import { extractVariables, findUndefinedVariables } from '../utils/variableValidation';

interface JsonEditorProps {
  value: any;
  onChange?: (value: any) => void;
  readOnly?: boolean;
  className?: string;
  minHeight?: string;
  placeholder?: string;
  variables?: Record<string, FlowVariable>;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  className,
  minHeight = '200px',
  placeholder = '{}',
  variables = {},
}) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [focused, setFocused] = useState(false);

  // Format JSON value to string
  useEffect(() => {
    try {
      if (value === undefined || value === null) {
        setJsonText('');
      } else if (typeof value === 'string') {
        // Try to parse and format if it's a JSON string
        try {
          const parsed = JSON.parse(value);
          setJsonText(JSON.stringify(parsed, null, 2));
        } catch {
          // Not valid JSON, use as is
          setJsonText(value);
        }
      } else {
        setJsonText(JSON.stringify(value, null, 2));
      }
      setError(null);
    } catch (err) {
      setError('Invalid JSON format');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setJsonText(newText);

    if (!onChange) return;

    if (newText.trim() === '') {
      onChange(null);
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(newText);
      onChange(parsed);
      setError(null);
    } catch (err) {
      setError('Invalid JSON: ' + (err as Error).message);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract and validate variables in JSON content
  const validation = useMemo(() => {
    const extractedVars = extractVariables(jsonText);
    const undefinedVars = findUndefinedVariables(jsonText, variables);
    const definedVars = extractedVars.filter(v => !undefinedVars.includes(v));

    return {
      extractedVars,
      undefinedVars,
      definedVars,
      hasErrors: undefinedVars.length > 0
    };
  }, [jsonText, variables]);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      if (onChange) {
        onChange(parsed);
      }
      setError(null);
    } catch (err) {
      setError('Cannot format: Invalid JSON');
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative">
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          {!readOnly && jsonText && (
            <button
              type="button"
              onClick={formatJson}
              className="px-2 py-1 text-xs bg-background/80 hover:bg-background border rounded-md transition-colors"
              title="Format JSON"
            >
              Format
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="px-2 py-1 text-xs bg-background/80 hover:bg-background border rounded-md transition-colors flex items-center gap-1"
            title="Copy JSON"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-green-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
        <Textarea
          value={jsonText}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          readOnly={readOnly}
          placeholder={placeholder}
          className={cn(
            'font-mono text-xs',
            'bg-muted/30',
            error && 'border-destructive focus-visible:ring-destructive',
            validation.hasErrors && !error && 'border-amber-500 focus-visible:ring-amber-500',
            'pr-20'
          )}
          style={{ minHeight }}
        />
      </div>
      {error && (
        <div className="flex items-start gap-2 text-xs text-destructive">
          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
          <span className="break-all">{error}</span>
        </div>
      )}

      {/* Variable hints */}
      {!error && (validation.extractedVars.length > 0 || (focused && Object.keys(variables).length > 0)) && (
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

// Simpler inline JSON viewer for read-only display
export const JsonViewer: React.FC<{
  value: any;
  className?: string;
  compact?: boolean;
}> = ({ value, className, compact = false }) => {
  const formatted = React.useMemo(() => {
    try {
      if (value === undefined || value === null) return 'null';
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return JSON.stringify(parsed, null, compact ? 0 : 2);
        } catch {
          return value;
        }
      }
      return JSON.stringify(value, null, compact ? 0 : 2);
    } catch {
      return String(value);
    }
  }, [value, compact]);

  return (
    <pre
      className={cn(
        'font-mono text-xs p-2 rounded-md bg-muted/30 overflow-auto',
        compact && 'whitespace-nowrap',
        className
      )}
    >
      <code>{formatted}</code>
    </pre>
  );
};