"use client";
import { createContext, useContext, useState } from "react";

const MobileMenuContext = createContext({
  isMenuOpen: false,
  setMenuOpen: () => {},
  isMenuClosing: false,
  setMenuClosing: () => {},
});

export function MobileMenuProvider({ children }) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isMenuClosing, setMenuClosing] = useState(false);
  return (
    <MobileMenuContext.Provider value={{ isMenuOpen, setMenuOpen, isMenuClosing, setMenuClosing }}>
      {children}
    </MobileMenuContext.Provider>
  );
}

export function useMobileMenu() {
  return useContext(MobileMenuContext);
}
