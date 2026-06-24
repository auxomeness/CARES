import { type AnchorHTMLAttributes, type MouseEvent, type ReactNode, useState } from 'react'

type LoadingLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode
  delayMs?: number
  loadingLabel?: string
}

function isPlainHashNavigation(event: MouseEvent<HTMLAnchorElement>, href?: string) {
  return (
    href?.startsWith('#') &&
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  )
}

export function LoadingLink({
  children,
  className = '',
  delayMs = 450,
  href,
  loadingLabel = 'Loading',
  onClick,
  ...props
}: LoadingLinkProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)

    if (event.defaultPrevented || !isPlainHashNavigation(event, href)) {
      return
    }

    event.preventDefault()
    setIsLoading(true)

    window.setTimeout(() => {
      window.location.hash = href ?? ''
      setIsLoading(false)
    }, delayMs)
  }

  return (
    <a
      aria-busy={isLoading}
      className={`${className} ${isLoading ? 'pointer-events-none opacity-85' : ''}`}
      href={href}
      onClick={handleClick}
      {...props}
    >
      <span
        className={`inline-flex items-center justify-center gap-2 leading-none [&_svg]:shrink-0 ${
          isLoading ? 'opacity-0' : ''
        }`}
      >
        {children}
      </span>
      {isLoading ? (
        <span
          className="absolute inset-0 grid place-items-center"
          role="status"
          aria-label={loadingLabel}
        >
          <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </span>
      ) : null}
    </a>
  )
}
