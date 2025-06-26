/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLAUDE_API_KEY: "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"
  readonly VITE_NDI_BACKEND_URL: "https://edustream.somee.com"
  readonly VITE_CLIENT_ID: "3tq7ho23g5risndd90a76jre5f"
  readonly VITE_CLIENT_SECRET: "111rvn964mucumr6c3qq3n2poilvq5v92bkjh58p121nmoverquh"
  readonly VITE_TOKEN_URL: "https://staging.bhutanndi.com/authentication/v1/authenticate"
  readonly VITE_VERIFIER_BASE_URL: "https://demo-client.bhutanndi.com/verifier/v1"
  readonly VITE_WEBHOOK_BASE_URL: "https://demo-client.bhutanndi.com/webhook/v1"
  readonly VITE_WEBHOOK_ID: "edusw3weao"
}


interface ImportMeta {
  readonly env: ImportMetaEnv
}