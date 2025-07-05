"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut as firebaseSignOut,
  sendEmailVerification,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { app } from '@/firebase/firebase';
import { useRouter } from 'next/navigation';

// User interface extending Firebase User
interface User extends FirebaseUser {
  name?: string;
  verified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

// Auth context interface
interface AuthContextType {
  // User state
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  
  // Auth state
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  
  // Auth methods
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  
  // Modal state (from useAuthModals)
  isSignUpOpen: boolean;
  isLogInOpen: boolean;
  showVerifyEmail: boolean;
  
  // Modal methods
  openSignUp: () => void;
  openLogIn: () => void;
  closeSignUp: () => void;
  closeLogIn: () => void;
  switchToLogIn: () => void;
  switchToSignUp: () => void;
  
  // Auth flow methods
  handleSignUp: (data: SignUpData, setIsTransitioning: (value: boolean) => void) => Promise<void>;
  handleLogIn: (data: LogInData) => Promise<void>;
  handleGoogleAuth: (isSignUp: boolean) => Promise<void>;
  handleResendVerificationEmail: () => Promise<void>;
  handleForgotPassword: (email: string) => Promise<void>;
  
  // Error handling
  errors: AuthErrors;
  clearErrors: () => void;
  
  // Loading states
  isLoading: boolean;
  resendTimer: number;
  resentSuccess: boolean;
  resentError: string;
  forgotPasswordSuccess: string;
  forgotPasswordError: string;
}

// User profile interface for Firestore
interface UserProfile {
  uid: string;
  email: string | null;
  name: string;
  createdAt: string;
  verified: boolean;
  lastLoginAt: string;
  photoURL?: string;
}

// Sign up data interface
interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Login data interface
interface LogInData {
  email: string;
  password: string;
}

// Error interface
interface AuthErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLogInOpen, setIsLogInOpen] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<AuthErrors>({});
  const [resendTimer, setResendTimer] = useState(0);
  const [resentSuccess, setResentSuccess] = useState(false);
  const [resentError, setResentError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Disposable email domains check
  const disposableEmailDomains = [
    "10minutemail.com", "mailinator.com", "guerrillamail.com", "tempmail.org",
    "throwaway.email", "mailnesia.com", "maildrop.cc", "getairmail.com",
    "sharklasers.com", "grr.la", "guerrillamailblock.com", "pokemail.net",
    "spam4.me", "bccto.me", "chacuo.net", "dispostable.com", "mailinator2.com",
    "mailmetrash.com", "trashmail.net", "mailnull.com", "getnada.com",
    "yopmail.com", "yopmail.net", "yopmail.org", "cool.fr.nf", "jetable.fr.nf",
    "nospam.ze.tc", "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr", "courriel.fr.nf",
    "moncourrier.fr.nf", "monemail.fr.nf", "monmail.fr.nf", "mailo.com",
    "mailnesia.com", "mailcatch.com", "mailinator.com", "mailinator2.com",
    "mailinator3.com", "mailinator4.com", "mailinator5.com", "mailinator6.com",
    "mailinator7.com", "mailinator8.com", "mailinator9.com", "mailinator10.com"
  ];

  const isDisposableEmail = (email: string) => {
    if (!email || !email.includes('@')) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return disposableEmailDomains.includes(domain);
  };

  // Timer for resend verification email
  const startResendTimer = () => {
    setResendTimer(60);
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Firebase error handler
  const handleFirebaseError = (error: any): string => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/weak-password':
        return 'Password is too weak.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked. Please allow pop-ups for this site.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email but different sign-in credentials.';
      case 'auth/requires-recent-login':
        return 'Please log in again to complete this action.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  // Sign up handler
  const handleSignUp = async (data: SignUpData, setIsTransitioning: (value: boolean) => void) => {
    setErrors({});
    setIsLoading(true);
    try {
      // Validate inputs
      const newErrors: AuthErrors = {};
      if (!data.name.trim()) newErrors.name = 'Name is required';
      if (!data.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = 'Email is invalid';
      else if (isDisposableEmail(data.email)) newErrors.email = 'Disposable emails are not allowed. Please use a permanent email address.';
      if (!data.password) newErrors.password = 'Password is required';
      else if (data.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (data.password !== data.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUser = userCredential.user;
      
      // Update display name
      await updateProfile(newUser, { displayName: data.name });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        email: newUser.email,
        name: data.name,
        createdAt: new Date().toISOString(),
        verified: false,
        lastLoginAt: new Date().toISOString(),
      });
      
      // Send verification email
      await sendEmailVerification(newUser);
      
      // Sign out the user immediately after signup since they're not verified
      await firebaseSignOut(auth);
      
      setIsTransitioning(true);
      setShowVerifyEmail(true);
    } catch (error: any) {
      setErrors({ general: handleFirebaseError(error) });
    } finally {
      setIsLoading(false);
      setIsTransitioning(false);
    }
  };

  // Login handler
  const handleLogIn = async (data: LogInData) => {
    setErrors({});
    setIsLoading(true);
    try {
      const newErrors: AuthErrors = {};
      if (!data.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = 'Email is invalid';
      if (!data.password) newErrors.password = 'Password is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;
      
      // Check if user is verified in Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        // User doesn't exist in Firestore, create them as verified
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || '',
          createdAt: new Date().toISOString(),
          verified: true,
          lastLoginAt: new Date().toISOString(),
        });
      } else {
        const userData = userSnap.data();
        
        // Check if user has verified their email in Firebase
        if (!firebaseUser.emailVerified) {
          // User hasn't verified email in Firebase - sign them out and show verification modal
          await firebaseSignOut(auth);
          setShowVerifyEmail(true);
          setErrors({ general: 'Please verify your email before logging in. Check your inbox for a verification link.' });
          setIsLoading(false);
          return;
        }
        
        // Check if user is marked as verified in Firestore
        if (!userData.verified) {
          // User has verified email but not marked as verified in Firestore
          // Update their verification status and allow login
          await updateDoc(userRef, { 
            verified: true,
            lastLoginAt: new Date().toISOString(),
          });
        } else {
          // User is verified, update last login
          await updateDoc(userRef, { 
            lastLoginAt: new Date().toISOString(),
          });
        }
      }
      // --- FIX: Close login modal and reset modal state after successful login ---
      setIsLogInOpen(false);
      setShowVerifyEmail(false);
      setErrors({});
      // ------------------------------------------------------
      router.push('/dashboard');
    } catch (error: any) {
      setErrors({ general: handleFirebaseError(error) });
    } finally {
      setIsLoading(false);
    }
  };

  // Google auth handler
  const handleGoogleAuth = async (isSignUp: boolean) => {
    setErrors({});
    setIsLoading(true);
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
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
        router.push('/dashboard');
      } else {
        setErrors({ general: data.error || 'Google authentication failed' });
      }
    } catch (error: any) {
      setErrors({ general: handleFirebaseError(error) });
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification email
  const handleResendVerificationEmail = async () => {
    if (resendTimer > 0) return;
    setResentSuccess(false);
    setResentError('');
    setIsLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user to resend verification for.');
      await sendEmailVerification(currentUser);
      setResentSuccess(true);
      startResendTimer();
    } catch (error: any) {
      setResentError('Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async (email: string) => {
    setForgotPasswordSuccess('');
    setForgotPasswordError('');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setForgotPasswordSuccess('Password reset email sent! Please check your inbox.');
    } catch (error: any) {
      setForgotPasswordError(handleFirebaseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    if (user) {
      await user.reload();
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  // Resend verification email
  const resendVerificationEmail = async () => {
    if (!user) return;
    
    try {
      await sendEmailVerification(user);
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  };

  // Clear errors
  const clearErrors = () => {
    setErrors({});
  };

  // Modal handlers
  const openSignUp = () => {
    setIsSignUpOpen(true);
    setIsLogInOpen(false);
    setShowVerifyEmail(false);
    clearErrors();
  };

  const openLogIn = () => {
    setIsLogInOpen(true);
    setIsSignUpOpen(false);
    setShowVerifyEmail(false);
    clearErrors();
  };

  const closeSignUp = () => {
    setIsSignUpOpen(false);
    setShowVerifyEmail(false);
    clearErrors();
  };

  const closeLogIn = () => {
    setIsLogInOpen(false);
    clearErrors();
  };

  const switchToLogIn = () => {
    setIsLogInOpen(true);
    setIsSignUpOpen(false);
    setShowVerifyEmail(false);
    clearErrors();
  };

  const switchToSignUp = () => {
    setIsSignUpOpen(true);
    setIsLogInOpen(false);
    setShowVerifyEmail(false);
    clearErrors();
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userWithProfile = firebaseUser as User;
        
        // Get user profile from Firestore
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const profileData = userSnap.data() as UserProfile;
            
            // Check if user has verified their email in Firebase
            if (!firebaseUser.emailVerified) {
              // User hasn't verified email - sign them out
              console.log('Unverified user detected, signing out');
              await firebaseSignOut(auth);
              setUser(null);
              setUserProfile(null);
              setLoading(false);
              return;
            }
            
            // If user has verified email but not marked as verified in Firestore,
            // update their verification status
            if (!profileData.verified && firebaseUser.emailVerified) {
              await updateDoc(userRef, { verified: true });
              profileData.verified = true;
            }
            
            userWithProfile.name = profileData.name;
            userWithProfile.verified = profileData.verified;
            userWithProfile.createdAt = profileData.createdAt;
            userWithProfile.lastLoginAt = profileData.lastLoginAt;
            
            setUserProfile(profileData);
          } else {
            // User exists in Firebase Auth but not in Firestore
            // This shouldn't happen with our current flow, but handle it gracefully
            console.log('User not found in Firestore, signing out');
            await firebaseSignOut(auth);
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // On error, sign out the user to be safe
          await firebaseSignOut(auth);
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }
        
        setUser(userWithProfile);
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db]);

  // Real-time user profile updates
  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const profileData = doc.data() as UserProfile;
        setUserProfile(profileData);
        
        // Update user object with latest profile data
        setUser(prevUser => {
          if (!prevUser) return prevUser;
          return {
            ...prevUser,
            name: profileData.name,
            verified: profileData.verified,
            createdAt: profileData.createdAt,
            lastLoginAt: profileData.lastLoginAt,
          };
        });
      }
    });

    return () => unsubscribe();
  }, [user?.uid, db]);

  // Automatically close all auth modals when user is authenticated
  useEffect(() => {
    if (user) {
      setIsLogInOpen(false);
      setIsSignUpOpen(false);
      setShowVerifyEmail(false);
      setErrors({});
    }
  }, [user]);

  const value: AuthContextType = {
    // User state
    user,
    userProfile,
    loading,
    
    // Auth state
    isAuthenticated: !!user,
    isEmailVerified: !!user?.emailVerified,
    
    // Auth methods
    signOut,
    refreshUser,
    updateUserProfile,
    resendVerificationEmail,
    
    // Modal state
    isSignUpOpen,
    isLogInOpen,
    showVerifyEmail,
    
    // Modal methods
    openSignUp,
    openLogIn,
    closeSignUp,
    closeLogIn,
    switchToLogIn,
    switchToSignUp,
    
    // Auth flow methods
    handleSignUp,
    handleLogIn,
    handleGoogleAuth,
    handleResendVerificationEmail,
    handleForgotPassword,
    
    // Error handling
    errors,
    clearErrors,
    
    // Loading states
    isLoading,
    resendTimer,
    resentSuccess,
    resentError,
    forgotPasswordSuccess,
    forgotPasswordError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 