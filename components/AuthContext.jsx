import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '@/firebase/firebase';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogIn, setShowLogIn] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [pendingVerificationUser, setPendingVerificationUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [resentSuccess, setResentSuccess] = useState(false);
  const [resentError, setResentError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoggedIn(!!firebaseUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sign up with email/password
  const signUp = async ({ name, email, password }) => {
    setErrors({});
    setIsLoading(true);
    try {
      const auth = getAuth(app);
      const db = getFirestore(app);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name,
        createdAt: new Date().toISOString(),
        verified: false,
      });
      await sendEmailVerification(user);
      setPendingVerificationUser(user);
      setShowVerifyEmail(true);
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Log in with email/password
  const logIn = async ({ email, password }) => {
    setErrors({});
    setIsLoading(true);
    try {
      const auth = getAuth(app);
      const db = getFirestore(app);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!user.emailVerified) {
        setPendingVerificationUser(user);
        setShowVerifyEmail(true);
        await auth.signOut();
        return;
      }
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || '',
          createdAt: new Date().toISOString(),
          verified: true,
        });
      } else if (!userSnap.data().verified) {
        await updateDoc(userRef, { verified: true });
      }
      setUser(user);
      setIsLoggedIn(true);
      setShowLogIn(false);
      router.push('/dashboard');
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Auth
  const googleAuth = async () => {
    setErrors({});
    setIsLoading(true);
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const res = await fetch('/api/auth-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(result.user);
        setIsLoggedIn(true);
        setShowLogIn(false);
        setShowSignUp(false);
        router.push('/dashboard');
      } else {
        setErrors({ general: data.error || 'Google authentication failed' });
      }
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    setResentSuccess(false);
    setResentError('');
    setIsLoading(true);
    try {
      const auth = getAuth(app);
      const user = pendingVerificationUser || auth.currentUser;
      if (!user) throw new Error('No user to resend verification for.');
      await sendEmailVerification(user);
      setResentSuccess(true);
    } catch (err) {
      setResentError('Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logOut = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    setUser(null);
    setIsLoggedIn(false);
    setShowLogIn(false);
    setShowSignUp(false);
    setShowVerifyEmail(false);
    router.push('/');
  };

  // Modal controls
  const openSignUp = () => { setShowSignUp(true); setShowLogIn(false); };
  const openLogIn = () => { setShowLogIn(true); setShowSignUp(false); };
  const closeSignUp = () => setShowSignUp(false);
  const closeLogIn = () => setShowLogIn(false);
  const closeVerifyEmail = () => setShowVerifyEmail(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
        errors,
        showSignUp,
        showLogIn,
        showVerifyEmail,
        pendingVerificationUser,
        resentSuccess,
        resentError,
        signUp,
        logIn,
        googleAuth,
        resendVerificationEmail,
        logOut,
        openSignUp,
        openLogIn,
        closeSignUp,
        closeLogIn,
        closeVerifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
} 