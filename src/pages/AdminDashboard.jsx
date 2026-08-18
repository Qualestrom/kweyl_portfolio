import React, { useState, useEffect } from 'react';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged, 
    signOut 
} from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PortfolioSPA from '../components/PortfolioSPA';

const TransitionOverlay = () => (
    <motion.div
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'var(--accent)',
            zIndex: 99999,
            transformOrigin: 'top',
            pointerEvents: 'none'
        }}
    >
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', fontFamily: 'Outfit', fontSize: '3rem', width: '100%', textAlign: 'center' }}
        >
            Accessing Mainframe...
        </motion.div>
    </motion.div>
);

function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                fetchProjects();
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchProjects = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'projects'));
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isSignUp) {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error("Auth error:", err);
            let msg = err.message || 'Authentication failed.';
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                msg = 'Invalid email or password. If you haven\'t created an account yet, click "Create Account" below.';
            } else if (err.code === 'auth/user-not-found') {
                msg = 'No user found with this email. Click "Create Account" below to register.';
            } else if (err.code === 'auth/email-already-in-use') {
                msg = 'This email is already in use. Please sign in instead.';
            } else if (err.code === 'auth/weak-password') {
                msg = 'Password should be at least 6 characters.';
            } else if (err.code === 'auth/operation-not-allowed') {
                msg = 'Email/Password sign-in is not enabled in Firebase Console (Authentication > Sign-in method).';
            }
            setError(msg);
        }
    };

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(async () => {
            await signOut(auth);
            setIsLoggingOut(false);
            navigate('/');
        }, 800);
    };

    return (
        <>
            <TransitionOverlay />
            
            <AnimatePresence>
                {isLoggingOut && (
                    <motion.div 
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        exit={{ scaleY: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, width: '100vw', height: '100vh',
                            background: 'var(--accent)',
                            zIndex: 99999,
                            transformOrigin: 'bottom'
                        }}
                    >
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'white', fontFamily: 'Outfit', fontSize: '3rem', width: '100%', textAlign: 'center' }}
                        >
                            Logging Out...
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="admin-container" style={{ textAlign: 'center', paddingTop: '100px' }}>Loading...</div>
            ) : !user ? (
                <div className="portfolio-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '440px', background: 'var(--bg-secondary)', border: '1px solid var(--cryo-glass-border)', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
                        <h2 style={{ marginBottom: '8px', textAlign: 'center', fontFamily: 'Outfit', fontSize: '1.8rem', color: 'var(--text-main)' }}>
                            {isSignUp ? 'Create Admin Account' : 'Admin Login'}
                        </h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                            {isSignUp ? 'Register your admin credentials for this portfolio' : 'Sign in to edit portfolio content and projects'}
                        </p>

                        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="admin-input"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="admin-input"
                                required
                            />
                            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                                {isSignUp ? 'Register & Enter Admin Mode' : 'Sign In'}
                            </button>
                        </form>

                        {error && (
                            <div style={{ color: '#ef4444', marginTop: '16px', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                            <button 
                                type="button" 
                                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--cryo-accent)', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                            >
                                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Create Account'}
                            </button>
                            <Link to="/" style={{ color: 'var(--text-muted)' }}>Back to Portfolio</Link>
                        </div>
                    </div>
                </div>
            ) : (
                <PortfolioSPA isAdmin={true} onLogout={handleLogout} />
            )}
        </>
    );
}

export default AdminDashboard;
