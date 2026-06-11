# voice-form-agent

> **Feedback & Contributions Welcome!**
> This package is actively evolving and I'd love to hear from you. If you run into issues, have ideas for improvements, or want to contribute, please open an issue or PR on [GitHub](https://github.com/Siddhant0507/voice-form-agent). All feedback — big or small — is appreciated.

Convert any form into a voice conversation powered by [Vapi AI](https://vapi.ai).

Instead of typing, users click a button and speak their answers. The AI asks each question naturally, confirms answers, and submits the form automatically when done.

---

## Installation

```bash
npm install voice-form-agent @vapi-ai/web
```

```bash
yarn add voice-form-agent @vapi-ai/web
```

`@vapi-ai/web` is a required peer dependency. If you hit issues with older versions, add this to your project's `package.json`:

```json
"overrides": {
  "@daily-co/daily-js": "0.90.0"
}
```

Requires React 17 or later.

---

## Quick start

```tsx
import { VoiceFormAgent } from 'voice-form-agent'

export default function ContactPage() {
  return (
    <VoiceFormAgent
      vapiKey="your-vapi-public-key"
      fields={[
        { id: 'name',    label: 'Full Name' },
        { id: 'email',   label: 'Email Address', type: 'email' },
        { id: 'message', label: 'Tell us about your project', type: 'textarea' },
      ]}
      onComplete={(data) => {
        console.log(data)
        // { name: "John Smith", email: "john@example.com", message: "..." }
      }}
    />
  )
}
```

Your Vapi public key is available in the [Vapi Dashboard](https://dashboard.vapi.ai) under **API Keys**.

---

## How it works

1. User clicks **🎙️ Start Voice Form**
2. Vapi starts a call with a dynamically generated assistant configured from your `fields`
3. The assistant greets the user and asks each question one at a time
4. When all answers are collected, it calls an internal `submitForm` tool
5. `onComplete` fires with a structured object containing all field values
6. The button updates to a **✓ Form submitted** badge

---

## Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `vapiKey` | `string` | Yes | — | Your Vapi public API key |
| `fields` | `FormField[]` | Yes | — | List of fields to collect |
| `onComplete` | `(data: FormData) => void` | No | — | Called with collected answers when done |
| `onError` | `(error: Error) => void` | No | — | Called if Vapi encounters an error |
| `assistantName` | `string` | No | `"Form Assistant"` | Name the AI introduces itself as |
| `firstMessage` | `string` | No | `"Hi! I'll help you fill out this form. Let's get started."` | Opening line the assistant speaks |
| `voice` | `VoiceConfig` | No | `{ provider: 'openai', voiceId: 'alloy' }` | Voice provider and voice ID |
| `model` | `AIModel` | No | `"gpt-4o-mini"` | AI model for the assistant |
| `buttonLabel` | `string` | No | `"Start Voice Form"` | Label on the start button |
| `stopLabel` | `string` | No | `"Stop"` | Label on the stop button |
| `className` | `string` | No | — | CSS class applied to the wrapper element |

### `FormField`

| Property | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Key used in the `onComplete` data object |
| `label` | `string` | Yes | Human-readable name — the AI uses this to ask the question |
| `type` | `FieldType` | No | Hint for the AI (default: `"text"`) |
| `required` | `boolean` | No | Whether the field must be collected (default: `true`) |

**`FieldType`:** `"text"` `"email"` `"phone"` `"number"` `"textarea"`

---

## Voices

The `voice` prop accepts a `VoiceConfig` object with a `provider` and `voiceId`.

### OpenAI voices — no extra credentials needed

Works out of the box with any Vapi account.

```tsx
voice={{ provider: 'openai', voiceId: 'alloy' }}   // default — neutral, versatile
voice={{ provider: 'openai', voiceId: 'echo' }}    // male, clear
voice={{ provider: 'openai', voiceId: 'fable' }}   // expressive, storyteller
voice={{ provider: 'openai', voiceId: 'onyx' }}    // deep, authoritative
voice={{ provider: 'openai', voiceId: 'nova' }}    // female, warm
voice={{ provider: 'openai', voiceId: 'shimmer' }} // female, soft
```

### ElevenLabs voices — requires ElevenLabs credentials

Add your ElevenLabs API key in [Vapi Dashboard → Credentials](https://dashboard.vapi.ai/keys) first.

```tsx
voice={{ provider: '11labs', voiceId: 'sarah' }}    // female, natural
voice={{ provider: '11labs', voiceId: 'matilda' }}  // female, warm
voice={{ provider: '11labs', voiceId: 'andrea' }}   // female, clear
voice={{ provider: '11labs', voiceId: 'marissa' }}  // female, friendly
voice={{ provider: '11labs', voiceId: 'paula' }}    // female, professional
voice={{ provider: '11labs', voiceId: 'myra' }}     // female, calm
voice={{ provider: '11labs', voiceId: 'ryan' }}     // male, natural
voice={{ provider: '11labs', voiceId: 'drew' }}     // male, conversational
voice={{ provider: '11labs', voiceId: 'paul' }}     // male, deep
voice={{ provider: '11labs', voiceId: 'phillip' }}  // male, energetic
voice={{ provider: '11labs', voiceId: 'burt' }}     // male, gruff
voice={{ provider: '11labs', voiceId: 'mrb' }}      // male, dramatic
voice={{ provider: '11labs', voiceId: 'mark' }}     // male, clear
voice={{ provider: '11labs', voiceId: 'joseph' }}   // male, authoritative
voice={{ provider: '11labs', voiceId: 'steve' }}    // male, upbeat
```

You can also pass any custom ElevenLabs voice ID from your Voice Library:

```tsx
voice={{ provider: '11labs', voiceId: 'YOUR_CUSTOM_VOICE_ID' }}
```

---

## AI Models

The `model` prop accepts a string model name. All models use OpenAI as the provider.

| Model | Speed | Quality | Best for |
|---|---|---|---|
| `"gpt-4o-mini"` | Fast | Good | **Default** — most forms |
| `"gpt-4o"` | Medium | Great | Complex multi-step forms |
| `"gpt-4.1-nano"` | Fastest | Basic | Simple, short forms |
| `"gpt-4.1-mini"` | Fast | Good | General use |
| `"gpt-4.1"` | Medium | Best | High-stakes / long forms |
| `"gpt-3.5-turbo"` | Fast | Basic | Budget option |

```tsx
<VoiceFormAgent
  vapiKey="..."
  model="gpt-4o"
  fields={[...]}
/>
```

You can also pass any valid OpenAI model string accepted by Vapi.

---

## Examples

### Custom voice and model

```tsx
<VoiceFormAgent
  vapiKey={process.env.NEXT_PUBLIC_VAPI_KEY!}
  assistantName="Aria"
  firstMessage="Hi! I'm Aria. I'll grab a few details so we can get back to you."
  voice={{ provider: 'openai', voiceId: 'nova' }}
  model="gpt-4o"
  fields={[
    { id: 'name',    label: 'Full Name' },
    { id: 'email',   label: 'Work Email', type: 'email' },
    { id: 'company', label: 'Company Name' },
    { id: 'budget',  label: 'Monthly Budget', type: 'number' },
    { id: 'details', label: 'What are you looking for?', type: 'textarea' },
  ]}
  onComplete={(data) => submitLeadToHubspot(data)}
/>
```

### ElevenLabs voice

```tsx
<VoiceFormAgent
  vapiKey={process.env.NEXT_PUBLIC_VAPI_KEY!}
  voice={{ provider: '11labs', voiceId: 'sarah' }}
  fields={[
    { id: 'name',  label: 'Full Name' },
    { id: 'email', label: 'Email Address', type: 'email' },
  ]}
  onComplete={(data) => console.log(data)}
/>
```

### Use only the hook (headless)

If you want to build your own UI:

```tsx
import { useVoiceForm } from 'voice-form-agent'

function MyCustomForm() {
  const { status, isMuted, volumeLevel, start, stop, toggleMute } = useVoiceForm({
    vapiKey: 'your-key',
    fields: [
      { id: 'name',  label: 'Full Name' },
      { id: 'email', label: 'Email', type: 'email' },
    ],
    assistantName: 'Form Assistant',
    firstMessage: "Hi, let's get started.",
    voice: { provider: 'openai', voiceId: 'nova' },
    model: 'gpt-4o-mini',
    onComplete: (data) => console.log(data),
  })

  return (
    <div>
      <p>Status: {status}</p>
      <button onClick={start} disabled={status !== 'idle'}>Start</button>
      <button onClick={stop}  disabled={status === 'idle'}>Stop</button>
      <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
    </div>
  )
}
```

### Status values

| Status | Meaning |
|---|---|
| `idle` | Not started |
| `connecting` | Connecting to Vapi |
| `active` | Call in progress |
| `completed` | All fields collected, form submitted |
| `error` | Something went wrong |

---

## Styling

The component ships with minimal inline styles so it works out of the box without any CSS setup. To apply your own styles, use the `className` prop on the wrapper or target the `data-voice-form-status` attribute:

```css
/* wrapper */
[data-voice-form-status] {
  gap: 16px;
}

/* only while active */
[data-voice-form-status="active"] {
  outline: 2px solid #6366f1;
  border-radius: 8px;
  padding: 8px;
}
```

---

## Requirements

- A [Vapi account](https://vapi.ai) (free tier available)
- Your **public** Vapi API key (safe to expose in the browser)
- React 17+
- `@vapi-ai/web` installed as a direct dependency

---

## License

MIT
