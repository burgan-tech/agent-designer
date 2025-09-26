import { FlowDefinition } from './flow';

export const sampleFlow: FlowDefinition = {
  flowId: 'credit_application_flow',
  name: 'Kredi Başvuru Akışı',
  version: '1.0.0',
  description: 'Müşteri kredi başvurusu yapabilir',
  metadata: {
    category: 'credit',
    tags: ['kredi', 'başvuru', 'hesaplama'],
    author: 'flow_designer',
    createdAt: '2025-09-23T10:00:00Z',
    updatedAt: '2025-09-23T10:00:00Z'
  },
  triggers: ['kredi başvurusu', 'kredi almak istiyorum', 'kredi hesaplama'],
  variables: {
    user_amount: { name: 'user_amount', type: 'number', default: 0 },
    selected_term: { name: 'selected_term', type: 'number', default: 12 },
    monthly_payment: { name: 'monthly_payment', type: 'number', default: 0 }
  },
  nodes: [
    {
      type: 'start',
      id: 'start',
      position: { x: 0, y: 0 },
      properties: {
        title: 'Kredi Başvuru Başlangıç'
      }
    },
    {
      type: 'message',
      id: 'welcome_msg',
      position: { x: 0, y: 0 },
      properties: {
        message: 'Kredi başvurunuz için size yardımcı olabilirim. Kaç TL kredi almak istiyorsunuz?'
      }
    },
    {
      type: 'input',
      id: 'amount_input',
      position: { x: 0, y: 0 },
      properties: {
        inputType: 'number',
        validation: {
          required: true,
          min: 5000,
          max: 500000
        },
        variable: 'user_amount'
      }
    },
    {
      type: 'function',
      id: 'calculate_loan',
      position: { x: 0, y: 0 },
      properties: {
        functionType: 'calculation',
        function: {
          name: 'calculateLoan',
          parameters: {
            amount: '{{user_amount}}',
            rate: 1.99,
            term: 12
          }
        }
      }
    },
    {
      type: 'message',
      id: 'result_msg',
      position: { x: 0, y: 0 },
      properties: {
        message: '{{user_amount}} TL kredi için aylık ödemeniz {{monthly_payment}} TL olacaktır.'
      }
    },
    {
      type: 'end',
      id: 'end',
      position: { x: 0, y: 0 },
      properties: {
        message: 'Başka bir konuda yardım edebilir miyim?'
      }
    }
  ],
  edges: [
    { id: 'e1', source: 'start', target: 'welcome_msg', type: 'default' },
    { id: 'e2', source: 'welcome_msg', target: 'amount_input', type: 'default' },
    { id: 'e3', source: 'amount_input', target: 'calculate_loan', type: 'default', sourceHandle: 'valid' },
    { id: 'e4', source: 'calculate_loan', target: 'result_msg', type: 'default' },
    { id: 'e5', source: 'result_msg', target: 'end', type: 'default' }
  ]
};
