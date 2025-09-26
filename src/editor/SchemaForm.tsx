import React from 'react';
import { NodeSchema, NodeSchemaField } from '../model/nodeSchemas';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { DecisionTreeForm } from '../components/DecisionTreeForm';
import { JsonEditor } from '../components/JsonEditor';
import { VariableInput } from '../components/VariableInput';
import { FlowVariable } from '../model/flow';
import { cn } from '../utils/cn';

type PropertyValue = Record<string, any>;

export interface SchemaFormProps {
  schema: NodeSchema<any>;
  value: PropertyValue;
  onChange: (value: PropertyValue) => void;
  variables?: Record<string, FlowVariable>;
}

const getValueAtPath = (obj: PropertyValue, path: string[]): any => {
  return path.reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
};

const setValueAtPath = (obj: PropertyValue, path: string[], value: any): PropertyValue => {
  if (!path.length) return value;
  const [head, ...tail] = path;
  return {
    ...obj,
    [head]: tail.length ? setValueAtPath(obj?.[head] ?? {}, tail, value) : value
  };
};

const removeIndex = (arr: any[], index: number) => arr.filter((_, idx) => idx !== index);

const renderPrimitiveField = (
  field: NodeSchemaField,
  value: any,
  onValueChange: (value: any) => void,
  variables?: Record<string, FlowVariable>
) => {
  switch (field.type) {
    case 'text':
      return (
        <VariableInput
          value={value ?? ''}
          onChange={onValueChange}
          variables={variables}
          multiline={false}
        />
      );
    case 'textarea':
      return (
        <VariableInput
          value={value ?? ''}
          onChange={onValueChange}
          variables={variables}
          multiline={true}
        />
      );
    case 'number':
      return (
        <Input
          type="number"
          value={value ?? ''}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(event) =>
            onValueChange(event.target.value === '' ? undefined : Number(event.target.value))
          }
        />
      );
    case 'boolean':
      return <Switch checked={Boolean(value)} onCheckedChange={(checked) => onValueChange(checked)} />;
    case 'select':
      return (
        <Select
          value={value ?? field.options?.[0]?.value ?? ''}
          onChange={(event) => onValueChange(event.target.value)}
          options={field.options ?? []}
        />
      );
    case 'decision_tree':
      return (
        <DecisionTreeForm
          value={value || {
            question: 'Yeni soru?',
            options: [
              { text: 'Seçenek 1', value: 'option1', output: 'output1' }
            ]
          }}
          onChange={onValueChange}
        />
      );
    case 'json':
      return (
        <JsonEditor
          value={value}
          onChange={onValueChange}
          minHeight="150px"
          variables={variables}
        />
      );
    default:
      return null;
  }
};

const SchemaFieldRenderer: React.FC<{
  field: NodeSchemaField;
  path: string[];
  value: PropertyValue;
  onChange: (value: PropertyValue) => void;
  variables?: Record<string, FlowVariable>;
}> = ({ field, path, value, onChange, variables }) => {
  const fieldValue = getValueAtPath(value, path);

  if (field.type === 'object') {
    return (
      <div className="space-y-3">
        <Label>{field.label}</Label>
        <Card>
          <CardContent className="p-3 space-y-3">
            {field.fields.map((child) => (
              <SchemaFieldRenderer
                key={child.name}
                field={child}
                path={[...path, child.name]}
                value={value}
                onChange={onChange}
                variables={variables}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (field.type === 'list') {
    const items: any[] = Array.isArray(fieldValue) ? fieldValue : [];
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{field.label}</Label>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onChange(
                setValueAtPath(value, path, [...items, field.defaultItem ?? {}])
              );
            }}
          >
            + Ekle
          </Button>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{field.itemLabel ?? 'Öğe'} #{index + 1}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-destructive hover:text-destructive"
                    onClick={() =>
                      onChange(setValueAtPath(value, path, removeIndex(items, index)))
                    }
                  >
                    Kaldır
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {field.fields.map((child) => (
                  <SchemaFieldRenderer
                    key={child.name}
                    field={child}
                    path={[...path, index.toString(), child.name]}
                    value={value}
                    onChange={onChange}
                    variables={variables}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === 'keyValue') {
    const entries = Object.entries(fieldValue ?? {});
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{field.label}</Label>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onChange(
                setValueAtPath(value, path, { ...fieldValue, Yeni: 'Değer' })
              );
            }}
          >
            + Ekle
          </Button>
        </div>
        <div className="space-y-2">
          {entries.map(([key, val]) => (
            <Card key={key}>
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-2 items-center">
                  <Input
                    value={key}
                    onChange={(event) => {
                      const newEntries = Object.fromEntries(
                        entries.map(([entryKey, entryValue]) =>
                          entryKey === key ? [event.target.value, entryValue] : [entryKey, entryValue]
                        )
                      );
                      onChange(setValueAtPath(value, path, newEntries));
                    }}
                  />
                  <div className="flex gap-2">
                    <Input
                      value={val as string}
                      onChange={(event) => {
                        onChange(
                          setValueAtPath(value, path, { ...fieldValue, [key]: event.target.value })
                        );
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        const newEntries = Object.fromEntries(entries.filter(([entryKey]) => entryKey !== key));
                        onChange(setValueAtPath(value, path, newEntries));
                      }}
                    >
                      Sil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Label>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderPrimitiveField(field, fieldValue, (updated) => {
        onChange(setValueAtPath(value, path, updated));
      }, variables)}
      {field.description && (
        <p className={cn('text-xs text-muted-foreground')}>{field.description}</p>
      )}
    </div>
  );
};

export const SchemaForm: React.FC<SchemaFormProps> = ({ schema, value, onChange, variables }) => {
  return (
    <div className="space-y-4">
      {schema.fields.map((field) => (
        <SchemaFieldRenderer
          key={field.name}
          field={field}
          path={[field.name]}
          value={value}
          onChange={onChange}
          variables={variables}
        />
      ))}
    </div>
  );
};
