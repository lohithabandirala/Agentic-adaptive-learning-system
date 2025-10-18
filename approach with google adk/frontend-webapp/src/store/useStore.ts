import create from 'zustand';

type State = {
  token?: string;
  role?: string;
  setAuth: (token?: string, role?: string) => void;
};

export const useStore = create<State>((set) => ({
  token: undefined,
  role: undefined,
  setAuth: (token, role) => set({ token, role }),
}));

export default useStore;
