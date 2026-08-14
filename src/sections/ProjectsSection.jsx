import React from 'react';
import { motion } from 'framer-motion';
import ProjectsList from '../components/ProjectsList';

export default function ProjectsSection({ isAdmin }) {
  return (
    <section className="section-viewport" id="projects-section">
      <div className="section-content section-scrollable">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <ProjectsList isAdmin={isAdmin} />
        </motion.div>
      </div>
    </section>
  );
}
