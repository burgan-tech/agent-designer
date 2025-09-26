import React, { useState } from 'react';
import { Input } from './ui/input';
import { ChevronRight, ChevronDown, Plus, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface DecisionOption {
  text: string;
  value: string;
  output?: string;
  children?: DecisionNode;
}

interface DecisionNode {
  question: string;
  options: DecisionOption[];
}

interface DecisionTreeViewerProps {
  tree: DecisionNode;
  onChange?: (tree: DecisionNode) => void;
  editable?: boolean;
}

const InlineInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className }) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  React.useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onChange(editValue);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (editing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        className={cn("min-w-0 h-6 text-xs border-dashed", className)}
        autoFocus
      />
    );
  }

  return (
    <div
      className={cn(
        "cursor-pointer hover:bg-muted/20 px-1 py-0.5 rounded transition-colors min-w-0",
        className
      )}
      onClick={() => setEditing(true)}
      title="Düzenlemek için tıklayın"
    >
      {value || <span className="text-muted-foreground">{placeholder}</span>}
    </div>
  );
};

const DecisionTreeNode: React.FC<{
  node: DecisionNode;
  level: number;
  onChange?: (node: DecisionNode) => void;
  onDelete?: () => void;
  editable?: boolean;
}> = ({ node, level, onChange, onDelete, editable = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const updateQuestion = (question: string) => {
    onChange?.({ ...node, question });
  };

  const updateOption = (index: number, option: DecisionOption) => {
    const newOptions = [...node.options];
    newOptions[index] = option;
    onChange?.({ ...node, options: newOptions });
  };

  const addOption = () => {
    onChange?.({
      ...node,
      options: [
        ...node.options,
        {
          text: `Seçenek ${node.options.length + 1}`,
          value: `option${node.options.length + 1}`,
          output: `output${node.options.length + 1}`
        }
      ]
    });
  };

  const deleteOption = (index: number) => {
    const newOptions = node.options.filter((_, i) => i !== index);
    onChange?.({ ...node, options: newOptions });
  };

  const addChildNode = (optionIndex: number) => {
    const option = node.options[optionIndex];
    updateOption(optionIndex, {
      ...option,
      children: {
        question: 'Yeni soru?',
        options: [
          { text: 'Seçenek 1', value: 'option1', output: 'output1' }
        ]
      },
      output: undefined
    });
  };

  const removeChildNode = (optionIndex: number) => {
    const option = node.options[optionIndex];
    updateOption(optionIndex, {
      ...option,
      children: undefined,
      output: option.value
    });
  };

  const updateChildNode = (optionIndex: number, childNode: DecisionNode) => {
    const option = node.options[optionIndex];
    updateOption(optionIndex, { ...option, children: childNode });
  };

  return (
    <div className="space-y-1" style={{ marginLeft: `${level * 12}px` }}>
      <div className="flex items-center gap-1 group py-1">
        {/* Expand/Collapse Chevron */}
        <button
          className="flex items-center justify-center w-4 h-4 hover:bg-muted/50 rounded transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
        </button>

        {/* Question */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {editable ? (
            <InlineInput
              value={node.question}
              onChange={updateQuestion}
              placeholder="Soru"
              className="font-medium text-foreground flex-1 text-sm"
            />
          ) : (
            <span className="font-medium text-foreground text-sm truncate">
              {node.question}
            </span>
          )}
        </div>

        {/* Delete Button */}
        {editable && level > 0 && (
          <button
            className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive flex items-center justify-center"
            onClick={onDelete}
            title="Sil"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Options - Only show when expanded */}
      {isExpanded && (
        <div className="ml-4 space-y-0.5">
          {node.options.map((option, index) => (
            <div key={index} className="space-y-0.5">
              <div className="flex items-center gap-1 py-0.5 px-1 rounded hover:bg-muted/30 group text-sm">
                {/* Option Text */}
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  {editable ? (
                    <>
                      <InlineInput
                        value={option.text}
                        onChange={(text) => updateOption(index, { ...option, text })}
                        placeholder="Seçenek"
                        className="flex-1 min-w-0 text-xs"
                      />
                      {!option.children && (
                        <>
                          <span className="text-muted-foreground text-xs">→</span>
                          <InlineInput
                            value={option.output || option.value}
                            onChange={(output) => updateOption(index, { ...option, output })}
                            placeholder="Sonuç"
                            className="flex-1 min-w-0 text-xs text-green-600"
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-xs truncate">{option.text}</span>
                      {option.output && (
                        <>
                          <span className="text-muted-foreground text-xs">→</span>
                          <span className="text-xs text-green-600 bg-green-50 px-1 py-0.5 rounded truncate">
                            {option.output}
                          </span>
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                {editable && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => option.children ? removeChildNode(index) : addChildNode(index)}
                      title={option.children ? "Alt soruyu kaldır" : "Alt soru ekle"}
                      className="w-4 h-4 text-muted-foreground hover:text-foreground flex items-center justify-center"
                    >
                      <Plus className="h-2.5 w-2.5" />
                    </button>
                    <button
                      onClick={() => deleteOption(index)}
                      title="Sil"
                      className="w-4 h-4 text-muted-foreground hover:text-destructive flex items-center justify-center"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Child Nodes */}
              {option.children && (
                <div className="ml-3 border-l border-muted-foreground/20 pl-1">
                  <DecisionTreeNode
                    node={option.children}
                    level={level + 1}
                    onChange={(childNode) => updateChildNode(index, childNode)}
                    onDelete={() => removeChildNode(index)}
                    editable={editable}
                  />
                </div>
              )}
            </div>
          ))}

          {/* Add Option Button */}
          {editable && (
            <div className="flex items-center gap-1 py-0.5 px-1">
              <button
                onClick={addOption}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                title="Seçenek ekle"
              >
                <Plus className="h-3 w-3" />
                Seçenek ekle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const DecisionTreeViewer: React.FC<DecisionTreeViewerProps> = ({
  tree,
  onChange,
  editable = false
}) => {
  if (!tree || !tree.question) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground text-sm">Karar ağacı bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {editable && (
        <div className="text-xs text-muted-foreground px-1">
          Düzenlemek için metinlere tıklayın
        </div>
      )}
      <div className="bg-muted/10 rounded-md p-1.5 max-h-[300px] overflow-y-auto">
        <DecisionTreeNode
          node={tree}
          level={0}
          onChange={onChange}
          editable={editable}
        />
      </div>
    </div>
  );
};