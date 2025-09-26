import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
        className={`inline-edit-input ${className || ''}`}
        autoFocus
      />
    );
  }

  return (
    <div
      className={`inline-edit-text ${className || ''}`}
      onClick={() => setEditing(true)}
      title="Düzenlemek için tıklayın"
    >
      {value || placeholder}
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
    <div className="tree-node" style={{ marginLeft: `${level * 20}px` }}>
      <div className="question-node">
        {editable ? (
          <InlineInput
            value={node.question}
            onChange={updateQuestion}
            placeholder="Soru"
            className="question-text"
          />
        ) : (
          <div className="question-text">
            {node.question}
          </div>
        )}

        {editable && level > 0 && (
          <button
            type="button"
            className="delete-node-btn"
            onClick={onDelete}
            title="Sil"
          >
            ×
          </button>
        )}
      </div>

      <div className="options-container">
        {node.options.map((option, index) => (
          <div key={index} className="option-branch">
            <div className="option-node">
              {editable ? (
                <div className="option-edit">
                  <InlineInput
                    value={option.text}
                    onChange={(text) => updateOption(index, { ...option, text })}
                    placeholder="Seçenek"
                    className="option-text-input"
                  />
                  {!option.children && (
                    <InlineInput
                      value={option.output || option.value}
                      onChange={(output) => updateOption(index, { ...option, output })}
                      placeholder="→"
                      className="option-output-input"
                    />
                  )}
                  <div className="option-buttons">
                    <button
                      type="button"
                      onClick={() => option.children ? removeChildNode(index) : addChildNode(index)}
                      title={option.children ? "Alt soruyu kaldır" : "Alt soru ekle"}
                      className="compact-btn"
                    >
                      {option.children ? '−' : '+'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteOption(index)}
                      title="Sil"
                      className="compact-btn delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ) : (
                <div className="option-view">
                  <span className="option-text">{option.text}</span>
                  {option.output && <span className="output-badge">→{option.output}</span>}
                </div>
              )}
            </div>

            {option.children && (
              <div className="child-tree">
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

        {editable && (
          <button
            type="button"
            onClick={addOption}
            className="add-option-btn"
            title="Seçenek ekle"
          >
            + Seçenek
          </button>
        )}
      </div>
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
      <div className="empty-tree">
        <p>Karar ağacı bulunamadı</p>
      </div>
    );
  }

  return (
    <div className="decision-tree-viewer">
      <div className="tree-header">
        <h4>{editable ? 'Karar Ağacı Düzenleyici' : 'Karar Ağacı Görünümü'}</h4>
        {editable && (
          <p className="edit-hint">Düzenlemek için metinlere tıklayın</p>
        )}
      </div>
      <div className="tree-container">
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