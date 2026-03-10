/**
 * Streaming IA côté browser (web uniquement, pas Electron).
 * Utilise les mêmes SDKs que le main process Electron mais directement
 * depuis le renderer avec les clés API fournies par l'utilisateur.
 */

import type { AiProvider } from '../store/aiStore'

export interface WebStreamPayload {
  provider: AiProvider
  model: string
  systemPrompt: string
  messages: { role: string; content: string }[]
  apiKey: string
  signal?: AbortSignal
}

export interface WebStreamCallbacks {
  onChunk: (text: string) => void
  onDone:  () => void
  onError: (err: string) => void
}

// ── Point d'entrée principal ──────────────────────────────────────────────────

export async function streamWeb(
  payload: WebStreamPayload,
  callbacks: WebStreamCallbacks,
): Promise<void> {
  try {
    if (payload.provider === 'gemini')         await streamGemini(payload, callbacks)
    else if (payload.provider === 'anthropic') await streamAnthropic(payload, callbacks)
    else if (payload.provider === 'ollama')    await streamOllama(payload, callbacks)
    else                                       await streamOpenAI(payload, callbacks)
    if (!payload.signal?.aborted) callbacks.onDone()
  } catch (err: unknown) {
    if (payload.signal?.aborted) { callbacks.onDone(); return }
    const msg = err instanceof Error ? err.message : String(err)
    callbacks.onError(msg)
    callbacks.onDone()
  }
}

// ── Gemini ────────────────────────────────────────────────────────────────────

async function streamGemini(
  { apiKey, model, systemPrompt, messages, signal }: WebStreamPayload,
  { onChunk }: WebStreamCallbacks,
): Promise<void> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(apiKey)
  const genModel = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
  })

  // Historique = tous les messages sauf le dernier
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const lastMsg = messages[messages.length - 1]

  const chat = genModel.startChat({ history })
  const result = await chat.sendMessageStream(lastMsg?.content ?? '')

  for await (const chunk of result.stream) {
    if (signal?.aborted) break
    const text = chunk.text()
    if (text) onChunk(text)
  }
}

// ── Anthropic ─────────────────────────────────────────────────────────────────

async function streamAnthropic(
  { apiKey, model, systemPrompt, messages, signal }: WebStreamPayload,
  { onChunk }: WebStreamCallbacks,
): Promise<void> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const stream = await client.messages.stream({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  }, { signal })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      onChunk(event.delta.text)
    }
  }
}

// ── OpenAI ────────────────────────────────────────────────────────────────────

async function streamOpenAI(
  { apiKey, model, systemPrompt, messages, signal }: WebStreamPayload,
  { onChunk }: WebStreamCallbacks,
): Promise<void> {
  const OpenAI = (await import('openai')).default
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

  const stream = await client.chat.completions.create({
    model,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ],
  }, { signal })

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? ''
    if (text) onChunk(text)
  }
}

// ── Ollama (API native /api/chat) ─────────────────────────────────────────────
// apiKey = URL de base du serveur (ex: https://monserveur.run.app)

async function streamOllama(
  { apiKey: serverUrl, model, systemPrompt, messages, signal }: WebStreamPayload,
  { onChunk }: WebStreamCallbacks,
): Promise<void> {
  const base = serverUrl.replace(/\/+$/, '')
  const res = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    }),
  })

  if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`)

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buf = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.trim()) continue
      try {
        const obj = JSON.parse(line)
        const text = obj?.message?.content ?? ''
        if (text) onChunk(text)
      } catch { /* ignore malformed lines */ }
    }
  }
}
