import { NodeSchema } from './nodeSchemas';
import { NodeType } from './flow';

type NodeSchemaMap = Record<NodeType, NodeSchema<any>>;

const defaultString = (value: string) => () => ({ title: value });

export const nodeSchemas: NodeSchemaMap = {
  start: {
    type: 'start',
    title: 'Start',
    description: 'Flow entry point',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' }
    ],
    defaultProperties: defaultString('Akış Başlangıcı'),
    summary: (props) => [{ label: 'Title', value: props.title ?? 'Start' }],
    computeOutputs: () => ['next']
  },
  end: {
    type: 'end',
    title: 'End',
    description: 'Flow termination node',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'message', label: 'Message', type: 'textarea' },
      { name: 'returnToMain', label: 'Return to Main', type: 'boolean' }
    ],
    defaultProperties: () => ({
      title: 'Akış Sonu',
      message: 'Teşekkürler, size nasıl yardımcı olabilirim?',
      returnToMain: true
    }),
    summary: (props) => [
      { label: 'Title', value: props.title ?? 'End' },
      { label: 'Message', value: props.message ?? '' }
    ],
    computeInputs: () => ['previous']
  },
  message: {
    type: 'message',
    title: 'Message',
    description: 'Send a message to the user',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'message', label: 'Message', type: 'textarea', required: true },
      {
        name: 'messageType',
        label: 'Message Type',
        type: 'select',
        options: [
          { label: 'Text', value: 'text' },
          { label: 'Markdown', value: 'markdown' },
          { label: 'Html', value: 'html' }
        ]
      },
      { name: 'delay', label: 'Delay (ms)', type: 'number', min: 0, step: 100 },
      { name: 'typing', label: 'Show Typing Indicator', type: 'boolean' }
    ],
    defaultProperties: () => ({
      title: 'Mesaj Gönder',
      message: 'Merhaba! Size nasıl yardımcı olabilirim?',
      messageType: 'text',
      delay: 0,
      typing: true
    }),
    summary: (props) => [
      { label: 'Title', value: props.title ?? 'Message' },
      { label: 'Preview', value: props.message ?? '' }
    ],
    computeInputs: () => ['previous'],
    computeOutputs: () => ['next']
  },
  button: {
    type: 'button',
    title: 'Button',
    description: 'Multi-option button selector',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'message', label: 'Prompt Message', type: 'textarea', required: true },
      {
        name: 'buttons',
        label: 'Buttons',
        type: 'list',
        itemLabel: 'Button',
        defaultItem: {
          text: 'Yeni Buton',
          value: 'option',
          icon: '✨',
          color: '#2563eb'
        },
        fields: [
          { name: 'text', label: 'Label', type: 'text', required: true },
          { name: 'value', label: 'Value', type: 'text', required: true },
          { name: 'icon', label: 'Icon', type: 'text' },
          { name: 'color', label: 'Color', type: 'text' }
        ]
      },
      { name: 'allowMultiSelect', label: 'Allow Multiple', type: 'boolean' },
      { name: 'timeout', label: 'Timeout (sec)', type: 'number', min: 0 }
    ],
    defaultProperties: () => ({
      title: 'Buton Seçenekleri',
      message: 'Hangi konuda yardım istiyorsunuz?',
      buttons: [
        { text: 'Kredi', value: 'credit', icon: '💳', color: '#007bff' },
        { text: 'Mevduat', value: 'deposit', icon: '💰', color: '#28a745' }
      ],
      allowMultiSelect: false,
      timeout: 300
    }),
    summary: (props) => [
      { label: 'Title', value: props.title ?? 'Button' },
      { label: 'Options', value: `${props.buttons?.length ?? 0} seçenek` }
    ],
    computeInputs: () => ['previous'],
    computeOutputs: (props) => {
      const buttons = Array.isArray(props.buttons) ? props.buttons : [];
      const outputs = buttons.map((button: any) => button.value ?? button.text ?? 'option');
      outputs.push('timeout');
      return outputs;
    }
  },
  input: {
    type: 'input',
    title: 'Input',
    description: 'Collect user input with validation',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'message', label: 'Prompt Message', type: 'textarea', required: true },
      {
        name: 'inputType',
        label: 'Input Type',
        type: 'select',
        options: [
          { label: 'Text', value: 'text' },
          { label: 'Number', value: 'number' },
          { label: 'Email', value: 'email' },
          { label: 'Phone', value: 'tel' }
        ]
      },
      {
        name: 'validation',
        label: 'Validation',
        type: 'object',
        fields: [
          { name: 'required', label: 'Required', type: 'boolean' },
          { name: 'min', label: 'Min', type: 'number' },
          { name: 'max', label: 'Max', type: 'number' },
          { name: 'pattern', label: 'Pattern', type: 'text' }
        ]
      },
      { name: 'placeholder', label: 'Placeholder', type: 'text' },
      {
        name: 'retry',
        label: 'Retry Configuration',
        type: 'object',
        fields: [
          { name: 'maxAttempts', label: 'Max Attempts', type: 'number' },
          { name: 'errorMessage', label: 'Error Message', type: 'textarea' }
        ]
      }
    ],
    defaultProperties: () => ({
      title: 'Kullanıcı Girişi',
      message: 'Lütfen tutarı giriniz:',
      inputType: 'number',
      validation: {
        required: true,
        min: 1000,
        max: 1000000,
        pattern: '^[0-9]+$'
      },
      placeholder: 'Örn: 50000',
      retry: {
        maxAttempts: 3,
        errorMessage: 'Geçerli bir tutar giriniz (1.000 - 1.000.000 TL)'
      }
    }),
    summary: (props) => [
      { label: 'Title', value: props.title ?? 'Input' },
      { label: 'Type', value: props.inputType ?? 'text' }
    ],
    computeInputs: () => ['previous'],
    computeOutputs: () => ['valid', 'invalid', 'timeout']
  },
  condition: {
    type: 'condition',
    title: 'Condition',
    description: 'Route flow based on condition evaluation',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      {
        name: 'conditions',
        label: 'Conditions',
        type: 'list',
        itemLabel: 'Condition',
        defaultItem: {
          variable: '{{variable}}',
          operator: '==',
          value: '',
          output: 'output'
        },
        fields: [
          { name: 'variable', label: 'Variable', type: 'text', required: true },
          {
            name: 'operator',
            label: 'Operator',
            type: 'select',
            options: [
              { label: '==', value: '==' },
              { label: '!=', value: '!=' },
              { label: '>', value: '>' },
              { label: '>=', value: '>=' },
              { label: '<', value: '<' },
              { label: '<=', value: '<=' }
            ]
          },
          { name: 'value', label: 'Value', type: 'text' },
          { name: 'output', label: 'Output Handle', type: 'text', required: true }
        ]
      },
      { name: 'defaultOutput', label: 'Default Output', type: 'text' }
    ],
    defaultProperties: () => ({
      title: 'Koşul Kontrolü',
      conditions: [
        {
          variable: '{{input_amount}}',
          operator: '>',
          value: 100000,
          output: 'high_amount'
        },
        {
          variable: '{{input_amount}}',
          operator: '<=',
          value: 100000,
          output: 'low_amount'
        }
      ],
      defaultOutput: 'error'
    }),
    summary: (props) => {
      const total = props.conditions?.length ?? 0;
      return [
        { label: 'Title', value: props.title ?? 'Condition' },
        { label: 'Rules', value: `${total} koşul` }
      ];
    },
    computeInputs: () => ['previous'],
    computeOutputs: (props) => {
      const outputs: string[] = [];
      if (Array.isArray(props.conditions)) {
        props.conditions.forEach((condition: any, index: number) => {
          outputs.push(condition.output ?? `condition_${index + 1}`);
        });
      }
      if (props.defaultOutput) {
        outputs.push(props.defaultOutput);
      }
      return outputs.length ? outputs : ['default'];
    }
  },
  function: {
    type: 'function',
    title: 'Function',
    description: 'Call a reusable function block',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      {
        name: 'functionType',
        label: 'Function Type',
        type: 'select',
        options: [
          { label: 'Calculation', value: 'calculation' },
          { label: 'Transformation', value: 'transformation' },
          { label: 'Validation', value: 'validation' }
        ]
      },
      {
        name: 'function',
        label: 'Function Config',
        type: 'object',
        fields: [
          { name: 'name', label: 'Function Name', type: 'text', required: true },
          { name: 'parameters', label: 'Parameters', type: 'json' }
        ]
      },
      {
        name: 'outputMapping',
        label: 'Output Mapping',
        type: 'json'
      },
      {
        name: 'errorHandling',
        label: 'Error Handling',
        type: 'object',
        fields: [
          { name: 'onError', label: 'On Error Output', type: 'text' },
          { name: 'retryCount', label: 'Retry Count', type: 'number', min: 0 }
        ]
      }
    ],
    defaultProperties: () => ({
      title: 'Hesaplama Fonksiyonu',
      functionType: 'calculation',
      function: {
        name: 'calculateLoanPayment',
        parameters: {
          amount: '{{input_amount}}',
          rate: '{{selected_rate}}',
          term: '{{selected_term}}'
        }
      },
      outputMapping: {
        monthlyPayment: '{{result.monthlyPayment}}',
        totalAmount: '{{result.totalAmount}}'
      },
      errorHandling: {
        onError: 'error_output',
        retryCount: 2
      }
    }),
    summary: (props) => [
      { label: 'Title', value: props.title ?? 'Function' },
      { label: 'Function', value: props.function?.name ?? 'Unnamed' }
    ],
    computeInputs: () => ['previous'],
    computeOutputs: () => ['success', 'error']
  },
  agent: {
    type: 'agent',
    title: 'Agent',
    description: 'Invoke an AI agent',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      {
        name: 'agentType',
        label: 'Agent Type',
        type: 'select',
        options: [
          { label: 'GPT', value: 'gpt' },
          { label: 'Internal', value: 'internal' }
        ]
      },
      {
        name: 'config',
        label: 'Agent Config',
        type: 'object',
        fields: [
          { name: 'model', label: 'Model', type: 'text', required: true },
          { name: 'temperature', label: 'Temperature', type: 'number', min: 0, max: 2, step: 0.1 },
          { name: 'maxTokens', label: 'Max Tokens', type: 'number', min: 1 },
          { name: 'systemPrompt', label: 'System Prompt', type: 'textarea' },
          { name: 'context', label: 'Context Binding', type: 'text' }
        ]
      },
      {
        name: 'inputMapping',
        label: 'Input Mapping',
        type: 'json'
      },
      {
        name: 'outputParsing',
        label: 'Output Parsing',
        type: 'object',
        fields: [
          { name: 'extractIntent', label: 'Extract Intent', type: 'boolean' },
          { name: 'extractEntities', label: 'Extract Entities', type: 'boolean' },
          { name: 'responseField', label: 'Response Field', type: 'text' }
        ]
      }
    ],
    defaultProperties: () => ({
      title: 'AI Agent',
      agentType: 'gpt',
      config: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 500,
        systemPrompt: 'Sen bir banka müşteri temsilcisisin. Müşteriye yardımcı ol.',
        context: '{{conversation_history}}'
      },
      inputMapping: {
        userMessage: '{{user_input}}',
        context: '{{session_context}}'
      },
      outputParsing: {
        extractIntent: true,
        extractEntities: true,
        responseField: 'message'
      }
    }),
    summary: (props) => [
      { label: 'Title', value: props.title ?? 'Agent' },
      { label: 'Model', value: props.config?.model ?? 'model' }
    ],
    computeInputs: () => ['previous'],
    computeOutputs: () => ['success', 'error', 'fallback']
  },
  api: {
    type: 'api',
    title: 'API',
    description: 'Call external API',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'method', label: 'HTTP Method', type: 'select', options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'PATCH', value: 'PATCH' },
        { label: 'DELETE', value: 'DELETE' }
      ] },
      { name: 'url', label: 'URL', type: 'text', required: true },
      { name: 'headers', label: 'Headers', type: 'keyValue', keyLabel: 'Header', valueLabel: 'Value' },
      { name: 'body', label: 'Body', type: 'json' },
      { name: 'timeout', label: 'Timeout (s)', type: 'number', min: 0 },
      {
        name: 'retry',
        label: 'Retry',
        type: 'object',
        fields: [
          { name: 'maxAttempts', label: 'Max Attempts', type: 'number' },
          { name: 'backoff', label: 'Backoff Strategy', type: 'select', options: [
            { label: 'Constant', value: 'constant' },
            { label: 'Linear', value: 'linear' },
            { label: 'Exponential', value: 'exponential' }
          ] }
        ]
      },
      { name: 'responseMapping', label: 'Response Mapping', type: 'json' }
    ],
    defaultProperties: () => ({
      title: 'Dış Servis Çağrısı',
      method: 'POST',
      url: 'https://api.bank.com/calculate',
      headers: {
        Authorization: 'Bearer {{api_token}}',
        'Content-Type': 'application/json'
      },
      body: {
        amount: '{{input_amount}}',
        type: '{{loan_type}}'
      },
      timeout: 30,
      retry: {
        maxAttempts: 3,
        backoff: 'exponential'
      },
      responseMapping: {
        result: '{{response.data.result}}',
        error: '{{response.error}}'
      }
    }),
    summary: (props) => [
      { label: 'Title', value: props.title ?? 'API' },
      { label: 'Method', value: props.method ?? 'POST' }
    ],
    computeInputs: () => ['previous'],
    computeOutputs: () => ['success', 'error', 'timeout']
  },
  form: {
    type: 'form',
    title: 'Form',
    description: 'Collect structured user data',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'message', label: 'Message', type: 'textarea' },
      {
        name: 'fields',
        label: 'Form Fields',
        type: 'list',
        itemLabel: 'Field',
        defaultItem: {
          name: 'field',
          type: 'text',
          label: 'Yeni Alan',
          required: false
        },
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true },
          {
            name: 'type',
            label: 'Type',
            type: 'select',
            options: [
              { label: 'Text', value: 'text' },
              { label: 'Number', value: 'number' },
              { label: 'Tel', value: 'tel' },
              { label: 'Email', value: 'email' }
            ]
          },
          { name: 'label', label: 'Label', type: 'text' },
          { name: 'required', label: 'Required', type: 'boolean' },
          { name: 'validation', label: 'Validation', type: 'text' },
          { name: 'min', label: 'Min', type: 'number' },
          { name: 'max', label: 'Max', type: 'number' },
          { name: 'mask', label: 'Mask', type: 'text' }
        ]
      },
      { name: 'submitButton', label: 'Submit Button', type: 'text' },
      { name: 'cancelButton', label: 'Cancel Button', type: 'text' }
    ],
    defaultProperties: () => ({
      title: 'Müşteri Bilgi Formu',
      message: 'Lütfen bilgilerinizi doldurun:',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Ad Soyad',
          required: true,
          validation: '^[a-zA-ZğüşıöçĞÜŞİÖÇ\\s]+$'
        },
        {
          name: 'phone',
          type: 'tel',
          label: 'Telefon',
          required: true,
          mask: '(999) 999-9999'
        },
        {
          name: 'amount',
          type: 'number',
          label: 'Tutar (TL)',
          required: true,
          min: 1000,
          max: 1000000
        }
      ],
      submitButton: 'Devam Et',
      cancelButton: 'İptal'
    }),
    summary: (props) => [
      { label: 'Title', value: props.title ?? 'Form' },
      { label: 'Fields', value: `${props.fields?.length ?? 0} alan` }
    ],
    computeInputs: () => ['previous'],
    computeOutputs: () => ['submit', 'cancel']
  },
  table: {
    type: 'table',
    title: 'Table',
    description: 'Render tabular data',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'message', label: 'Message', type: 'textarea' },
      { name: 'data', label: 'Data Binding', type: 'text' },
      {
        name: 'columns',
        label: 'Columns',
        type: 'list',
        itemLabel: 'Column',
        defaultItem: {
          key: 'column',
          title: 'Başlık',
          format: 'text'
        },
        fields: [
          { name: 'key', label: 'Key', type: 'text', required: true },
          { name: 'title', label: 'Title', type: 'text', required: true },
          {
            name: 'format',
            label: 'Format',
            type: 'select',
            options: [
              { label: 'Text', value: 'text' },
              { label: 'Currency', value: 'currency' },
              { label: 'Percentage', value: 'percentage' }
            ]
          }
        ]
      },
      {
        name: 'actions',
        label: 'Actions',
        type: 'list',
        itemLabel: 'Action',
        defaultItem: {
          text: 'Seç',
          value: 'select',
          style: 'primary'
        },
        fields: [
          { name: 'text', label: 'Label', type: 'text' },
          { name: 'value', label: 'Value', type: 'text' },
          { name: 'style', label: 'Style', type: 'text' }
        ]
      }
    ],
    defaultProperties: () => ({
      title: 'Faiz Oranları',
      message: 'Güncel faiz oranlarımız:',
      data: '{{rate_data}}',
      columns: [
        { key: 'term', title: 'Vade', format: 'text' },
        { key: 'rate', title: 'Faiz Oranı', format: 'percentage' },
        { key: 'minAmount', title: 'Min. Tutar', format: 'currency' }
      ],
      actions: [{ text: 'Seç', value: 'select', style: 'primary' }]
    }),
    summary: (props) => [
      { label: 'Title', value: props.title ?? 'Table' },
      { label: 'Columns', value: `${props.columns?.length ?? 0} kolon` }
    ],
    computeInputs: () => ['previous'],
    computeOutputs: () => ['select', 'next']
  },
  decision_tree: {
    type: 'decision_tree',
    title: 'Decision Tree',
    description: 'Hierarchical decision structure',
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      {
        name: 'tree',
        label: 'Tree Definition',
        type: 'json'
      }
    ],
    defaultProperties: () => ({
      title: 'Karar Ağacı',
      tree: {
        question: 'Hangi ürün kategorisini tercih edersiniz?',
        options: [
          {
            text: 'Kredi',
            value: 'credit',
            children: {
              question: 'Hangi kredi türü?',
              options: [
                { text: 'İhtiyaç', value: 'personal', output: 'personal_credit' },
                { text: 'Taşıt', value: 'vehicle', output: 'vehicle_credit' }
              ]
            }
          },
          {
            text: 'Mevduat',
            value: 'deposit',
            output: 'deposit_flow'
          }
        ]
      }
    }),
    summary: (props) => [
      { label: 'Title', value: props.title ?? 'Decision Tree' }
    ],
    computeInputs: () => ['previous'],
    computeOutputs: () => ['personal_credit', 'vehicle_credit', 'deposit_flow']
  }
};

export type NodeSchemas = typeof nodeSchemas;
