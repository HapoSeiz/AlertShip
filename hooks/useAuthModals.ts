import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '@/firebase/firebase';

interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LogInData {
  email: string;
  password: string;
}

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function useAuthModals() {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLogInOpen, setIsLogInOpen] = useState(false);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [resendTimer, setResendTimer] = useState(0);
  const [resentSuccess, setResentSuccess] = useState(false);
  const [resentError, setResentError] = useState('');
  const router = useRouter();

  const disposableEmailDomains = [
    "10minutemail.com",
    "mailinator.com",
    // ... other domains (omitted for brevity, use the full list from original auth-modals.jsx)
  ];

  const isDisposableEmail = (email: string) => {
    if (!email || !email.includes('@')) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return disposableEmailDomains.includes(domain);
  };

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

  const handleSignUp = async (data: SignUpData, setIsTransitioning: (value: boolean) => void) => {
    setErrors({});
    setIsLoading(true);
    try {
      // Validate inputs
      const newErrors: Errors = {};
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

      
      const auth = getAuth(app);
      const db = getFirestore(app);
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: data.name,
        createdAt: new Date().toISOString(),
        verified: false,
      });
      await sendEmailVerification(user);
      setIsTransitioning(true); // Start transition after validation
      setShowVerifyEmail(true);
    } catch (error: any) {
      setErrors({ general: handleFirebaseError(error) });
    } finally {
      setIsLoading(false);
      setIsTransitioning(false);
    }
  };

  const handleLogIn = async (data: LogInData) => {
    setErrors({});
    setIsLoading(true);
    try {
      const newErrors: Errors = {};
      if (!data.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = 'Email is invalid';
      if (!data.password) newErrors.password = 'Password is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }

      const auth = getAuth(app);
      const db = getFirestore(app);
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      if (!user.emailVerified) {
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
      router.push('/dashboard');
    } catch (error: any) {
      setErrors({ general: handleFirebaseError(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async (isSignUp: boolean) => {
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

  const handleResendVerificationEmail = async () => {
    if (resendTimer > 0) return;
    setResentSuccess(false);
    setResentError('');
    setIsLoading(true);
    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) throw new Error('No user to resend verification for.');
      await sendEmailVerification(user);
      setResentSuccess(true);
      startResendTimer();
    } catch (error: any) {
      setResentError('Failed to resend verification email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebaseError = (error: any): string => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const resetAuthState = () => {
    setShowVerifyEmail(false);
    setErrors({});
    setResentSuccess(false);
    setResentError('');
    setResendTimer(0);
  };

  return {
    isSignUpOpen,
    isLogInOpen,
    showVerifyEmail,
    isLoading,
    errors,
    resendTimer,
    resentSuccess,
    resentError,
    handleSignUp,
    handleLogIn,
    handleGoogleAuth,
    handleResendVerificationEmail,
    openSignUp: () => setIsSignUpOpen(true),
    openLogIn: () => setIsLogInOpen(true),
    closeSignUp: () => setIsSignUpOpen(false),
    closeLogIn: () => setIsLogInOpen(false),
    switchToLogIn: () => {
      setIsSignUpOpen(false);
      setIsLogInOpen(true);
    },
    switchToSignUp: () => {
      setIsLogInOpen(false);
      setIsSignUpOpen(true);
    },
    resetAuthState,
  };
}