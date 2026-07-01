import caresLogo from '@/assets/cares-logo.svg'

type BrandLogoProps = {
  className?: string
  imageClassName?: string
}

export function BrandLogo({ className = '', imageClassName = '' }: BrandLogoProps) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-[8px] bg-white ${className}`}
      aria-hidden="true"
    >
      <img
        alt=""
        className={`block h-full w-full object-contain ${imageClassName}`}
        draggable={false}
        src={caresLogo}
      />
    </span>
  )
}
