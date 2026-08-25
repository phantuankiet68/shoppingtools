// ============================================================
// Kbuilder AI Video — Script Provider
// ============================================================

import type {
    GeneratedScript,
    ScriptGenerationInput,
} from '@/features/platform/ai-video/types/script';

// ============================================================
// SCRIPT PROVIDER CONTRACT
// ============================================================

export interface ScriptProvider {
    generate(input: ScriptGenerationInput): Promise<GeneratedScript>;
}
