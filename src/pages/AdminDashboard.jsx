import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioSPA } from '../App';

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
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);

    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        date: '',
        tag: '',
        tagClass: 'tag-fullstack',
        challenge: '',
        skills: ''
    });

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

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setError('');
        } catch (err) {
            setError('Failed to login. Check your credentials and firebase setup.');
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

    const handleAddProject = async (e) => {
        e.preventDefault();
        try {
            const docData = {
                ...newProject,
                skills: newProject.skills.split(',').map(s => s.trim()).filter(s => s)
            };
            await addDoc(collection(db, 'projects'), docData);
            setNewProject({
                title: '', description: '', date: '', tag: '', tagClass: 'tag-fullstack', challenge: '', skills: ''
            });
            fetchProjects();
        } catch (err) {
            console.error("Error adding project", err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            await deleteDoc(doc(db, 'projects', id));
            fetchProjects();
        }
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
                <div className="admin-container" style={{ textAlign: 'center' }}>Loading...</div>
            ) : !user ? (
                <div className="portfolio-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px' }}>
                        <h2 style={{ marginBottom: '24px', textAlign: 'center', fontFamily: 'Outfit' }}>Admin Login</h2>
                        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="admin-input"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="admin-input"
                            />
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Login</button>
                        </form>
                        {error && <p style={{ color: '#ef4444', marginTop: '16px', textAlign: 'center' }}>{error}</p>}
                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
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
