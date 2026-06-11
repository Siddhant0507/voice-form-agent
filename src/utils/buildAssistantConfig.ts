import { AIModel, FormField, VoiceConfig } from '../types'

export function buildSystemPrompt(fields: FormField[], assistantName: string): string {
  const fieldList = fields
    .map((f, i) => `${i + 1}. ${f.label}${f.required === false ? ' (optional)' : ''}`)
    .join('\n')

  return `You are ${assistantName}, a friendly voice form assistant. Your job is to collect the following information from the user through natural conversation.

Fields to collect:
${fieldList}

Instructions:
- Ask one question at a time in a warm, conversational tone.
- Confirm answers when appropriate (e.g. "Got it, your email is john@example.com").
- If a user gives an unclear answer, politely ask for clarification.
- For email or phone fields, confirm the value by repeating it back.
- Once you have collected ALL fields, call the submitForm function immediately with all the collected data.
- Do not make up or assume any values — only use what the user tells you.
- Do NOT end the call or hang up — only call submitForm when done.`
}

export function buildToolParameters(fields: FormField[]) {
  const properties: Record<string, { type: string; description: string }> = {}
  const required: string[] = []

  for (const field of fields) {
    properties[field.id] = {
      type: 'string',
      description: field.label,
    }
    if (field.required !== false) {
      required.push(field.id)
    }
  }

  return { properties, required }
}

const DEFAULT_VOICE: VoiceConfig = { provider: 'openai', voiceId: 'alloy' }
const DEFAULT_MODEL: AIModel = 'gpt-4o-mini'

export function buildAssistantConfig(
  fields: FormField[],
  assistantName: string,
  firstMessage: string,
  voice: VoiceConfig = DEFAULT_VOICE,
  model: AIModel = DEFAULT_MODEL,
) {
  const { properties, required } = buildToolParameters(fields)

  return {
    name: assistantName,
    firstMessage,
    firstMessageMode: 'assistant-speaks-first',
    model: {
      provider: 'openai',
      model,
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt(fields, assistantName),
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: 'submitForm',
            description:
              'Call this function once all form fields have been collected from the user. Do not call this until every field is answered.',
            parameters: {
              type: 'object',
              properties,
              required,
            },
          },
        },
      ],
    },
    voice,
  }
}
