import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import * as fsp from 'fs/promises'
import { spawn, ChildProcess } from 'child_process'

// Load env variables in development
if (process.env.ELECTRON_DEV) {
  try {
    require('dotenv').config()
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
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
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
  const srcDir = path.join(projectPath, 'src')
  const outDir = path.join(projectPath, 'out')

  // Ensure out dir exists
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  // Collect all .java files
  const javaFiles = collectJavaFiles(srcDir)
  if (javaFiles.length === 0) return { success: false, errors: [{ message: 'No .java files found in src/' }] }

  return new Promise((resolve) => {
    const proc = spawn('javac', ['-d', outDir, '-cp', srcDir, ...javaFiles], { cwd: projectPath })
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
// AI IPC — Anthropic streaming
// ─────────────────────────────────────────────────────────
ipcMain.handle('ai:stream', async (event, payload: {
  systemPrompt: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  model?: string
}) => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    event.sender.send('ai:stream-error', 'ANTHROPIC_API_KEY not configured. Please set it in Settings.')
    event.sender.send('ai:stream-done')
    return
  }

  try {
    const Anthropic = require('@anthropic-ai/sdk')
    const client = new Anthropic.default({ apiKey })

    const stream = await client.messages.stream({
      model: payload.model || 'claude-sonnet-4-6',
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
    event.sender.send('ai:stream-error', err.message || 'AI request failed')
  }

  event.sender.send('ai:stream-done')
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
