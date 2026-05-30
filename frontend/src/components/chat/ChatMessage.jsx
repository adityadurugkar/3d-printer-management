import { Bot, User } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function ChatMessage({ message }) {
  const isBot = message.role === 'assistant'

  return (
    <div className={cn(
      'flex gap-3 w-full',
      isBot ? 'justify-start' : 'justify-end'
    )}>
      {isBot && (
        <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className={cn(
        'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isBot
          ? 'bg-muted/80 text-foreground rounded-tl-sm'
          : 'bg-primary text-white rounded-tr-sm'
      )}>
        <div className="whitespace-pre-wrap">{message.text}</div>
        {message.time && (
          <p className={cn(
            'text-[10px] mt-1.5',
            isBot ? 'text-muted-foreground' : 'text-primary-foreground/60'
          )}>
            {message.time}
          </p>
        )}
      </div>
      {!isBot && (
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  )
}
