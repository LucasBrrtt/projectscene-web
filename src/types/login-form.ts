export type LoginForm = {
  email: string
  password: string
  rememberMe: boolean
}

export function createLoginForm(): LoginForm {
  return {
    email: '',
    password: '',
    rememberMe: true,
  }
}
