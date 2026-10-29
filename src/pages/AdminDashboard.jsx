import React, { useState, useEffect } from 'react';
import { 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { supabase, isSupabaseConfigured } from '../supabase';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMainframe } from '../context/MainframeContext';
import PortfolioSPA from '../components/PortfolioSPA';

function AdminDashboard() {
    const { triggerReturnToPortfolio } = useMainframe();
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (isSupabaseConfigured && supabase) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                setUser(session?.user || null);
                setLoading(false);
            });

            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                setUser(session?.user || null);
                setLoading(false);
            });

            return () => subscription.unsubscribe();
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isSupabaseConfigured && supabase) {
            try {
                const { error: supError } = await supabase.auth.signInWithPassword({ email, password });
                if (supError) {
                    setError(supError.message || 'Authentication failed. Please verify credentials.');
                }
            } catch (err) {
                setError(err.message || 'Supabase authentication failed.');
            }
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.error("Auth error:", err);
            let msg = 'Authentication failed. Please verify your credentials.';
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
                msg = 'Invalid email or password. Access denied.';
            } else if (err.code === 'auth/too-many-requests') {
                msg = 'Too many failed login attempts. Please try again later.';
            }
            setError(msg);
        }
    };

    const handleLogout = async () => {
        if (isSupabaseConfigured && supabase) {
            await supabase.auth.signOut();
        } else {
            await signOut(auth);
        }
        triggerReturnToPortfolio();
    };

    return (
        <>
            {loading ? (
                <div className="admin-container" style={{ textAlign: 'center', paddingTop: '100px', position: 'relative', zIndex: 10 }}>Loading...</div>
            ) : !user ? (
                <div className="portfolio-wrapper" style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-panel" style={{ position: 'relative', zIndex: 20, padding: '40px', width: '100%', maxWidth: '420px', background: 'var(--bg-secondary)', border: '1px solid var(--cryo-glass-border)', borderRadius: '24px', boxShadow: '0 24px 70px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                        <h2 style={{ marginBottom: '8px', textAlign: 'center', fontFamily: 'Outfit', fontSize: '1.8rem', color: 'var(--text-main)' }}>
                            Admin Login
                        </h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                            Enter your credentials to access the portfolio mainframe
                        </p>

                        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input
                                type="email"
                                placeholder="Admin Email"
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
                            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '6px' }}>
                                Sign In
                            </button>
                        </form>

                        {error && (
                            <div className="admin-error-message" style={{ color: '#ef4444', marginTop: '16px', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem' }}>
                            <button
                                type="button"
                                onClick={triggerReturnToPortfolio}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'color 0.2s ease',
                                    fontFamily: 'inherit'
                                }}
                            >
                                &larr; Back to Portfolio
                            </button>
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
