import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function useAuthModals() {
  const router = useRouter();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLogInOpen, setIsLogInOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("alertship_user");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoggedIn(true);
      }
    }
  }, []);

  const openSignUp = () => { setIsSignUpOpen(true); setIsLogInOpen(false); };
  const openLogIn = () => { setIsLogInOpen(true); setIsSignUpOpen(false); };
  const closeSignUp = () => setIsSignUpOpen(false);
  const closeLogIn = () => setIsLogInOpen(false);
  const switchToLogIn = () => { setIsSignUpOpen(false); setIsLogInOpen(true); };
  const switchToSignUp = () => { setIsLogInOpen(false); setIsSignUpOpen(true); };
  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("alertship_user", JSON.stringify(userData));
    }
    closeLogIn();
    closeSignUp();

    // Check for post-login action
    if (typeof window !== "undefined") {
      const postLoginAction = sessionStorage.getItem("postLoginAction");
      if (postLoginAction === "report") {
        sessionStorage.removeItem("postLoginAction");
        router.push("/report")
      }
    }
  };
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("alertship_user");
    }
  };

  return {
    isSignUpOpen, isLogInOpen, isLoggedIn, user, isHydrated,
    openSignUp, openLogIn, closeSignUp, closeLogIn,
    switchToLogIn, switchToSignUp, handleLogin, handleLogout,
    setUser, setIsLoggedIn
  };
}