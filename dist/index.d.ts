import React from 'react';

type FieldType = 'text' | 'email' | 'phone' | 'number' | 'textarea';
interface FormField {
    id: string;
    label: string;
    type?: FieldType;
    required?: boolean;
}
type FormData = Record<string, string>;
type VoiceFormStatus = 'idle' | 'connecting' | 'active' | 'completed' | 'error';
interface VoiceFormAgentProps {
    vapiKey: string;
    fields: FormField[];
    onComplete?: (data: FormData) => void;
    onError?: (error: Error) => void;
    assistantName?: string;
    firstMessage?: string;
    buttonLabel?: string;
    stopLabel?: string;
    className?: string;
}

declare function VoiceFormAgent({ vapiKey, fields, onComplete, onError, assistantName, firstMessage, buttonLabel, stopLabel, className, }: VoiceFormAgentProps): React.JSX.Element;

interface UseVoiceFormOptions {
    vapiKey: string;
    fields: FormField[];
    assistantName: string;
    firstMessage: string;
    onComplete?: (data: FormData) => void;
    onError?: (error: Error) => void;
}
declare function useVoiceForm({ vapiKey, fields, assistantName, firstMessage, onComplete, onError, }: UseVoiceFormOptions): {
    status: VoiceFormStatus;
    isMuted: boolean;
    volumeLevel: number;
    start: () => void;
    stop: () => void;
    toggleMute: () => void;
};

export { type FormData, type FormField, VoiceFormAgent, type VoiceFormAgentProps, type VoiceFormStatus, useVoiceForm };
