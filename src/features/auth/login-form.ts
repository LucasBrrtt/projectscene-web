export type LoginForm = {
  username: string
  password: string
  rememberMe: boolean
}

export function createLoginForm(): LoginForm {
  // Concentrar os valores iniciais em uma factory facilita reuso
  // e evita duplicacao se o formulario crescer depois.
  return {
    username: '',
    password: '',
    rememberMe: true,
  }
}
