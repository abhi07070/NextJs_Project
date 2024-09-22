import { configureStore } from '@reduxjs/toolkit';
import userReducer  from './slices/userSlice';

function loadState() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const serializedState = localStorage.getItem('state');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (err) {
    console.error('Could not load state:', err);
    return undefined;
  }
};

function saveState(state: any) {
  try {
    const serializedState = JSON.stringify(state);
    if (typeof window !== 'undefined') {
      localStorage.setItem('state', serializedState);
    }
  } catch (error) {
    console.error("Could not save state:", error);
  }
}

const preloadedState = loadState();

type RootReducer = {
  user: ReturnType<typeof userReducer>;
}

export const store = configureStore<RootReducer>({
  reducer: {
    user: userReducer,
  },
  preloadedState, 
});

store.subscribe(() => {
  if (typeof window !== 'undefined') {
    saveState(store.getState());
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
