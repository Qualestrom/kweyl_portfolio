import React from 'react';
import './LoadingScaffold.css';

/**
 * Universal Cryo-Frost Skeleton Primitive
 */
export function ScaffoldBlock({
  className = '',
  width,
  height,
  style = {},
  rounded = 'rounded-md',
  children,
}) {
  const inlineStyles = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...style,
  };

  return (
    <div
      className={`cryo-scaffold-base ${rounded} ${className}`}
      style={inlineStyles}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

/**
 * Panel Container with Snezhnayan Constellation Corner Nodes
 */
export function ScaffoldPanel({
  className = '',
  style = {},
  showCornerNodes = true,
  children,
}) {
  return (
    <div className={`cryo-scaffold-panel rounded-2xl ${className}`} style={style} aria-hidden="true">
      {showCornerNodes && (
        <>
          <span className="cryo-scaffold-corner-node tl" />
          <span className="cryo-scaffold-corner-node tr" />
          <span className="cryo-scaffold-corner-node bl" />
          <span className="cryo-scaffold-corner-node br" />
        </>
      )}
      {children}
    </div>
  );
}

/**
 * Multi-Line Text Skeleton with Organic Natural Line Lengths
 */
export function ScaffoldText({
  lines = 3,
  className = '',
  lineHeight = 'h-4',
  spacing = 'gap-2',
}) {
  const widths = ['w-full', 'w-11/12', 'w-4/5', 'w-3/4', 'w-2/3'];

  return (
    <div className={`flex flex-col ${spacing} ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <ScaffoldBlock
          key={i}
          className={`${lineHeight} ${widths[i % widths.length]}`}
          rounded="rounded"
        />
      ))}
    </div>
  );
}

/**
 * Projects Section Dedicated Scaffold
 * Faithfully mirrors ProjectsShowcase: Filter Pills, Active Info Column, Media Slider & Thumbs
 */
export function ProjectsScaffold() {
  return (
    <div className="projects-scaffold-container" aria-label="Loading Projects Matrix">
      {/* Top Filter Category Tabs */}
      <div className="projects-scaffold-top-tabs">
        <ScaffoldBlock width="90px" height="34px" rounded="rounded-full" />
        <ScaffoldBlock width="130px" height="34px" rounded="rounded-full" />
        <ScaffoldBlock width="120px" height="34px" rounded="rounded-full" />
        <ScaffoldBlock width="140px" height="34px" rounded="rounded-full" />
      </div>

      {/* Main Two-Column Showcase Grid */}
      <div className="projects-scaffold-grid">
        {/* Left Info Column */}
        <div className="projects-scaffold-left">
          {/* Eyebrow Tag */}
          <ScaffoldBlock width="160px" height="22px" rounded="rounded-md" />

          {/* Project Title */}
          <ScaffoldBlock width="85%" height="38px" rounded="rounded-lg" />

          {/* Category & Status Badges */}
          <div className="flex items-center gap-2">
            <ScaffoldBlock width="110px" height="26px" rounded="rounded-full" />
            <ScaffoldBlock width="80px" height="26px" rounded="rounded-full" />
          </div>

          {/* Project Description (3 lines) */}
          <ScaffoldText lines={3} lineHeight="h-4" spacing="gap-2.5" />

          {/* Tech Stack Chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            <ScaffoldBlock width="75px" height="26px" rounded="rounded-md" />
            <ScaffoldBlock width="90px" height="26px" rounded="rounded-md" />
            <ScaffoldBlock width="65px" height="26px" rounded="rounded-md" />
            <ScaffoldBlock width="80px" height="26px" rounded="rounded-md" />
            <ScaffoldBlock width="105px" height="26px" rounded="rounded-md" />
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-3 pt-3">
            <ScaffoldBlock width="130px" height="42px" rounded="rounded-xl" />
            <ScaffoldBlock width="140px" height="42px" rounded="rounded-xl" />
          </div>
        </div>

        {/* Right Media Slider Column */}
        <div className="projects-scaffold-right">
          {/* 16:10 Display Screen */}
          <ScaffoldPanel className="projects-scaffold-media">
            <div className="projects-scaffold-media-aperture" />
          </ScaffoldPanel>

          {/* Bottom Thumbnails Rail */}
          <div className="projects-scaffold-thumbs">
            <ScaffoldBlock width="80px" height="52px" rounded="rounded-lg" />
            <ScaffoldBlock width="80px" height="52px" rounded="rounded-lg" />
            <ScaffoldBlock width="80px" height="52px" rounded="rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Certificates Section Dedicated Scaffold
 * Faithfully mirrors CertificatesCarousel: 3D Stacked Deck, Center Card, Left/Right Peeks
 */
export function CertificatesScaffold() {
  return (
    <div className="certificates-scaffold-container" aria-label="Loading Accreditation Matrix">
      {/* Header Eyebrow */}
      <div className="flex flex-col items-center gap-2">
        <ScaffoldBlock width="180px" height="22px" rounded="rounded-full" />
        <ScaffoldBlock width="260px" height="32px" rounded="rounded-lg" />
      </div>

      {/* 3D Stacked Deck */}
      <div className="certificates-scaffold-deck">
        {/* Left Perspective Peek */}
        <div className="certificates-scaffold-card-peek left cryo-scaffold-base" />

        {/* Center Main Certificate Card */}
        <ScaffoldPanel className="certificates-scaffold-card-center">
          {/* Top Bar with Seal & Issuer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="certificates-scaffold-seal">
                <span className="w-2.5 h-2.5 rotate-45 bg-cyan-400" />
              </div>
              <div className="flex flex-col gap-1.5">
                <ScaffoldBlock width="130px" height="14px" rounded="rounded" />
                <ScaffoldBlock width="90px" height="11px" rounded="rounded" />
              </div>
            </div>
            <ScaffoldBlock width="70px" height="24px" rounded="rounded-full" />
          </div>

          {/* Middle Body / Certificate Graphic Frame */}
          <ScaffoldBlock className="w-full flex-1 my-4" rounded="rounded-xl" />

          {/* Bottom Accreditation Title & Date */}
          <div className="flex items-center justify-between pt-2 border-t border-cyan-500/10">
            <ScaffoldBlock width="60%" height="20px" rounded="rounded" />
            <ScaffoldBlock width="85px" height="16px" rounded="rounded" />
          </div>
        </ScaffoldPanel>

        {/* Right Perspective Peek */}
        <div className="certificates-scaffold-card-peek right cryo-scaffold-base" />
      </div>

      {/* Navigation Controls: Arrows & Dots */}
      <div className="flex items-center gap-4">
        <ScaffoldBlock width="38px" height="38px" rounded="rounded-full" />
        <div className="flex items-center gap-2">
          <ScaffoldBlock width="10px" height="10px" rounded="rounded-full" />
          <ScaffoldBlock width="24px" height="10px" rounded="rounded-full" />
          <ScaffoldBlock width="10px" height="10px" rounded="rounded-full" />
        </div>
        <ScaffoldBlock width="38px" height="38px" rounded="rounded-full" />
      </div>
    </div>
  );
}

/**
 * Hero Section Dedicated Scaffold
 * Mirrors HomeHero layout: Greeting, Display Headline, Bio, Buttons, and Avatar Orbit Frame
 */
export function HeroScaffold() {
  return (
    <div className="hero-scaffold-container" aria-label="Loading Hero Experience">
      {/* Left Typography & CTA Column */}
      <div className="hero-scaffold-left">
        {/* Greeting Pill */}
        <ScaffoldBlock width="220px" height="28px" rounded="rounded-full" />

        {/* Headline Row 1 */}
        <ScaffoldBlock width="100%" height="52px" rounded="rounded-xl" />

        {/* Headline Row 2 */}
        <ScaffoldBlock width="88%" height="52px" rounded="rounded-xl" />

        {/* Subtitle Bio */}
        <ScaffoldText lines={3} lineHeight="h-4" spacing="gap-2.5" />

        {/* Primary & Secondary Action Buttons */}
        <div className="flex items-center gap-4 pt-3">
          <ScaffoldBlock width="160px" height="48px" rounded="rounded-2xl" />
          <ScaffoldBlock width="160px" height="48px" rounded="rounded-2xl" />
        </div>

        {/* Social Link Badges */}
        <div className="flex items-center gap-3 pt-2">
          <ScaffoldBlock width="40px" height="40px" rounded="rounded-xl" />
          <ScaffoldBlock width="40px" height="40px" rounded="rounded-xl" />
          <ScaffoldBlock width="40px" height="40px" rounded="rounded-xl" />
          <ScaffoldBlock width="40px" height="40px" rounded="rounded-xl" />
        </div>
      </div>

      {/* Right Avatar Frame */}
      <div className="hero-scaffold-right">
        <div className="hero-scaffold-avatar-circle cryo-scaffold-base">
          <div className="hero-scaffold-avatar-ring" />
          <span className="w-12 h-12 rounded-full border border-cyan-400/30 flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * About Section Dedicated Scaffold
 * Mirrors AboutSection layout: Status Badge, Headline, Bio, and 4 Tech Domain Cards
 */
export function AboutScaffold() {
  return (
    <div className="about-scaffold-container" aria-label="Loading Developer Persona">
      {/* Top Status & Headline */}
      <div className="flex flex-col gap-2.5">
        <ScaffoldBlock width="140px" height="26px" rounded="rounded-full" />
        <ScaffoldBlock width="320px" height="40px" rounded="rounded-xl" />
        <ScaffoldText lines={3} lineHeight="h-4" spacing="gap-2" />
      </div>

      {/* 4 Category Skill Panels */}
      <div className="about-scaffold-grid">
        {['Software Engineering', 'Mobile Development', 'Cloud & Architecture', 'Design Systems'].map((_, idx) => (
          <ScaffoldPanel key={idx} className="about-scaffold-category-card">
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/10">
              <ScaffoldBlock width="130px" height="18px" rounded="rounded" />
              <ScaffoldBlock width="20px" height="20px" rounded="rounded-md" />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <ScaffoldBlock width="65px" height="22px" rounded="rounded-md" />
              <ScaffoldBlock width="80px" height="22px" rounded="rounded-md" />
              <ScaffoldBlock width="70px" height="22px" rounded="rounded-md" />
              <ScaffoldBlock width="90px" height="22px" rounded="rounded-md" />
              <ScaffoldBlock width="60px" height="22px" rounded="rounded-md" />
            </div>
          </ScaffoldPanel>
        ))}
      </div>
    </div>
  );
}

