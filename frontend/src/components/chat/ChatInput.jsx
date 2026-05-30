import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles } from 'lucide-react'

const suggestions = [
  'Dashboard overview',
  'Show active printers',
  'Pending repairs',
  'Low stock items',
  'Technician workload',
]

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!disabled) inputRef.current?.focus()
  }, [disabled])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    setShowSuggestions(false)
  }

  return (
    <div className="border-t border-border/60 bg-card p-3">
      {showSuggestions && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => {
                onSend(s)
                setShowSuggestions(false)
              }}
              disabled={disabled}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              {s}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask about printers, repairs, inventory..."
          disabled={disabled}
          className="flex-1 h-10 px-4 rounded-xl border-2 border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
