var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/hooks/useVoiceForm.ts
import { useCallback, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";

// src/utils/buildAssistantConfig.ts
function buildSystemPrompt(fields, assistantName) {
  const fieldList = fields.map((f, i) => `${i + 1}. ${f.label}${f.required === false ? " (optional)" : ""}`).join("\n");
  return `You are ${assistantName}, a friendly voice form assistant. Your job is to collect the following information from the user through natural conversation.

Fields to collect:
${fieldList}

Instructions:
- Ask one question at a time in a warm, conversational tone.
- Confirm answers when appropriate (e.g. "Got it, your email is john@example.com").
- If a user gives an unclear answer, politely ask for clarification.
- For email or phone fields, confirm the value by repeating it back.
- Once you have collected ALL fields, call the submitForm function immediately with all the collected data.
- Do not make up or assume any values \u2014 only use what the user tells you.`;
}
function buildToolParameters(fields) {
  const properties = {};
  const required = [];
  for (const field of fields) {
    properties[field.id] = {
      type: "string",
      description: field.label
    };
    if (field.required !== false) {
      required.push(field.id);
    }
  }
  return { properties, required };
}
function buildAssistantConfig(fields, assistantName, firstMessage) {
  const { properties, required } = buildToolParameters(fields);
  return {
    name: assistantName,
    firstMessage,
    model: {
      provider: "openai",
      model: "gpt-4o-mini",
      systemPrompt: buildSystemPrompt(fields, assistantName),
      tools: [
        {
          type: "function",
          function: {
            name: "submitForm",
            description: "Call this function once all form fields have been collected from the user.",
            parameters: {
              type: "object",
              properties,
              required
            }
          }
        }
      ]
    },
    voice: {
      provider: "11labs",
      voiceId: "rachel"
    },
    endCallFunctionEnabled: true
  };
}

// src/hooks/useVoiceForm.ts
function useVoiceForm({
  vapiKey,
  fields,
  assistantName,
  firstMessage,
  onComplete,
  onError
}) {
  const vapiRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  useEffect(() => {
    const vapi = new Vapi(vapiKey);
    vapiRef.current = vapi;
    vapi.on("call-start", () => setStatus("active"));
    vapi.on("call-end", () => {
      setStatus((prev) => prev === "completed" ? "completed" : "idle");
      setVolumeLevel(0);
    });
    vapi.on("volume-level", (level) => setVolumeLevel(level));
    vapi.on("message", (msg) => {
      var _a;
      if ((msg == null ? void 0 : msg.type) !== "tool-calls") return;
      const toolCallList = (_a = msg.toolCallList) != null ? _a : [];
      for (const call of toolCallList) {
        if (call.function.name === "submitForm") {
          try {
            const data = typeof call.function.arguments === "string" ? JSON.parse(call.function.arguments) : call.function.arguments;
            setStatus("completed");
            onComplete == null ? void 0 : onComplete(data);
            vapi.stop();
          } catch (e) {
            onError == null ? void 0 : onError(new Error("Failed to parse form data from assistant."));
          }
        }
      }
    });
    vapi.on("error", (err) => {
      setStatus("error");
      onError == null ? void 0 : onError(err);
    });
    return () => {
      vapi.stop();
    };
  }, [vapiKey]);
  const start = useCallback(() => {
    if (!vapiRef.current) return;
    setStatus("connecting");
    const config = buildAssistantConfig(fields, assistantName, firstMessage);
    vapiRef.current.start(config);
  }, [fields, assistantName, firstMessage]);
  const stop = useCallback(() => {
    var _a;
    (_a = vapiRef.current) == null ? void 0 : _a.stop();
    setStatus("idle");
  }, []);
  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return;
    const next = !isMuted;
    vapiRef.current.setMuted(next);
    setIsMuted(next);
  }, [isMuted]);
  return { status, isMuted, volumeLevel, start, stop, toggleMute };
}

// src/components/VoiceFormAgent.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function VoiceFormAgent({
  vapiKey,
  fields,
  onComplete,
  onError,
  assistantName = "Form Assistant",
  firstMessage = "Hi! I'll help you fill out this form. Let's get started.",
  buttonLabel = "Start Voice Form",
  stopLabel = "Stop",
  className
}) {
  const { status, isMuted, volumeLevel, start, stop, toggleMute } = useVoiceForm({
    vapiKey,
    fields,
    assistantName,
    firstMessage,
    onComplete,
    onError
  });
  const isActive = status === "active";
  const isConnecting = status === "connecting";
  const isCompleted = status === "completed";
  const barCount = 5;
  const bars = Array.from({ length: barCount });
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className,
      style: styles.wrapper,
      "data-voice-form-status": status,
      children: [
        (isActive || isConnecting) && /* @__PURE__ */ jsx("div", { style: styles.visualizer, children: bars.map((_, i) => {
          const height = isActive ? Math.max(4, Math.round(volumeLevel * 40 * Math.sin((i + 1) * 0.8))) : 4;
          return /* @__PURE__ */ jsx(
            "div",
            {
              style: __spreadProps(__spreadValues({}, styles.bar), {
                height,
                opacity: isConnecting ? 0.4 : 1,
                transition: "height 80ms ease"
              })
            },
            i
          );
        }) }),
        isCompleted ? /* @__PURE__ */ jsxs("div", { style: styles.completedBadge, children: [
          /* @__PURE__ */ jsx("span", { style: styles.checkmark, children: "\u2713" }),
          "Form submitted"
        ] }) : isActive || isConnecting ? /* @__PURE__ */ jsxs("div", { style: styles.controls, children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: toggleMute,
              style: styles.muteButton,
              "aria-label": isMuted ? "Unmute" : "Mute",
              title: isMuted ? "Unmute" : "Mute",
              children: isMuted ? "\u{1F507}" : "\u{1F399}\uFE0F"
            }
          ),
          /* @__PURE__ */ jsx("button", { onClick: stop, style: styles.stopButton, disabled: isConnecting, children: isConnecting ? "Connecting\u2026" : stopLabel })
        ] }) : /* @__PURE__ */ jsxs("button", { onClick: start, style: styles.startButton, children: [
          "\u{1F399}\uFE0F ",
          buttonLabel
        ] })
      ]
    }
  );
}
var styles = {
  wrapper: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    fontFamily: "inherit"
  },
  visualizer: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    height: 40
  },
  bar: {
    width: 4,
    borderRadius: 2,
    background: "#6366f1",
    minHeight: 4
  },
  controls: {
    display: "flex",
    gap: 8,
    alignItems: "center"
  },
  startButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    background: "#6366f1",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer"
  },
  stopButton: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer"
  },
  muteButton: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontSize: 16,
    cursor: "pointer"
  },
  completedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 8,
    background: "#f0fdf4",
    color: "#15803d",
    fontSize: 14,
    fontWeight: 600,
    border: "1px solid #bbf7d0"
  },
  checkmark: {
    fontSize: 16
  }
};
export {
  VoiceFormAgent,
  useVoiceForm
};
//# sourceMappingURL=index.mjs.map