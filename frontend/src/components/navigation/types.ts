import type { LucideIcon } from 'lucide-react'

export type NavigationItem = {
  label: string
  href: string
  icon: LucideIcon
  active?: boolean
}

export type NavigationUtilityItem = NavigationItem & {
  children?: NavigationItem[]
  indicator?: LucideIcon
}

export type NavigationProfile = {
  name: string
  role: string
  href: string
}

export type NavigationBrand = {
  name: string
  subtitle: string
  href: string
}
