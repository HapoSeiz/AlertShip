# Authentication Context

This directory contains the global authentication context for AlertShip.

## AuthContext.tsx

The `AuthContext` provides a centralized way to manage authentication state across the entire application.

### Features

- **Global State Management**: User authentication state is managed globally
- **Firebase Integration**: Seamless integration with Firebase Auth and Firestore
- **Email Verification**: Built-in email verification flow
- **Google OAuth**: Support for Google sign-in
- **Modal Management**: Integrated auth modal state management
- **Real-time Updates**: Live user profile updates via Firestore
- **Error Handling**: Comprehensive error handling for auth operations

### Usage

#### 1. Provider Setup

The `AuthProvider` is already set up in `app/layout.tsx` to wrap the entire application:

```tsx
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

#### 2. Using the Auth Context

In any component, import and use the `useAuth` hook:

```tsx
import { useAuth } from '@/contexts/AuthContext'

export default function MyComponent() {
  const {
    user,
    isAuthenticated,
    loading,
    signOut,
    openLogIn,
    openSignUp
  } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <button onClick={openLogIn}>Log In</button>
          <button onClick={openSignUp}>Sign Up</button>
        </div>
      )}
    </div>
  )
}
```

### Available Properties and Methods

#### User State
- `user`: Current Firebase user object with extended properties
- `userProfile`: User profile data from Firestore
- `loading`: Loading state for initial auth check
- `isAuthenticated`: Boolean indicating if user is logged in
- `isEmailVerified`: Boolean indicating if email is verified

#### Auth Methods
- `signOut()`: Sign out the current user
- `refreshUser()`: Refresh user data from Firebase
- `updateUserProfile(updates)`: Update user profile in Firestore
- `resendVerificationEmail()`: Resend email verification

#### Modal State
- `isSignUpOpen`: Sign up modal open state
- `isLogInOpen`: Log in modal open state
- `showVerifyEmail`: Email verification modal state

#### Modal Methods
- `openSignUp()`: Open sign up modal
- `openLogIn()`: Open log in modal
- `closeSignUp()`: Close sign up modal
- `closeLogIn()`: Close log in modal
- `switchToLogIn()`: Switch from sign up to log in
- `switchToSignUp()`: Switch from log in to sign up

#### Auth Flow Methods
- `handleSignUp(data, setIsTransitioning)`: Handle sign up process
- `handleLogIn(data)`: Handle log in process
- `handleGoogleAuth(isSignUp)`: Handle Google OAuth
- `handleResendVerificationEmail()`: Handle resending verification email

#### Error Handling
- `errors`: Current error state
- `clearErrors()`: Clear all errors

#### Loading States
- `isLoading`: Loading state for auth operations
- `resendTimer`: Countdown timer for resend verification
- `resentSuccess`: Success state for resend operation
- `resentError`: Error state for resend operation

### Data Interfaces

#### User
```tsx
interface User extends FirebaseUser {
  name?: string;
  verified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}
```

#### UserProfile
```tsx
interface UserProfile {
  uid: string;
  email: string | null;
  name: string;
  createdAt: string;
  verified: boolean;
  lastLoginAt: string;
  photoURL?: string;
}
```

#### SignUpData
```tsx
interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
```

#### LogInData
```tsx
interface LogInData {
  email: string;
  password: string;
}
```

### Migration from useAuthModals

The new `AuthContext` replaces the `useAuthModals` hook. Here's how to migrate:

#### Before (useAuthModals)
```tsx
import { useAuthModals } from '@/hooks/useAuthModals'

const {
  isSignUpOpen,
  isLogInOpen,
  openSignUp,
  openLogIn
} = useAuthModals()
```

#### After (useAuth)
```tsx
import { useAuth } from '@/contexts/AuthContext'

const {
  isSignUpOpen,
  isLogInOpen,
  openSignUp,
  openLogIn
} = useAuth()
```

### Security Features

- **Email Verification**: Required for email/password accounts
- **Disposable Email Blocking**: Prevents use of temporary email services
- **Secure Password Validation**: Minimum 6 characters required
- **Firebase Security Rules**: Enforced on Firestore operations
- **Token-based Authentication**: Uses Firebase ID tokens for API calls

### Error Handling

The context provides comprehensive error handling for common Firebase auth errors:

- Email already in use
- Invalid email format
- Weak passwords
- User not found
- Wrong password
- Too many failed attempts
- Network errors
- Popup blocked/closed

All errors are automatically translated to user-friendly messages. 