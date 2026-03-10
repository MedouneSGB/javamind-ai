$root = "C:\Users\MSGB\Documents\GitHub\claude\src"

function ReplaceInFile($path, $old, $new) {
    $content = Get-Content $path -Raw -Encoding UTF8
    $updated = $content.Replace($old, $new)
    if ($content -ne $updated) {
        Set-Content $path $updated -Encoding UTF8 -NoNewline
        Write-Host "Updated: $path"
    }
}

$p = "$root\components\layout\Toolbar.tsx"
ReplaceInFile $p @"
import { useEditorStore } from '../../store/editorStore'
"@ @"
import { useEditorStore } from '../../store/editorStore'
import { FolderOpen, FileText, Play, Square, Loader2, Sparkles, Search, Target, MessageCircle, PanelRightClose, PanelRightOpen } from 'lucide-react'
"@
