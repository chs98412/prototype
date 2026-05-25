export async function getClientToken(): Promise<string> {
  // Get token from cookie
  const cookies = document.cookie.split('; ')
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=')
    if (name === 'auth_token') {
      return decodeURIComponent(value)
    }
  }
  return ''
}
