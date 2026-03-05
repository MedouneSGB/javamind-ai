import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface StreamingTextProps {
  content: string
  isStreaming?: boolean
  className?: string
}

export function StreamingText({ content, isStreaming, className }: StreamingTextProps) {
  const displayContent = isStreaming
    ? content
    : content

  return (
    <div className={`streaming-content ${className || ''}`}>
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <SyntaxHighlighter
                style={vscDarkPlus as any}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  margin: '8px 0',
                  fontSize: '12.5px',
                  lineHeight: '1.5',
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '3px',
                  padding: '1px 5px',
                  fontFamily: "'Cascadia Code', monospace",
                  fontSize: '12px',
                  color: 'var(--color-accent-2)',
                }}
                {...props}
              >
                {children}
              </code>
            )
          },
        }}
      >
        {displayContent}
      </ReactMarkdown>
      {isStreaming && (
        <span style={{
          display: 'inline-block',
          width: '8px',
          height: '14px',
          background: 'var(--color-accent)',
          borderRadius: '1px',
          animation: 'blink 1s infinite',
          marginLeft: '2px',
          verticalAlign: 'middle',
        }} />
      )}
    </div>
  )
}
