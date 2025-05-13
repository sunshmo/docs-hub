import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from 'docs-hub-shared-models';

interface UserState {
  user: User | null;
  updateUser: (user: User) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      updateUser: (userData) => set((state) => {
        return {
          user: userData ?? null
        }
      }),
    }),
    {
      name: 'user-storage',
    }
  )
)
