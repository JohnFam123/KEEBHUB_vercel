import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Layout = {
  theme: string
  drawerOpen: boolean
}
const initialState: Layout = {
  theme: 'light',
  drawerOpen: false,
}

export const layoutStore = create<Layout>()( (set) => initialState )

export default function useLayoutService() {
  const { theme, drawerOpen } = layoutStore()

  return {
    theme,
    drawerOpen,
    toggleTheme: () => {
      layoutStore.setState({
        theme: theme === 'dark' ? 'light' : 'dark',
      })
    },
    toggleDrawer: () => {
      layoutStore.setState({
        drawerOpen: !drawerOpen,
      })
    },
  }
}
