import React, { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from '../../firebase/auth';
import { useAuth } from '../../contexts/authContext';
import { getApiUrl } from '../pages/createsteps helpers/CreateStepsUtils';

const Login = () => {
    const { userLoggedIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [, setIsSyncing] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            setErrorMessage('');  // Clear previous error messages
            try {
                await doSignInWithEmailAndPassword(email, password);
            } catch (error) {
                setErrorMessage(handleFirebaseError(error));
                setIsSigningIn(false);
            }
        }
    };

       const onGoogleSignIn = async (e) => {
        e.preventDefault();
        if (isSigningIn) return;
        setIsSigningIn(true);
        setIsSyncing(true);
        setErrorMessage('');

        try {
            // Step 1: Sign in with Google via Firebase
            const result = await doSignInWithGoogle();
            const firebaseUser = result.user;
            if (firebaseUser?.uid && firebaseUser?.email) {
                const backendUserData = {
                    firebase_uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    username: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                    is_creator: true
                };

                // If the user is created successfully, we also need to create a user profile in our backend
                if (result.user) {
                    try {
                        const response = await fetch(`${getApiUrl()}/users/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(backendUserData),
                        });

                        const responseData = await response.json();
                        if (!response.ok && response.status !== 400) {
                            throw new Error(responseData.detail || "Failed to sync user with backend.");
                        }
                        navigate('/home'); // Redirect to home after successful sign-in
                    } catch (error) {
                        setErrorMessage(handleFirebaseError(error));
                        setIsSigningIn(false);
                    } finally {
                        setIsSigningIn(false);
                        setIsSyncing(false); // End sync process, allowing navigation to proceed if user is logged in
                    }
                } else {
                    throw new Error("Could not get user details from Google Sign-In.");
                }
            } else {
                throw new Error("Could not get user details from Google Sign-In.");
            }

        } catch (error) {
            setErrorMessage(handleFirebaseError(error));
            setIsSigningIn(false);
        } finally {
            setIsSigningIn(false);
            setIsSyncing(false); // End sync process, allowing navigation to proceed if user is logged in
        }
    };

    const handleFirebaseError = (error) => {
        // Map Firebase error codes to user-friendly messages
        const errorMessages = {
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/user-not-found': 'No account found with this email.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/user-disabled': 'This account has been disabled.',
            // Add more error codes and messages as needed
        };
        //console.error("Firebase error:", error);

        return errorMessages[error.code] || 'An unexpected error occurred. Please try again.';
    };

    return (
        <div>
            {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

            <main className="w-full h-screen flex self-center place-content-center place-items-center">
                <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border rounded-xl">
                    <div className="text-center mb-6">
                        <div className="mt-2">
                            <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">Welcome Back</h3>
                        </div>
                    </div>
                    <form
                        onSubmit={onSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label className="text-sm text-gray-600 font-bold">
                                Email
                            </label>
                            <input
                                type="email"
                                autoComplete='email'
                                required
                                value={email}
                                onChange={(e) => { setEmail(e.target.value) }}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600 font-bold">
                                Password
                            </label>
                            <input
                                type="password"
                                autoComplete='current-password'
                                required
                                value={password}
                                onChange={(e) => { setPassword(e.target.value) }}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                            />
                        </div>

                        {errorMessage && (
                            <span className='text-red-600 font-bold'>{errorMessage}</span>
                        )}

                        <button
                            type="submit"
                            disabled={isSigningIn}
                            className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isSigningIn ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
                        >
                            {isSigningIn ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                    <p className="text-center text-sm">Don't have an account? <Link to={'/register'} className="hover:underline font-bold">Sign up</Link></p>
                    <div className='flex flex-row text-center w-full'>
                        <div className='border-b-2 mb-2.5 mr-2 w-full'></div>
                        <div className='text-sm font-bold w-fit'>OR</div>
                        <div className='border-b-2 mb-2.5 ml-2 w-full'></div>
                    </div>
                    <button
                        disabled={isSigningIn}
                        onClick={onGoogleSignIn}
                        className={`w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium  ${isSigningIn ? 'cursor-not-allowed' : 'hover:bg-gray-100 transition duration-300 active:bg-gray-100'}`}>
                        <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_17_40)">
                                <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0239 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
                                <path d="M24.48 48.0001C31.0212 48.0001 36.5663 45.6936 40.3801 42.2078L32.6461 36.2111C30.2241 37.8099 27.5212 38.7944 24.48 38.7944C18.6744 38.7944 13.7223 35.1411 11.9341 29.8936H3.92383V36.0278C7.79283 43.6366 15.5348 48.0001 24.48 48.0001Z" fill="#34A853" />
                                <path d="M11.9341 29.8936C11.5284 28.7099 11.2344 27.4488 11.2344 26.1361C11.2344 24.8234 11.5284 23.5623 11.9341 22.3786V16.2444H3.92383C2.43483 19.0499 1.52441 22.4778 1.52441 26.1361C1.52441 29.7944 2.43483 33.2223 3.92383 36.0278L11.9341 29.8936Z" fill="#FBBC05" />
                                <path d="M24.48 9.47781C28.0927 9.47781 31.3934 10.7061 33.9822 13.2044L40.5612 6.6423C36.5574 2.94909 31.0212 0.45459 24.48 0.45459C15.5348 0.45459 7.79283 4.81809 3.92383 12.4269L11.9341 18.5611C13.7223 13.3136 18.6744 9.47781 24.48 9.47781Z" fill="#EA4335" />
                            </g>
                            <defs>
                                <clipPath id="clip0_17_40">
                                    <rect width="48" height="48" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                        Continue with Google
                    </button>
                </div>
            </main>
        </div>
    )
}

export default Login