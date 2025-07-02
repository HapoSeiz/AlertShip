import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuthModals() {
  const router = useRouter();
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLogInOpen, setIsLogInOpen] = useState(false);
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("alertship_user");
      return savedUser ? JSON.parse(savedUser) : null;
    }
    return null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(!!user);

  const openSignUp = () => { setIsSignUpOpen(true); setIsLogInOpen(false); };
  const openLogIn = () => { setIsLogInOpen(true); setIsSignUpOpen(false); };
  const closeSignUp = () => setIsSignUpOpen(false);
  const closeLogIn = () => setIsLogInOpen(false);
  const switchToLogIn = () => { setIsSignUpOpen(false); setIsLogInOpen(true); };
  const switchToSignUp = () => { setIsLogInOpen(false); setIsSignUpOpen(true); };
  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("alertship_user", JSON.stringify(userData));
    closeLogIn();
    closeSignUp();

    // Check for post-login action
    const postLoginAction = sessionStorage.getItem("postLoginAction");
    if (postLoginAction === "report") {
      sessionStorage.removeItem("postLoginAction");
      router.push("/report")
    }
  };
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("alertship_user");
  };

  return {
    isSignUpOpen, isLogInOpen, isLoggedIn, user,
    openSignUp, openLogIn, closeSignUp, closeLogIn,
    switchToLogIn, switchToSignUp, handleLogin, handleLogout,
    setUser, setIsLoggedIn
  };
}