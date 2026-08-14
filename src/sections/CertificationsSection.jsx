import React from 'react';
import { motion } from 'framer-motion';
import CertificatesCarousel from '../components/CertificatesCarousel';

export default function CertificationsSection() {
  return (
    <section className="section-viewport" id="certifications-section">
      <div className="section-content section-centered">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: '100%' }}
        >
          <CertificatesCarousel />
        </motion.div>
      </div>
    </section>
  );
}
