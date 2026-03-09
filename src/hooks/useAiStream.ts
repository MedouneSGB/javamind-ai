import { useCallback, useEffect, useRef } from 'react'
import { ipc } from '../lib/ipc'
import { useAiStore } from '../store/aiStore'
import { useEditorStore } from '../store/editorStore'
import { useLearningStore } from '../store/learningStore'
import { isElectron } from '../lib/platform'
import type { AiStreamPayload } from '../types/ai.types'

export function useAiStream() {
  const { startStream, appendStreamChunk, endStream, aiModel, aiProvider } = useAiStore()
  const { getActiveTab } = useEditorStore()
  const { userLevel, currentTopic, masteredConcepts } = useLearningStore()
  const unsubChunk = useRef<(() => void) | null>(null)
  const unsubDone = useRef<(() => void) | null>(null)
  const unsubError = useRef<(() => void) | null>(null)

  const cleanup = useCallback(() => {
    unsubChunk.current?.()
    unsubDone.current?.()
    unsubError.current?.()
  }, [])

  useEffect(() => () => cleanup(), [cleanup])

  const getContext = useCallback(() => {
    const tab = getActiveTab()
    return {
      fileName: tab?.name || 'untitled',
      code: tab?.content || '',
      level: userLevel,
      topic: currentTopic,
      masteredConcepts,
    }
  }, [getActiveTab, userLevel, currentTopic, masteredConcepts])

  const stream = useCallback(async (
    payload: AiStreamPayload,
    onChunk?: (chunk: string) => void,
    onDone?: (fullContent: string) => void,
  ): Promise<string> => {
    cleanup()
    startStream()

    const provider = (payload.provider || aiProvider) as 'gemini' | 'anthropic' | 'openai'
    const model = payload.model || aiModel

    // ── Web mode : appel direct aux SDKs IA depuis le browser ────────────────
    if (!isElectron) {
      const { streamWeb } = await import('../lib/ai-web')
      const { getWebKey } = await import('../lib/web-keys')
      const apiKey = getWebKey(provider)

      if (!apiKey) {
        // Aucune clé configurée — retourner un signal spécial
        endStream()
        return `NO_API_KEY:${provider}`
      }

      return new Promise((resolve) => {
        let buffer = ''
        streamWeb(
          { provider, model, systemPrompt: payload.systemPrompt, messages: payload.messages, apiKey },
          {
            onChunk: (text) => {
              buffer += text
              appendStreamChunk(text)
              onChunk?.(text)
            },
            onDone: () => {
              endStream()
              onDone?.(buffer)
              resolve(buffer)
            },
            onError: (err) => {
              appendStreamChunk(`\n⚠️ ${err}`)
              buffer += `\n⚠️ ${err}`
              endStream()
              resolve(buffer)
            },
          },
        )
      })
    }

    // ── Electron mode : streaming via IPC ────────────────────────────────────
    let buffer = ''

    return new Promise((resolve) => {
      unsubChunk.current = ipc.ai.onChunk((chunk) => {
        buffer += chunk
        appendStreamChunk(chunk)
        onChunk?.(chunk)
        console.log('[AI] chunk received, buffer length:', buffer.length)
      })

      unsubDone.current = ipc.ai.onDone(() => {
        console.log('[AI] done, buffer:', buffer.substring(0, 100))
        const content = endStream()
        cleanup()
        onDone?.(content)
        resolve(buffer)
      })

      unsubError.current = ipc.ai.onError((error) => {
        console.error('[AI] error:', error)
        const errContent = `Error: ${error}`
        appendStreamChunk(errContent)
        buffer += errContent
        endStream()
        cleanup()
        resolve(buffer)
      })

      ipc.ai.stream({ ...payload, model, provider })
    })
  }, [cleanup, startStream, appendStreamChunk, endStream, aiModel, aiProvider])

  return { stream, getContext }
}
