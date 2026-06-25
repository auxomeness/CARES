import type { AuthMode, AuthModeConfig, AuthRoleCredential } from './types'

export const authModeList: AuthMode[] = ['login', 'register']

export const authModes: Record<AuthMode, AuthModeConfig> = {
  login: {
    tab: 'Sign In',
    action: 'Sign In',
    desktopTitle: 'Welcome back!',
    desktopLead: 'Sign in with your username or email to track or submit concerns.',
    mobileTitle: 'Welcome!',
    mobileLead: 'Sign in and get the latest updates for a better campus.',
    switchLink: {
      label: 'No Account?',
      action: 'Register here!',
      target: 'register',
    },
    fields: [
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
    switchLink: {
      label: 'Already have an account?',
      action: 'Sign in here!',
      target: 'login',
    },
    fields: [
      {
        id: 'firstName',
        label: 'First Name',
        type: 'text',
        autoComplete: 'given-name',
      },
      {
        id: 'lastName',
        label: 'Last Name',
        type: 'text',
        autoComplete: 'family-name',
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
      {
        id: 'studentId',
        label: 'Student ID',
        type: 'text',
        autoComplete: 'off',
      },
      {
        id: 'course',
        label: 'Course',
        type: 'text',
        autoComplete: 'organization-title',
      },
      {
        id: 'yearLevel',
        label: 'Year Level',
        type: 'text',
        autoComplete: 'off',
      },
    ],
  },
}

export const progressSteps = ['submitted', 'for approval', 'in progress', 'approved']

export const authRoleCredentials: AuthRoleCredential[] = []

export const authBrandMessages = [
  'Submit a concern, complaint, or suggestion and track its progress.',
  'Concern submitted by a student.',
  'Office acknowledged the request.',
  'Status updated for transparency.',
  'Resolution report prepared.',
]
