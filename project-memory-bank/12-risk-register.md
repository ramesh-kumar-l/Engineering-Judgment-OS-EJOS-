# Risk Register

| ID | Risk | Impact | Likelihood | Mitigation | Status |
|----|------|--------|-----------|------------|--------|
| R-001 | Offline-first vs AI Coach: AI features cannot run without network | High | High | **Mitigated (Phase 3):** Ollama provider runs a local model → AI Coach works fully offline. Online providers (Claude/Gemini) remain additive. Core workflows never block on AI. | Mitigated |
| R-002 | API keys used client-side (browser) for Claude/Gemini | Medium (key exposure if device/app compromised) | Medium | Keys stored locally only, never sent anywhere but the provider; single-device local-first model (AD-003). Ollama path needs no key. Revisit if multi-user/sync is ever added. | Accepted |
| R-003 | Ollama browser CORS: requests blocked unless `OLLAMA_ORIGINS` allows the app origin | Medium (offline AI silently fails) | Medium | Documented in Settings + memory bank; `Test connection` surfaces the failure clearly. | Open |
