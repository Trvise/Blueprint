import React, { useState } from 'react';
import { Navigate, Link} from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { doCreateUserWithEmailAndPassword } from '../../firebase/auth';

const Register = () => {
    const { userLoggedIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [username, setUsername] = useState('');

     const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (isRegistering) return;

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match. Please try again.');
            return;
        }
        if (!username.trim()) { // Basic username validation
            setErrorMessage('Username is required.');
            return;
        }

        setIsRegistering(true);

        try {
            // Step 1: Create user in Firebase
            const userCredential = await doCreateUserWithEmailAndPassword(email, password);
            const firebaseUser = userCredential.user;

            // Step 2: If Firebase user creation is successful, create user in your backend
            if (firebaseUser && firebaseUser.uid && firebaseUser.email) {
                const backendUserData = {
                    username: username,
                    email: firebaseUser.email, // Use email from Firebase for consistency
                    firebase_uid: firebaseUser.uid,
                    is_creator: true // Set is_creator to true
                };

                console.log('Sending user data to backend:', backendUserData);

                // Use consistent API URL helper
                const getApiUrl = () => process.env.REACT_APP_API_URL || 'http://localhost:8000';
                const backendApiUrl = `${getApiUrl()}/users/`;

                const response = await fetch(backendApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(backendUserData),
                });

                const responseData = await response.json();

                if (!response.ok) {
                    // Handle backend error
                    console.error('Backend API Error:', responseData);
                    const backendErrorMessage = responseData.detail || `Failed to create user record in backend. Status: ${response.status}`;
                    setErrorMessage(backendErrorMessage);
                    setIsRegistering(false); // Allow retry
                    return; 
                }

                console.log('Backend user created:', responseData);
                setSuccessMessage('Registration successful! You will be redirected.');
                // Navigation to '/home' will be handled by the userLoggedIn state change
            } else {
                throw new Error("Firebase user data (UID or Email) not found after registration.");
            }

        } catch (error) {
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                 setErrorMessage('Network error: Could not connect to the backend server. Please try again later.');
            } else if (error.code) { // Firebase error
                setErrorMessage(handleFirebaseError(error));
            } else { // Other errors
                setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
            }
            setIsRegistering(false);
        }
    };

    const handleFirebaseError = (error) => {
        // Map Firebase error codes to user-friendly messages
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already in use. Please use a different email.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/weak-password': 'The password is too weak. Please use a stronger password.',
            // Add more error codes and messages as needed
        };

        return errorMessages[error.code] || 'An unexpected error occurred. Please try again.';
    };

    return (
        <>
            {userLoggedIn && (<Navigate to={'/home'} replace={true} />)}

            <main className="w-full h-screen flex self-center place-content-center place-items-center">
                <div className="w-96 text-gray-600 space-y-5 p-4 shadow-xl border rounded-xl">
                    <div className="text-center mb-6">
                        <div className="mt-2">
                            <h3 className="text-gray-800 text-xl font-semibold sm:text-2xl">Create a New Account</h3>
                        </div>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-600 font-bold">Email</label>
                            <input
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); }}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600 font-bold">Username</label>
                            <input
                                type="username"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); }}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600 font-bold">Password</label>
                            <input
                                disabled={isRegistering}
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); }}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600 font-bold">Confirm Password</label>
                            <input
                                disabled={isRegistering}
                                type="password"
                                autoComplete="off"
                                required
                                value={confirmPassword}
                                onChange={(e) => { setConfirmPassword(e.target.value); }}
                                className="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg transition duration-300"
                            />
                        </div>

                        {errorMessage && (
                            <div className='text-red-600 font-bold'>
                                {errorMessage}
                            </div>
                        )}

                         {successMessage && (
                             <div role="alert" className='text-green-600 font-semibold text-sm p-3 bg-green-50 border border-green-200 rounded-md'>
                                {successMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isRegistering}
                            className={`w-full px-4 py-2 text-white font-medium rounded-lg ${isRegistering ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300'}`}
                        >
                            {isRegistering ? 'Signing Up...' : 'Sign Up'}
                        </button>
                        <div className="text-sm text-center">
                            Already have an account? {' '}
                            <Link to={'/login'} className="text-center text-sm hover:underline font-bold">Continue</Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
};

export default Register;