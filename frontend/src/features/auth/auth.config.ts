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
    switchLink: {
      label: 'Already have an account?',
      action: 'Sign in here!',
      target: 'login',
    },
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

export const progressSteps = ['submitted', 'for approval', 'in progress', 'approved']

export const authRoleCredentials: AuthRoleCredential[] = [
  {
    username: 'student',
    label: 'Student',
    route: '#student',
    description: 'Student dashboard, feed, concerns, appointments, and directories.',
  },
  {
    username: 'office',
    label: 'Office',
    route: '#office',
    description: 'Assigned concerns, appointments, transfers, and reports.',
  },
  {
    username: 'department',
    label: 'Department',
    route: '#department',
    description: 'Academic concerns and department appointment approvals.',
  },
  {
    username: 'faculty',
    label: 'Faculty',
    route: '#faculty',
    description: 'Faculty schedules, appointment requests, and completion logs.',
  },
  {
    username: 'admin',
    label: 'Admin',
    route: '#admin',
    description: 'System analytics and CRUD management for offices, departments, and faculty.',
  },
]

export const authBrandMessages = [
  'Submit a concern, complaint, or suggestion and track its progress.',
  'Concern submitted by a student.',
  'Office acknowledged the request.',
  'Status updated for transparency.',
  'Resolution report prepared.',
]
