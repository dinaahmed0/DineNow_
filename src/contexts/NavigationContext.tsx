import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface NavigationContextType {
  isNavigating: boolean;
  setIsNavigating: (loading: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <NavigationContext.Provider value={{ isNavigating, setIsNavigating }}>
      {children}
    </NavigationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- context hook co-located with provider
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
