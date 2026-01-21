import { ref, watch } from 'vue'

// Initialize theme state immediately (runs once when module loads)
const getInitialTheme = (): boolean => {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('theme')
  if (stored) {
    return stored === 'dark'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const isDark = ref(getInitialTheme())

// Apply theme immediately on module load
const applyTheme = () => {
  if (typeof document === 'undefined') return
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Apply initial theme
applyTheme()

// Watch for changes
watch(isDark, applyTheme)

// Listen for system preference changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDark.value = e.matches
    }
  })
}

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  const setTheme = (dark: boolean) => {
    isDark.value = dark
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  return {
    isDark,
    toggleTheme,
    setTheme,
  }
}
