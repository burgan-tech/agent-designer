import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DecisionTreeViewer } from './DecisionTreeViewer';

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

interface DecisionTreeFormProps {
  value: DecisionNode;
  onChange: (tree: DecisionNode) => void;
}

const DecisionOptionForm: React.FC<{
  option: DecisionOption;
  onChange: (option: DecisionOption) => void;
  onDelete: () => void;
  level: number;
}> = ({ option, onChange, onDelete, level }) => {
  const updateField = (field: keyof DecisionOption, value: any) => {
    onChange({ ...option, [field]: value });
  };

  const addChildNode = () => {
    onChange({
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

  const removeChildNode = () => {
    onChange({
      ...option,
      children: undefined,
      output: option.value
    });
  };

  const updateChildNode = (childNode: DecisionNode) => {
    onChange({ ...option, children: childNode });
  };

  return (
    <div className="decision-option" style={{ marginLeft: `${level * 20}px` }}>
      <div className="option-header">
        <div className="option-fields">
          <div className="field-group">
            <Label>Metin</Label>
            <Input
              value={option.text}
              onChange={(e) => updateField('text', e.target.value)}
              placeholder="Seçenek metni"
            />
          </div>
          <div className="field-group">
            <Label>Değer</Label>
            <Input
              value={option.value}
              onChange={(e) => updateField('value', e.target.value)}
              placeholder="Seçenek değeri"
            />
          </div>
          {!option.children && (
            <div className="field-group">
              <Label>Çıkış</Label>
              <Input
                value={option.output || option.value}
                onChange={(e) => updateField('output', e.target.value)}
                placeholder="Çıkış adı"
              />
            </div>
          )}
        </div>
        <div className="option-actions">
          {!option.children ? (
            <Button type="button" variant="ghost" onClick={addChildNode}>
              + Alt Soru
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={removeChildNode}>
              - Alt Soru
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onDelete}>
            Sil
          </Button>
        </div>
      </div>

      {option.children && (
        <div className="child-node">
          <DecisionNodeForm
            node={option.children}
            onChange={updateChildNode}
            level={level + 1}
          />
        </div>
      )}
    </div>
  );
};

const DecisionNodeForm: React.FC<{
  node: DecisionNode;
  onChange: (node: DecisionNode) => void;
  level: number;
}> = ({ node, onChange, level }) => {
  const updateQuestion = (question: string) => {
    onChange({ ...node, question });
  };

  const updateOption = (index: number, option: DecisionOption) => {
    const newOptions = [...node.options];
    newOptions[index] = option;
    onChange({ ...node, options: newOptions });
  };

  const addOption = () => {
    onChange({
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
    onChange({ ...node, options: newOptions });
  };

  return (
    <div className="decision-node">
      <div className="node-header">
        <div className="field-group">
          <Label>Soru</Label>
          <Input
            value={node.question}
            onChange={(e) => updateQuestion(e.target.value)}
            placeholder="Karar sorusu"
          />
        </div>
        <Button type="button" variant="ghost" onClick={addOption}>
          + Seçenek
        </Button>
      </div>

      <div className="options-list">
        {node.options.map((option, index) => (
          <DecisionOptionForm
            key={index}
            option={option}
            onChange={(newOption) => updateOption(index, newOption)}
            onDelete={() => deleteOption(index)}
            level={level}
          />
        ))}
      </div>
    </div>
  );
};

export const DecisionTreeForm: React.FC<DecisionTreeFormProps> = ({ value, onChange }) => {
  return (
    <div className="decision-tree-form">
      <DecisionTreeViewer
        tree={value}
        onChange={onChange}
        editable={true}
      />
    </div>
  );
};