import React, { createContext, useContext, useState, useCallback } from 'react';

const BottomBarContext = createContext(undefined);

export const BottomBarProvider = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  const showBottomBar = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideBottomBar = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <BottomBarContext.Provider
      value={{
        isVisible,
        showBottomBar,
        hideBottomBar,
        actionMenuOpen,
        setActionMenuOpen,
      }}
    >
      {children}
    </BottomBarContext.Provider>
  );
};

export const useBottomBar = () => {
  const context = useContext(BottomBarContext);
  if (!context) {
    throw new Error('useBottomBar must be used within a BottomBarProvider');
  }
  return context;
};
