import { useState } from 'react'

import { Smile } from 'lucide-react'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: string) => void
  disabled?: boolean
}

const EMOJI_CATEGORIES = [
  {
    label: '😀',
    name: 'Mặt cười',
    emojis: ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '🤗', '🤩', '😏', '😌', '🙂', '😇', '🥰', '😍']
  },
  {
    label: '👍',
    name: 'Cử chỉ',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤝', '👏', '🙌', '💪', '🤟', '👋', '🤙', '✊', '👊', '🙏', '💅', '🖐️', '☝️', '👆', '👇']
  },
  {
    label: '❤️',
    name: 'Tim',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💝', '💘', '💌', '🫶']
  },
  {
    label: '🎉',
    name: 'Hoạt động',
    emojis: ['🎉', '🎊', '🎈', '🎁', '🏆', '⭐', '🌟', '✨', '💫', '🔥', '💯', '🎯', '🎪', '🎨', '🎬', '📸', '🎤', '🎵', '🎶', '🎸']
  },
  {
    label: '🐱',
    name: 'Động vật',
    emojis: ['🐱', '🐶', '🐻', '🐼', '🦊', '🦁', '🐯', '🐸', '🐵', '🐧', '🐦', '🦋', '🐝', '🐞', '🌸', '🌺', '🌻', '🌹', '🍀', '🌿']
  },
  {
    label: '🍕',
    name: 'Đồ ăn',
    emojis: ['🍕', '🍔', '🍟', '🌮', '🍜', '🍣', '🍱', '🎂', '🍩', '☕', '🧋', '🍺', '🥤', '🍓', '🍊', '🍇', '🍉', '🥑', '🍳', '🧁']
  }
]

export default function EmojiPickerButton({ onEmojiSelect, disabled = false }: EmojiPickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          aria-label='Chọn emoji'
          disabled={disabled}
          className='p-2 text-gray-500 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-brand-primary/20'
        >
          <Smile size={20} />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side='top'
        align='start'
        sideOffset={8}
        className='w-[320px] p-0 rounded-xl shadow-lg border border-gray-100 chat-animate-scaleIn'
      >
        {/* Category Tabs */}
        <div className='flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/50 rounded-t-xl'>
          {EMOJI_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(idx)}
              aria-label={cat.name}
              className={`flex-1 py-1.5 text-center text-base rounded-lg transition-all duration-150
                ${activeCategory === idx ? 'bg-white shadow-sm scale-105' : 'hover:bg-gray-100'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Emoji Grid */}
        <div className='p-2 max-h-[200px] overflow-y-auto chat-scrollbar'>
          <p className='text-[10px] text-gray-400 font-medium uppercase tracking-wider px-1 mb-1.5'>
            {EMOJI_CATEGORIES[activeCategory].name}
          </p>
          <div className='grid grid-cols-8 gap-0.5'>
            {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className='w-9 h-9 flex items-center justify-center text-xl rounded-lg
                  hover:bg-gray-100 active:scale-90 transition-all duration-100
                  focus:outline-none focus:ring-2 focus:ring-brand-primary/20'
                aria-label={`Emoji ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
