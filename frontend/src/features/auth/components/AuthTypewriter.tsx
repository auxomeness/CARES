import { useEffect, useState } from 'react'
import { authBrandMessages } from '../auth.config'

type AuthTypewriterProps = {
  className?: string
  cursorClassName?: string
}

export function AuthTypewriter({ className = '', cursorClassName = '' }: AuthTypewriterProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [isMessageLeaving, setIsMessageLeaving] = useState(false)

  useEffect(() => {
    const message = authBrandMessages[messageIndex]
    let characterIndex = 0
    let messageTimer = 0
    let swapTimer = 0

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTypedText('')
    setIsMessageLeaving(false)

    const typingTimer = window.setInterval(() => {
      characterIndex += 1
      setTypedText(message.slice(0, characterIndex))

      if (characterIndex >= message.length) {
        window.clearInterval(typingTimer)
        messageTimer = window.setTimeout(() => {
          setIsMessageLeaving(true)
          swapTimer = window.setTimeout(() => {
            setMessageIndex((currentIndex) => (currentIndex + 1) % authBrandMessages.length)
          }, 260)
        }, 1200)
      }
    }, 42)

    return () => {
      window.clearInterval(typingTimer)
      window.clearTimeout(messageTimer)
      window.clearTimeout(swapTimer)
    }
  }, [messageIndex])

  return (
    <p
      className={`transition duration-300 ease-out [text-wrap:balance] ${
        isMessageLeaving ? '-translate-y-1 opacity-0' : 'translate-y-0 opacity-100'
      } ${className}`}
    >
      <span className="break-words">{typedText}</span>
      <span
        className={`ml-1 inline-block w-px translate-y-0.5 animate-[caretBlink_700ms_steps(1)_infinite] ${cursorClassName}`}
      />
    </p>
  )
}
