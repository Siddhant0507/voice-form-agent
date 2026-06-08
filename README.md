# voice-form-agent

Convert any form into a voice conversation powered by [Vapi AI](https://vapi.ai).

Instead of typing, users click a button and speak their answers. The AI asks each question naturally, confirms answers, and submits the form automatically when done.

---

## Installation

```bash
npm install voice-form-agent
```

```bash
yarn add voice-form-agent
```

Requires React 17 or later as a peer dependency.

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
3. The assistant asks each question one at a time in a natural, conversational tone
4. When all answers are collected, it calls an internal `submitForm` tool
5. `onComplete` fires with a structured object containing all field values
6. The button updates to a **✓ Form submitted** badge

---

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `vapiKey` | `string` | Yes | Your Vapi public API key |
| `fields` | `FormField[]` | Yes | List of fields to collect (see below) |
| `onComplete` | `(data: FormData) => void` | No | Called with collected answers when the form is complete |
| `onError` | `(error: Error) => void` | No | Called if Vapi encounters an error |
| `assistantName` | `string` | No | Name the AI introduces itself as (default: `"Form Assistant"`) |
| `firstMessage` | `string` | No | Opening line the assistant speaks (default: `"Hi! I'll help you fill out this form. Let's get started."`) |
| `buttonLabel` | `string` | No | Label on the start button (default: `"Start Voice Form"`) |
| `stopLabel` | `string` | No | Label on the stop button (default: `"Stop"`) |
| `className` | `string` | No | CSS class applied to the wrapper element |

### `FormField`

| Property | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | Yes | Key used in the `onComplete` data object |
| `label` | `string` | Yes | Human-readable name — the AI uses this to ask the question |
| `type` | `FieldType` | No | Hint for the AI (default: `"text"`) |
| `required` | `boolean` | No | Whether the field must be collected (default: `true`) |

**`FieldType`:** `"text"` `"email"` `"phone"` `"number"` `"textarea"`

---

## Examples

### Lead generation form

```tsx
<VoiceFormAgent
  vapiKey={process.env.NEXT_PUBLIC_VAPI_KEY!}
  assistantName="Aria"
  firstMessage="Hi! I'm Aria. I'll grab a few details so we can get back to you."
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

### Job application

```tsx
<VoiceFormAgent
  vapiKey={process.env.NEXT_PUBLIC_VAPI_KEY!}
  fields={[
    { id: 'name',       label: 'Full Name' },
    { id: 'email',      label: 'Email Address', type: 'email' },
    { id: 'phone',      label: 'Phone Number', type: 'phone' },
    { id: 'role',       label: 'Role you are applying for' },
    { id: 'experience', label: 'Years of experience', type: 'number' },
    { id: 'note',       label: 'Anything else you want us to know?', required: false },
  ]}
  onComplete={(data) => saveApplication(data)}
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

---

## License

MIT
