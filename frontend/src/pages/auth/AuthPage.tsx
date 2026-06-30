import { AuthPanel } from '../../features/auth/components/AuthPanel'
import { BrandPanel } from '../../features/auth/components/BrandPanel'
import { authModes } from '../../features/auth/auth.config'
import { useAuthMode } from '../../features/auth/hooks/useAuthMode'

export function AuthPage() {
  const { mode, setAuthMode } = useAuthMode()
  const currentMode = authModes[mode]

  return (
    <main className="min-h-svh overflow-x-hidden bg-[#1b3a6b] text-black lg:grid lg:grid-cols-[minmax(420px,1fr)_minmax(500px,1fr)] lg:overflow-hidden lg:bg-[#f2f2f2]">
      <BrandPanel />
      <AuthPanel config={currentMode} mode={mode} onModeChange={setAuthMode} />
    </main>
  )
}
