import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

function ProjectsList({ isAdmin = false }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        date: '',
        tag: 'Web Application',
        tagClass: 'tag-fullstack',
        skills: ''
    });

    const [uploading, setUploading] = useState({});
    const [activeSlide, setActiveSlide] = useState({});
    const [photoToDelete, setPhotoToDelete] = useState(null);

    const handleUploadPhoto = async (projectId, file) => {
        if (!file) return;
        setUploading({ ...uploading, [projectId]: true });
        try {
            // If the user tries to upload to a fallback project, save the fallback data to Firestore first!
            if (['1', '2', '3'].includes(projectId)) {
                const fp = fallbackProjects.find(p => p.id === projectId);
                if (fp) {
                    const { id, ...data } = fp;
                    await setDoc(doc(db, 'projects', projectId), data, { merge: true });
                }
            }

            const storageRef = ref(storage, `projects/${projectId}/${file.name}-${Date.now()}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            
            await updateDoc(doc(db, 'projects', projectId), {
                photos: arrayUnion(url)
            });
            
            setProjects(projects.map(p => {
                if (p.id === projectId) {
                    return { ...p, photos: [...(p.photos || []), url] };
                }
                return p;
            }));
        } catch (err) {
            console.error("Error uploading photo", err);
            alert("Error uploading photo. Check console for details.");
        } finally {
            setUploading({ ...uploading, [projectId]: false });
        }
    };

    const handleReplacePhoto = async (projectId, oldUrl, file) => {
        if (!file) return;
        setUploading({ ...uploading, [projectId]: true });
        try {
            const storageRef = ref(storage, `projects/${projectId}/${file.name}-${Date.now()}`);
            await uploadBytes(storageRef, file);
            const newUrl = await getDownloadURL(storageRef);
            
            const project = projects.find(p => p.id === projectId);
            const newPhotos = (project.photos || []).map(url => url === oldUrl ? newUrl : url);
            
            await updateDoc(doc(db, 'projects', projectId), {
                photos: newPhotos
            });
            
            setProjects(projects.map(p => {
                if (p.id === projectId) {
                    return { ...p, photos: newPhotos };
                }
                return p;
            }));
        } catch (err) {
            console.error("Error replacing photo", err);
            alert("Error replacing photo.");
        } finally {
            setUploading({ ...uploading, [projectId]: false });
        }
    };

    const handleRemovePhoto = async (projectId, url) => {
        try {
            await updateDoc(doc(db, 'projects', projectId), {
                photos: arrayRemove(url)
            });
            setProjects(projects.map(p => {
                if (p.id === projectId) {
                    const newPhotos = (p.photos || []).filter(u => u !== url);
                    if ((activeSlide[projectId] || 0) >= newPhotos.length) {
                        setActiveSlide(prev => ({ ...prev, [projectId]: Math.max(0, newPhotos.length - 1) }));
                    }
                    return { ...p, photos: newPhotos };
                }
                return p;
            }));
            setPhotoToDelete(null);
        } catch (err) {
            console.error("Error removing photo", err);
        }
    };

    const fallbackProjects = [
        {
            id: '1',
            tag: 'Software / Simulation',
            title: 'CREOsim-MECHA',
            description: 'A dynamic mechatronics simulation tool designed to test mechanical workflows and digital integrations prior to physical hardware construction. Engineered a custom Dijkstra pathfinding algorithm to intelligently route simulated cables through physical board gutters.',
            skills: ['Konva.js', 'TypeScript', 'Algorithms']
        },
        {
            id: '2',
            tag: 'Mobile Development',
            title: 'CRADLE App',
            description: 'A cross-platform mobile application dormitory finder built to connect students with accommodations. Engineered robust state management and seamless UI across iOS and Android.',
            skills: ['Flutter', 'Dart', 'Firebase']
        },
        {
            id: '3',
            tag: 'Web Application',
            title: 'PING System',
            description: 'Architected a robust OOP backend system and responsive frontend for real-time monitoring. Resolved deep architectural challenges in state management, repository patterns, and concurrent data synchronization.',
            skills: ['React', 'Node.js', 'WebSockets', 'Supabase']
        }
    ];

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'projects'));
                const projectsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProjects(projectsData);
            } catch (err) {
                console.error("Error fetching projects: ", err);
                if (err.message.includes("permissions") || err.message.includes("missing")) {
                    setError('Firebase permissions error. Showing fallback data.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjects().then(() => {
            if (projects.length === 0 && loading) {
                setTimeout(() => setProjects(fallbackProjects), 1000); 
            }
        });
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await deleteDoc(doc(db, 'projects', id));
                setProjects(projects.filter(p => p.id !== id));
            } catch (err) {
                console.error("Error deleting project", err);
            }
        }
    };

    const handleAddProject = async (e) => {
        e.preventDefault();
        try {
            const docData = {
                ...newProject,
                skills: newProject.skills.split(',').map(s => s.trim()).filter(s => s),
                photos: []
            };
            const docRef = await addDoc(collection(db, 'projects'), docData);
            setProjects([...projects, { id: docRef.id, ...docData }]);
            setNewProject({ title: '', description: '', date: '', tag: 'Web Application', tagClass: 'tag-fullstack', skills: '' });
            setShowAddForm(false);
        } catch (err) {
            console.error("Error adding project", err);
        }
    };

    return (
        <section id="projects" className="projects-container">
            <motion.h2 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ fontSize: '4rem', textTransform: 'uppercase', marginBottom: '80px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}
            >
                Selected Work
            </motion.h2>

            {error && <p style={{ color: 'var(--accent)', marginBottom: '40px' }}>{error}</p>}

            {loading && projects.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>Loading archive...</div>
            ) : (
                projects.map((project, index) => (
                    <motion.div 
                        key={project.id}
                        className="project-row"
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="project-info" style={{ position: 'relative' }}>
                            {isAdmin && (
                                <button 
                                    onClick={() => handleDelete(project.id)}
                                    style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', zIndex: 10 }}
                                >
                                    Delete Project
                                </button>
                            )}
                            <span className="project-tag">{project.tag}</span>
                            <h3 className="project-title">{project.title}</h3>
                            <p className="project-desc">{project.description}</p>
                            
                            <div className="tag-list">
                                {project.skills && project.skills.map((skill, idx) => (
                                    <span className="tag" key={idx}>{skill}</span>
                                ))}
                            </div>
                            

                        </div>
                        
                        {project.photos && project.photos.length > 0 ? (
                            <div className="project-gallery" style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', overflow: 'hidden' }}>
                                <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                    <AnimatePresence mode="wait">
                                        <motion.img 
                                            key={activeSlide[project.id] || 0}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.4 }}
                                            src={project.photos[activeSlide[project.id] || 0]} 
                                            alt={`${project.title} Slide ${(activeSlide[project.id] || 0) + 1}`} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} 
                                        />
                                    </AnimatePresence>
                                    
                                    {project.photos.length > 1 && (
                                        <>
                                            <button 
                                                onClick={() => setActiveSlide(prev => ({ ...prev, [project.id]: ((prev[project.id] || 0) - 1 + project.photos.length) % project.photos.length }))} 
                                                style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)' }}
                                            >
                                                <ChevronLeft size={24} />
                                            </button>
                                            <button 
                                                onClick={() => setActiveSlide(prev => ({ ...prev, [project.id]: ((prev[project.id] || 0) + 1) % project.photos.length }))} 
                                                style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)' }}
                                            >
                                                <ChevronRight size={24} />
                                            </button>
                                            <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
                                                {project.photos.map((_, i) => (
                                                    <div 
                                                        key={i} 
                                                        style={{ width: '8px', height: '8px', borderRadius: '50%', background: (activeSlide[project.id] || 0) === i ? 'var(--accent)' : 'rgba(255,255,255,0.5)', transition: 'background 0.3s', cursor: 'pointer' }} 
                                                        onClick={() => setActiveSlide(prev => ({ ...prev, [project.id]: i }))}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {isAdmin && (
                                        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: '8px', zIndex: 20 }}>
                                            <label title="Add Photo" style={{ background: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: 'white', display: 'flex', backdropFilter: 'blur(4px)' }}>
                                                <Plus size={16} />
                                                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => {
                                                    if(e.target.files && e.target.files[0]) handleUploadPhoto(project.id, e.target.files[0]);
                                                }} disabled={uploading[project.id]} />
                                            </label>
                                            <label title="Replace Current Photo" style={{ background: 'rgba(0,0,0,0.6)', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: 'white', display: 'flex', backdropFilter: 'blur(4px)' }}>
                                                <Edit2 size={16} />
                                                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => {
                                                    if(e.target.files && e.target.files[0]) handleReplacePhoto(project.id, project.photos[activeSlide[project.id] || 0], e.target.files[0]);
                                                }} disabled={uploading[project.id]} />
                                            </label>
                                            <button title="Delete Current Photo" onClick={() => setPhotoToDelete({ projectId: project.id, url: project.photos[activeSlide[project.id] || 0] })} style={{ background: 'rgba(239, 68, 68, 0.8)', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: 'white', border: 'none', display: 'flex', backdropFilter: 'blur(4px)' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {uploading[project.id] && (
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', zIndex: 30, backdropFilter: 'blur(4px)' }}>
                                            Uploading...
                                        </div>
                                    )}

                                    {photoToDelete && photoToDelete.projectId === project.id && photoToDelete.url === project.photos[activeSlide[project.id] || 0] && (
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 40, backdropFilter: 'blur(8px)' }}>
                                            <p style={{ color: 'white', fontSize: '1.2rem', marginBottom: '24px', fontWeight: 500 }}>Delete this photo?</p>
                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                <button onClick={() => handleRemovePhoto(project.id, photoToDelete.url)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', fontWeight: 600 }}>Yes, Delete</button>
                                                <button onClick={() => setPhotoToDelete(null)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 24px', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            isAdmin ? (
                                <label style={{ flex: 1.2, height: '500px', background: 'var(--card-bg)', borderRadius: '24px', border: '1px dashed var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: 'var(--accent)', cursor: 'pointer', position: 'relative' }}>
                                    {uploading[project.id] ? 'Uploading...' : '+ Add Photo'}
                                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => {
                                        if(e.target.files && e.target.files[0]) handleUploadPhoto(project.id, e.target.files[0]);
                                    }} disabled={uploading[project.id]} />
                                </label>
                            ) : (
                                <motion.div 
                                    className="project-image-placeholder"
                                    whileHover={{ scale: 0.98 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <span>0{index + 1}</span>
                                </motion.div>
                            )
                        )}
                    </motion.div>
                ))
            )}

            {isAdmin && (
                <div style={{ marginTop: '60px', textAlign: 'center' }}>
                    {!showAddForm ? (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                            <button 
                                onClick={() => setShowAddForm(true)}
                                className="btn btn-secondary"
                                style={{ padding: '16px 32px', fontSize: '1.2rem', background: 'transparent', border: '1px dashed var(--accent)', color: 'var(--accent)' }}
                            >
                                + Add New Project
                            </button>
                            {projects.length > 0 && projects[0].id === '1' && (
                                <button 
                                    onClick={async () => {
                                        if (window.confirm("This will push the 3 default placeholder projects to your actual database. Proceed?")) {
                                            try {
                                                for (const fp of fallbackProjects) {
                                                    const { id, ...data } = fp;
                                                    await addDoc(collection(db, 'projects'), { ...data, photos: [] });
                                                }
                                                alert("Success! Refresh the page to see them fetched from the backend.");
                                            } catch (err) {
                                                console.error("Error seeding", err);
                                                alert("Error pushing to backend.");
                                            }
                                        }
                                    }}
                                    className="btn btn-primary"
                                    style={{ padding: '16px 32px', fontSize: '1.2rem', background: 'var(--accent)', color: 'black', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Push Defaults to Backend
                                </button>
                            )}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-panel" 
                            style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}
                        >
                            <h3 style={{ marginBottom: '24px', fontFamily: 'Outfit' }}>Add New Project</h3>
                            <form onSubmit={handleAddProject} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input type="text" placeholder="Title" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} className="admin-input" required />
                                <input type="text" placeholder="Tag (e.g., Full-Stack)" value={newProject.tag} onChange={e => setNewProject({ ...newProject, tag: e.target.value })} className="admin-input" required />
                                <textarea placeholder="Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} className="admin-input admin-textarea" required />
                                <input type="text" placeholder="Skills (comma separated)" value={newProject.skills} onChange={e => setNewProject({ ...newProject, skills: e.target.value })} className="admin-input" />
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Save Project</button>
                                    <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.05)' }}>Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </div>
            )}
        </section>
    );
}

export default ProjectsList;
