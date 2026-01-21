import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export function useHeader() {
  const router = useRouter()
  const authStore = useAuthStore()

  const handleLogout = () => {
    authStore.logout()
    router.push('/branch/login')
  }

  return {
    handleLogout,
  }
}
