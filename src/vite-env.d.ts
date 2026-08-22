/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_PROXY_URL?: string
  readonly VITE_AI_MODEL_LABEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
