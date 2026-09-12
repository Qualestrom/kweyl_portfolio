import React from 'react';
import { motion } from 'framer-motion';
import CertificatesCarousel from '../components/CertificatesCarousel';

export default function CertificationsSection({ isAdmin }) {
  return (
    <section className="section-viewport overflow-y-auto lg:overflow-hidden" id="certifications-section">
      <div className="section-content w-full min-h-full flex flex-col justify-start lg:justify-center items-center px-4 sm:px-8 lg:pl-32 xl:pl-44 lg:pr-12 xl:pr-16 max-w-[1480px] pt-14 pb-28 lg:py-0 my-auto">
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
