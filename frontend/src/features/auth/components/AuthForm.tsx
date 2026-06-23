import type { AuthMode, AuthModeConfig } from '../types'
import { AuthField } from './AuthField'
import { AuthOptions } from './AuthOptions'

type AuthFormProps = {
  config: AuthModeConfig
  mode: AuthMode
}

export function AuthForm({ config, mode }: AuthFormProps) {
  const isRegister = mode === 'register'

  return (
    <form
      className={`mt-0 w-[298px] max-w-full lg:w-auto ${
        isRegister ? 'lg:mt-[23px]' : 'lg:mt-10'
      }`}
      onSubmit={(event) => event.preventDefault()}
    >
      <div className={`grid ${isRegister ? 'gap-[25px] lg:gap-[17px]' : 'gap-[30px]'}`}>
        {config.fields.map((field) => (
          <AuthField field={field} key={field.id} />
        ))}
      </div>

      <AuthOptions mode={mode} />

      <button
        className={`block h-10 w-full cursor-pointer rounded-[10px] border-0 bg-[#1b3a6b] text-white transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3875d7] ${
          isRegister
            ? 'mt-[34px] text-[18px] font-extrabold leading-none tracking-[3.6px] lg:mt-[27px] lg:tracking-[1.8px]'
            : 'mt-[36px] text-[22px] font-semibold leading-none tracking-[4.4px] lg:mt-[27px] lg:text-[18px] lg:font-extrabold lg:tracking-[1.8px]'
        }`}
        type="submit"
      >
        {config.action}
      </button>
    </form>
  )
}
