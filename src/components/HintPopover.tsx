import { useEffect, useRef } from 'react'
import { Check, Tag, X } from 'lucide-react'
import { MorphingPopover, MorphingPopoverClose, MorphingPopoverContent, MorphingPopoverTrigger } from './ui/morphing-popover'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onChange: (value: string) => void
}

/** A round glass tag button that morphs into the optional Hint field. */
export function HintPopover({ open, onOpenChange, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const hasHint = value.trim().length > 0

  // Focus the field once the panel has grown.
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 220)
    return () => clearTimeout(t)
  }, [open])

  return (
    <MorphingPopover open={open} onOpenChange={onOpenChange} className="hint-pop">
      <MorphingPopoverTrigger className={`glass-btn glass-icon${hasHint ? ' hint-set' : ''}`} label={hasHint ? `Hint: ${value}` : 'Add a Hint'}>
        <Tag size={19} />
      </MorphingPopoverTrigger>
      {hasHint && !open && <span className="hint-dot" aria-hidden />}

      <MorphingPopoverContent className="hint-panel" label="Add a Hint">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onOpenChange(false)
          }}
        >
          <div className="hint-head">
            <div>
              <strong>Add a Hint</strong>
              <span>A brand or restaurant helps the Scan. Optional.</span>
            </div>
            <MorphingPopoverClose className="menu-close" label="Close Hint">
              <X size={20} />
            </MorphingPopoverClose>
          </div>
          <div className="hint-field">
            <Tag size={17} className="hint-field-icon" />
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="e.g. Ben & Jerry's, Chipotle"
              enterKeyHint="done"
            />
            {hasHint && (
              <button type="button" className="hint-clear" onClick={() => onChange('')} aria-label="Clear Hint">
                <X size={15} />
              </button>
            )}
          </div>
          <button type="submit" className="hint-done">
            <Check size={17} /> Done
          </button>
        </form>
      </MorphingPopoverContent>
    </MorphingPopover>
  )
}
