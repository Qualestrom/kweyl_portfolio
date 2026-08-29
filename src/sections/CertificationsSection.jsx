import React from 'react';
import { motion } from 'framer-motion';
import CertificatesCarousel from '../components/CertificatesCarousel';

export default function CertificationsSection({ isAdmin }) {
  return (
    <section className="section-viewport overflow-y-auto lg:overflow-hidden py-10 lg:py-0" id="certifications-section">
      <div className="section-content w-full h-full flex items-center justify-center pl-6 sm:pl-10 lg:pl-32 xl:pl-44 pr-6 sm:pr-10 lg:pr-12 xl:pr-16 max-w-[1480px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full my-auto"
        >
          <CertificatesCarousel isAdmin={isAdmin} />
        </motion.div>
      </div>
    </section>
  );
}
