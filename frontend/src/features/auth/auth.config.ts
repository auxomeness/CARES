import type { AuthMode, AuthModeConfig } from './types'

export const authModeList: AuthMode[] = ['login', 'register']

export const authModes: Record<AuthMode, AuthModeConfig> = {
  login: {
    tab: 'Sign In',
    action: 'Sign In',
    desktopTitle: 'Welcome back!',
    desktopLead: 'Sign in with your username or email to track or submit concerns.',
    mobileTitle: 'Welcome!',
    mobileLead: 'Sign in and get the latest updates for a better campus.',
    mobileSwitch: {
      label: 'No Account?',
      action: 'Register here!',
      target: 'register',
    },
    fields: [
      {
        id: 'username',
        label: 'Username',
        type: 'text',
        autoComplete: 'username',
      },
      {
        id: 'password',
        label: 'Password',
        type: 'password',
        autoComplete: 'current-password',
      },
    ],
  },
  register: {
    tab: 'Create Account',
    action: 'Create Account',
    desktopTitle: 'Hello there!',
    desktopLead: 'Create an account and get the latest updates for a better campus.',
    mobileTitle: 'Hello there!',
    mobileLead: 'Create an account and get the latest updates for a better campus.',
    fields: [
      {
        id: 'username',
        label: 'Username',
        type: 'text',
        autoComplete: 'username',
      },
      {
        id: 'email',
        label: 'Email',
        type: 'email',
        autoComplete: 'email',
      },
      {
        id: 'password',
        label: 'Password',
        type: 'password',
        autoComplete: 'new-password',
      },
    ],
  },
}

export const progressSteps = ['submitted', 'for approval', 'in progress', 'submitted']
