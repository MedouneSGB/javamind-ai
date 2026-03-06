import { app, BrowserWindow, ipcMain, dialog, shell, globalShortcut } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as fsp from 'fs/promises'
import { spawn, ChildProcess } from 'child_process'

// Load env variables in development
if (process.env.ELECTRON_DEV) {
  try {
    require('dotenv').config({ override: true })
  } catch {}
}

let mainWindow: BrowserWindow | null = null
const runningProcesses = new Map<number, ChildProcess>()

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0d0d0d',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (process.env.ELECTRON_DEV) {
    const devPort = process.env.VITE_DEV_PORT || '5173'
    mainWindow.loadURL(`http://localhost:${devPort}`)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()
  if (process.env.ELECTRON_DEV) {
    globalShortcut.register('CommandOrControl+R', () => {
      mainWindow?.webContents.reload()
    })
    globalShortcut.register('F5', () => {
      mainWindow?.webContents.reload()
    })
  }
})

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) createWindow()
})

// ─────────────────────────────────────────────────────────
// Window controls
// ─────────────────────────────────────────────────────────
ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.restore()
  else mainWindow?.maximize()
})
ipcMain.on('window:close', () => mainWindow?.close())

// ─────────────────────────────────────────────────────────
// File system IPC
// ─────────────────────────────────────────────────────────
ipcMain.handle('fs:openProject', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
    title: 'Open Java Project',
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('fs:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [{ name: 'Java Files', extensions: ['java'] }, { name: 'All Files', extensions: ['*'] }],
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('fs:readFile', async (_, filePath: string) => {
  return fsp.readFile(filePath, 'utf-8')
})

ipcMain.handle('fs:writeFile', async (_, filePath: string, content: string) => {
  await fsp.writeFile(filePath, content, 'utf-8')
  return true
})

ipcMain.handle('fs:readDir', async (_, dirPath: string) => {
  return readDirRecursive(dirPath)
})

ipcMain.handle('fs:createFile', async (_, filePath: string) => {
  await fsp.writeFile(filePath, '', 'utf-8')
  return true
})

ipcMain.handle('fs:createDir', async (_, dirPath: string) => {
  await fsp.mkdir(dirPath, { recursive: true })
  return true
})

ipcMain.handle('fs:deleteFile', async (_, filePath: string) => {
  const stat = await fsp.stat(filePath)
  if (stat.isDirectory()) {
    await fsp.rmdir(filePath, { recursive: true })
  } else {
    await fsp.unlink(filePath)
  }
  return true
})

ipcMain.handle('fs:rename', async (_, oldPath: string, newPath: string) => {
  await fsp.rename(oldPath, newPath)
  return true
})

ipcMain.handle('fs:exists', async (_, filePath: string) => {
  return fs.existsSync(filePath)
})

function readDirRecursive(dirPath: string): FileTreeNode {
  const stat = fs.statSync(dirPath)
  const name = path.basename(dirPath)
  if (stat.isDirectory()) {
    let children: FileTreeNode[] = []
    try {
      const entries = fs.readdirSync(dirPath)
      children = entries
        .filter(e => !e.startsWith('.') && e !== 'node_modules' && e !== '__pycache__')
        .map(e => readDirRecursive(path.join(dirPath, e)))
        .sort((a, b) => {
          if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
          return a.name.localeCompare(b.name)
        })
    } catch {}
    return { name, path: dirPath, isDirectory: true, children }
  }
  return { name, path: dirPath, isDirectory: false, children: [] }
}

interface FileTreeNode {
  name: string
  path: string
  isDirectory: boolean
  children: FileTreeNode[]
}

// ─────────────────────────────────────────────────────────
// Java runner IPC
// ─────────────────────────────────────────────────────────
ipcMain.handle('java:compile', async (event, { projectPath }: { projectPath: string }) => {
  const outDir = path.join(projectPath, 'out')

  // Ensure out dir exists
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  // Collect ALL .java files recursively, excluding out/ dir (by absolute path)
  const outDirNorm = path.normalize(outDir) + path.sep
  const allJavaFiles = collectJavaFiles(projectPath).filter(f => {
    const norm = path.normalize(f)
    // Exclude anything inside the out/ directory or hidden dirs
    if (norm.startsWith(outDirNorm)) return false
    const rel = path.relative(projectPath, norm)
    if (rel.startsWith('.')) return false
    return true
  })

  if (allJavaFiles.length === 0) {
    return { success: false, errors: [{ message: 'No .java files found in project. Create a .java file first.' }] }
  }

  // Use src/ as classpath root if it exists, otherwise project root
  const srcDir = fs.existsSync(path.join(projectPath, 'src'))
    ? path.join(projectPath, 'src')
    : projectPath

  return new Promise((resolve) => {
    const proc = spawn('javac', ['-d', outDir, '-cp', srcDir, ...allJavaFiles], { cwd: projectPath })
    let stderr = ''
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString() })
    proc.on('close', (code: number) => {
      if (code === 0) {
        resolve({ success: true, errors: [] })
      } else {
        const errors = parseJavacErrors(stderr)
        resolve({ success: false, errors })
      }
    })
    proc.on('error', (err: Error) => {
      resolve({ success: false, errors: [{ message: `javac not found: ${err.message}. Ensure Java is installed and in PATH.` }] })
    })
  })
})

ipcMain.handle('java:run', async (event, { projectPath, className }: { projectPath: string; className: string }) => {
  const outDir = path.join(projectPath, 'out')
  const proc = spawn('java', ['-cp', outDir, className], { cwd: projectPath })
  const pid = proc.pid!
  runningProcesses.set(pid, proc)

  proc.stdout.on('data', (d: Buffer) => {
    event.sender.send('java:stdout', d.toString())
  })
  proc.stderr.on('data', (d: Buffer) => {
    event.sender.send('java:stderr', d.toString())
  })
  proc.on('close', (code: number) => {
    runningProcesses.delete(pid)
    event.sender.send('java:exit', code)
  })
  proc.on('error', (err: Error) => {
    event.sender.send('java:stderr', `Error: ${err.message}`)
    event.sender.send('java:exit', 1)
  })

  return pid
})

ipcMain.handle('java:stop', async (_, pid: number) => {
  const proc = runningProcesses.get(pid)
  if (proc) {
    proc.kill()
    runningProcesses.delete(pid)
    return true
  }
  return false
})

function collectJavaFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const files: string[] = []
  const entries = fs.readdirSync(dir)
  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) files.push(...collectJavaFiles(fullPath))
    else if (entry.endsWith('.java')) files.push(fullPath)
  }
  return files
}

interface JavaError {
  filePath?: string
  line?: number
  column?: number
  message: string
  severity: 'error' | 'warning'
}

function parseJavacErrors(stderr: string): JavaError[] {
  const errors: JavaError[] = []
  const lines = stderr.split('\n')
  const errorRegex = /^(.+\.java):(\d+): (error|warning): (.+)$/

  for (const line of lines) {
    const match = line.match(errorRegex)
    if (match) {
      errors.push({
        filePath: match[1].trim(),
        line: parseInt(match[2]),
        column: 1,
        message: match[4].trim(),
        severity: match[3] as 'error' | 'warning',
      })
    } else if (line.trim() && !line.match(/^\s/) && !line.includes('^') && errors.length === 0) {
      errors.push({ message: line.trim(), severity: 'error' })
    }
  }
  return errors
}

// ─────────────────────────────────────────────────────────
// AI IPC — Multi-provider streaming (Anthropic + Gemini)
// ─────────────────────────────────────────────────────────
ipcMain.handle('ai:stream', async (event, payload: {
  systemPrompt: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  model?: string
  provider?: 'anthropic' | 'gemini' | 'openai'
}) => {
  const provider = payload.provider || 'anthropic'

  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      event.sender.send('ai:stream-error', 'GEMINI_API_KEY not configured in .env')
      event.sender.send('ai:stream-done')
      return
    }
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const geminiModel = genAI.getGenerativeModel({
        model: (payload.model && !payload.model.startsWith('claude')) ? payload.model : 'gemini-2.0-flash',
        systemInstruction: payload.systemPrompt,
      })
      const history = payload.messages.slice(0, -1).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))
      const lastMessage = payload.messages[payload.messages.length - 1]
      const chat = geminiModel.startChat({ history })
      const result = await chat.sendMessageStream(lastMessage.content)
      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) event.sender.send('ai:stream-chunk', text)
      }
    } catch (err: any) {
      event.sender.send('ai:stream-error', err.message || 'Gemini request failed')
    }
  } else if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      event.sender.send('ai:stream-error', 'OPENAI_API_KEY not configured in .env')
      event.sender.send('ai:stream-done')
      return
    }
    try {
      const OpenAI = require('openai')
      const client = new OpenAI.default({ apiKey })
      const model = payload.model || 'gpt-4o'
      const isReasoning = model.startsWith('o1') || model.startsWith('o3')
      // o1/o3 models: no system role, use max_completion_tokens
      const messages = isReasoning
        ? [
            { role: 'developer' as const, content: payload.systemPrompt },
            ...payload.messages,
          ]
        : [
            { role: 'system' as const, content: payload.systemPrompt },
            ...payload.messages,
          ]
      const requestParams: any = {
        model,
        messages,
        stream: true,
      }
      if (isReasoning) {
        requestParams.max_completion_tokens = 4096
      } else {
        requestParams.max_tokens = 4096
      }
      const stream = await client.chat.completions.create(requestParams)
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content
        if (text) event.sender.send('ai:stream-chunk', text)
      }
    } catch (err: any) {
      event.sender.send('ai:stream-error', err.message || 'OpenAI request failed')
    }
  } else {
    // Anthropic
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      event.sender.send('ai:stream-error', 'ANTHROPIC_API_KEY not configured in .env')
      event.sender.send('ai:stream-done')
      return
    }
    try {
      const Anthropic = require('@anthropic-ai/sdk')
      const client = new Anthropic.default({ apiKey })
      const stream = await client.messages.stream({
        model: payload.model || 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: payload.systemPrompt,
        messages: payload.messages,
      })
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          event.sender.send('ai:stream-chunk', chunk.delta.text)
        }
      }
    } catch (err: any) {
      event.sender.send('ai:stream-error', err.message || 'Anthropic request failed')
    }
  }

  event.sender.send('ai:stream-done')
})

// Return available providers + their models
ipcMain.handle('ai:getProviders', async () => {
  return {
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
  }
})

ipcMain.handle('ai:getModels', async (_, provider: 'anthropic' | 'gemini' | 'openai') => {
  try {
    if (provider === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) return []
      // Use Gemini REST API directly to list models (SDK v0.x doesn't expose listModels)
      const https = require('https')
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      const data: any = await new Promise((resolve, reject) => {
        https.get(url, (res: any) => {
          let body = ''
          res.on('data', (chunk: any) => { body += chunk })
          res.on('end', () => {
            try { resolve(JSON.parse(body)) } catch (e) { reject(e) }
          })
        }).on('error', reject)
      })
      if (!data.models) {
        console.error('[ai:getModels] Gemini API error:', JSON.stringify(data))
        return []
      }
      return (data.models as any[])
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => ({
          id: m.name.replace('models/', ''),
          label: m.displayName || m.name.replace('models/', ''),
        }))
        .filter((m: any) => m.id.startsWith('gemini'))
        .sort((a: any, b: any) => {
          // Sort: 2.5 first, then 2.0, then others
          const rank = (id: string) => {
            if (id.includes('2.5')) return 0
            if (id.includes('2.0')) return 1
            return 2
          }
          return rank(a.id) - rank(b.id) || a.label.localeCompare(b.label)
        })
    } else if (provider === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) return []
      // Fetch models dynamically from OpenAI REST API
      const https = require('https')
      const data: any = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.openai.com',
          path: '/v1/models',
          headers: { Authorization: `Bearer ${apiKey}` },
        }
        https.get(options, (res: any) => {
          let body = ''
          res.on('data', (chunk: any) => { body += chunk })
          res.on('end', () => {
            try { resolve(JSON.parse(body)) } catch (e) { reject(e) }
          })
        }).on('error', reject)
      })
      if (!data.data) {
        console.error('[ai:getModels] OpenAI API error:', JSON.stringify(data))
        return []
      }
      // Keep only GPT and o-series models relevant for chat
      const allowed = ['gpt-4o', 'gpt-4.1', 'gpt-4-turbo', 'gpt-3.5', 'o1', 'o3']
      return (data.data as any[])
        .filter((m: any) => allowed.some(prefix => m.id.startsWith(prefix)))
        .map((m: any) => ({ id: m.id, label: m.id }))
        .sort((a: any, b: any) => {
          // Sort: o3 > o1 > gpt-4.1 > gpt-4o > gpt-4-turbo > gpt-3.5
          const rank = (id: string) => {
            if (id.startsWith('o3')) return 0
            if (id.startsWith('o1')) return 1
            if (id.startsWith('gpt-4.1')) return 2
            if (id.startsWith('gpt-4o')) return 3
            if (id.startsWith('gpt-4-turbo')) return 4
            return 5
          }
          return rank(a.id) - rank(b.id) || a.id.localeCompare(b.id)
        })
    } else {
      // Anthropic: fetch models via API (works with valid key, no credits needed)
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) return []
      const https = require('https')
      const data: any = await new Promise((resolve, reject) => {
        const options = {
          hostname: 'api.anthropic.com',
          path: '/v1/models',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
        }
        https.get(options, (res: any) => {
          let body = ''
          res.on('data', (chunk: any) => { body += chunk })
          res.on('end', () => {
            try { resolve(JSON.parse(body)) } catch (e) { reject(e) }
          })
        }).on('error', reject)
      })
      if (!data.data) {
        console.error('[ai:getModels] Anthropic API error:', JSON.stringify(data))
        // Fallback to known real model IDs if API fails
        return [
          { id: 'claude-opus-4-5', label: 'Claude Opus 4.5' },
          { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
          { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
          { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
          { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
          { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
        ]
      }
      return (data.data as any[])
        .map((m: any) => ({ id: m.id, label: m.display_name || m.id }))
        .sort((a: any, b: any) => a.label.localeCompare(b.label))
    }
  } catch (err: any) {
    console.error('[ai:getModels] error:', err.message)
    return []
  }
})

// Test model availability by sending a minimal 1-token request
ipcMain.handle('ai:testModels', async (_, payload: { provider: 'anthropic' | 'gemini' | 'openai'; models: string[] }) => {
  const { provider, models } = payload
  const results: Record<string, boolean> = {}

  const testOne = async (modelId: string): Promise<boolean> => {
    try {
      if (provider === 'gemini') {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) return false
        const https = require('https')
        const body = JSON.stringify({ contents: [{ parts: [{ text: 'Hi' }] }], generationConfig: { maxOutputTokens: 1 } })
        const ok: boolean = await new Promise((resolve) => {
          const req = https.request({
            hostname: 'generativelanguage.googleapis.com',
            path: `/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
          }, (res: any) => {
            res.resume()
            resolve(res.statusCode >= 200 && res.statusCode < 300)
          })
          req.on('error', () => resolve(false))
          req.write(body)
          req.end()
        })
        return ok
      } else if (provider === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) return false
        const https = require('https')
        const body = JSON.stringify({ model: modelId, messages: [{ role: 'user', content: 'Hi' }], max_tokens: 1 })
        const ok: boolean = await new Promise((resolve) => {
          const req = https.request({
            hostname: 'api.openai.com',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}`, 'Content-Length': Buffer.byteLength(body) },
          }, (res: any) => {
            res.resume()
            resolve(res.statusCode >= 200 && res.statusCode < 300)
          })
          req.on('error', () => resolve(false))
          req.write(body)
          req.end()
        })
        return ok
      } else {
        // Anthropic
        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) return false
        const https = require('https')
        const body = JSON.stringify({ model: modelId, max_tokens: 1, messages: [{ role: 'user', content: 'Hi' }] })
        const ok: boolean = await new Promise((resolve) => {
          const req = https.request({
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'Content-Length': Buffer.byteLength(body),
            },
          }, (res: any) => {
            res.resume()
            resolve(res.statusCode >= 200 && res.statusCode < 300)
          })
          req.on('error', () => resolve(false))
          req.write(body)
          req.end()
        })
        return ok
      }
    } catch {
      return false
    }
  }

  // Test all models in parallel
  await Promise.all(
    models.map(async (id) => {
      results[id] = await testOne(id)
    })
  )

  return results
})

// API key management (using safeStorage for encryption)
ipcMain.handle('settings:getApiKey', async () => {
  try {
    const { safeStorage } = require('electron')
    const keyPath = path.join(app.getPath('userData'), 'api-key.enc')
    if (!fs.existsSync(keyPath)) return null
    const encrypted = fs.readFileSync(keyPath)
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(encrypted)
    }
    return encrypted.toString('utf-8')
  } catch {
    return null
  }
})

ipcMain.handle('settings:setApiKey', async (_, key: string) => {
  try {
    const { safeStorage } = require('electron')
    const keyPath = path.join(app.getPath('userData'), 'api-key.enc')
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(key)
      fs.writeFileSync(keyPath, encrypted)
    } else {
      fs.writeFileSync(keyPath, key, 'utf-8')
    }
    process.env.ANTHROPIC_API_KEY = key
    return true
  } catch {
    return false
  }
})

ipcMain.handle('settings:loadApiKey', async () => {
  try {
    const { safeStorage } = require('electron')
    const keyPath = path.join(app.getPath('userData'), 'api-key.enc')
    if (fs.existsSync(keyPath)) {
      const encrypted = fs.readFileSync(keyPath)
      const key = safeStorage.isEncryptionAvailable()
        ? safeStorage.decryptString(encrypted)
        : encrypted.toString('utf-8')
      process.env.ANTHROPIC_API_KEY = key
    }
  } catch {}
})

// Load API key on startup
app.whenReady().then(async () => {
  try {
    const { safeStorage } = require('electron')
    const keyPath = path.join(app.getPath('userData'), 'api-key.enc')
    if (fs.existsSync(keyPath)) {
      const encrypted = fs.readFileSync(keyPath)
      const key = safeStorage.isEncryptionAvailable()
        ? safeStorage.decryptString(encrypted)
        : encrypted.toString('utf-8')
      process.env.ANTHROPIC_API_KEY = key
    }
  } catch {}
})

// Open external links
ipcMain.on('shell:openExternal', (_, url: string) => {
  shell.openExternal(url)
})
