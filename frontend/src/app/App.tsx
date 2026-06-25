import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'
import { AccountActions } from '@/components/account/AccountActions'

function App() {
  return (
    <AppProviders>
      <AppRouter />
      <AccountActions />
    </AppProviders>
  )
}

export default App
