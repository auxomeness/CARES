export type AuthMode = 'login' | 'register'

export type AuthField = {
  id: string
  label: string
  type: 'text' | 'email' | 'password'
  autoComplete: string
}

export type AuthModeConfig = {
  tab: string
  action: string
  desktopTitle: string
  desktopLead: string
  mobileTitle: string
  mobileLead: string
  mobileSwitch?: {
    label: string
    action: string
    target: AuthMode
  }
  fields: AuthField[]
}
