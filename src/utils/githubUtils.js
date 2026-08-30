/**
 * Utilities for scanning and fetching metadata from GitHub repositories.
 */

/**
 * Checks if a given string is a valid GitHub repository URL.
 * Matches formats:
 * - https://github.com/owner/repo
 * - http://github.com/owner/repo
 * - github.com/owner/repo
 * - git@github.com:owner/repo.git
 */
export function isGitHubRepoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim().replace(/\.git$/, '');
  const pattern = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/.*)?$/i;
  return pattern.test(clean);
}

/**
 * Parses owner and repo name from a GitHub repository URL.
 * @param {string} url 
 * @returns {{ owner: string, repo: string } | null}
 */
export function parseGitHubRepoUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim().replace(/\.git$/, '').replace(/\/+$/, '');
  const pattern = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)(?:\/.*)?$/i;
  const match = clean.match(pattern);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2],
  };
}

/**
 * Converts kebab-case, snake_case, or camelCase repo names into human-readable Title Case.
 * e.g., 'ai-analytics-dashboard' -> 'Ai Analytics Dashboard'
 * e.g., 'react_portfolio_v2' -> 'React Portfolio V2'
 */
export function formatRepoName(name) {
  if (!name) return '';
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .filter(Boolean)
    .map(word => {
      // Keep acronyms/uppercase if already uppercase
      if (word.length <= 4 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Common technology frameworks detector from package.json dependencies or files
 */
function detectTechStackFromPackageJson(pkgJson) {
  const skills = [];
  if (!pkgJson) return skills;

  const allDeps = {
    ...(pkgJson.dependencies || {}),
    ...(pkgJson.devDependencies || {}),
    ...(pkgJson.peerDependencies || {}),
  };

  const techMap = [
    { key: 'react', name: 'React' },
    { key: 'next', name: 'Next.js' },
    { key: 'vue', name: 'Vue' },
    { key: 'nuxt', name: 'Nuxt' },
    { key: 'svelte', name: 'Svelte' },
    { key: 'express', name: 'Express' },
    { key: 'nestjs', name: 'NestJS' },
    { key: '@nestjs/core', name: 'NestJS' },
    { key: 'fastify', name: 'Fastify' },
    { key: 'tailwindcss', name: 'Tailwind CSS' },
    { key: 'typescript', name: 'TypeScript' },
    { key: 'vite', name: 'Vite' },
    { key: 'electron', name: 'Electron' },
    { key: 'three', name: 'Three.js' },
    { key: '@react-three/fiber', name: 'Three.js' },
    { key: 'framer-motion', name: 'Framer Motion' },
    { key: 'firebase', name: 'Firebase' },
    { key: 'supabase', name: 'Supabase' },
    { key: '@supabase/supabase-js', name: 'Supabase' },
    { key: 'mongodb', name: 'MongoDB' },
    { key: 'mongoose', name: 'MongoDB' },
    { key: 'prisma', name: 'Prisma' },
    { key: '@prisma/client', name: 'Prisma' },
    { key: 'd3', name: 'D3.js' },
    { key: 'redux', name: 'Redux' },
    { key: '@reduxjs/toolkit', name: 'Redux' },
    { key: 'zustand', name: 'Zustand' },
    { key: 'graphql', name: 'GraphQL' },
  ];

  for (const item of techMap) {
    if (allDeps[item.key] && !skills.includes(item.name)) {
      skills.push(item.name);
    }
  }

  return skills;
}

/**
 * Infers project description and extra skills from directory contents
 */
function inferFromContents(files = [], primaryLanguage = '') {
  const fileNames = files.map(f => (typeof f === 'string' ? f : f.name || '').toLowerCase());
  const detectedSkills = [];
  const inferences = [];

  const hasFile = (name) => fileNames.some(f => f === name.toLowerCase() || f.endsWith('/' + name.toLowerCase()));
  const hasExt = (ext) => fileNames.some(f => f.endsWith(ext.toLowerCase()));

  if (hasFile('package.json')) {
    inferences.push('Node.js application');
    if (!detectedSkills.includes('Node.js')) detectedSkills.push('Node.js');
  }
  if (hasFile('requirements.txt') || hasFile('setup.py') || hasFile('pyproject.toml') || hasFile('Pipfile')) {
    inferences.push('Python application');
    if (!detectedSkills.includes('Python')) detectedSkills.push('Python');
  }
  if (hasFile('Cargo.toml')) {
    inferences.push('Rust project');
    if (!detectedSkills.includes('Rust')) detectedSkills.push('Rust');
  }
  if (hasFile('go.mod')) {
    inferences.push('Go application');
    if (!detectedSkills.includes('Go')) detectedSkills.push('Go');
  }
  if (hasFile('pom.xml') || hasFile('build.gradle') || hasFile('build.gradle.kts')) {
    inferences.push('Java application');
    if (!detectedSkills.includes('Java')) detectedSkills.push('Java');
  }
  if (hasFile('pubspec.yaml')) {
    inferences.push('Flutter mobile application');
    if (!detectedSkills.includes('Flutter')) detectedSkills.push('Flutter');
    if (!detectedSkills.includes('Dart')) detectedSkills.push('Dart');
  }
  if (hasExt('.sln') || hasExt('.csproj')) {
    inferences.push('.NET / C# application');
    if (!detectedSkills.includes('C#')) detectedSkills.push('C#');
  }
  if (hasFile('Dockerfile') || hasFile('docker-compose.yml') || hasFile('docker-compose.yaml')) {
    if (!detectedSkills.includes('Docker')) detectedSkills.push('Docker');
  }
  if (hasFile('index.html') && !inferences.length) {
    inferences.push('Front-end web project');
  }

  let inferredDesc = '';
  if (inferences.length > 0) {
    const mainType = inferences[0];
    const lang = primaryLanguage ? ` built with ${primaryLanguage}` : '';
    const container = detectedSkills.includes('Docker') ? ' and containerized with Docker' : '';
    inferredDesc = `A modern ${mainType}${lang}${container}.`;
  } else if (primaryLanguage) {
    inferredDesc = `A software project developed primarily in ${primaryLanguage}.`;
  } else {
    inferredDesc = 'A repository containing source code and project assets.';
  }

  return { inferredDesc, detectedSkills };
}

/**
 * 3-Tier Smart Scanner for GitHub Repositories:
 * 1. Fetches repository core info (title, description, topics, homepage, language)
 * 2. Fetches languages breakdown (/languages)
 * 3. If description is sparse, inspects root contents / package.json to infer stack & description
 * 
 * @param {string} rawUrl 
 * @param {(status: string) => void} [onStatus] Optional callback for UI progress
 * @returns {Promise<{
 *   title: string,
 *   tag: string,
 *   description: string,
 *   skills: string[],
 *   demoUrl: string,
 *   githubUrl: string,
 *   isInferred: boolean
 * }>}
 */
export async function fetchGitHubRepoMetadata(rawUrl, onStatus = () => {}) {
  const parsed = parseGitHubRepoUrl(rawUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub repository URL.');
  }

  const { owner, repo } = parsed;
  const canonicalUrl = `https://github.com/${owner}/${repo}`;
  const headers = {
    'Accept': 'application/vnd.github+json',
  };

  onStatus('Fetching repository details...');

  // 1. Fetch main repo details
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) {
    if (repoRes.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" was not found (or is private).`);
    }
    if (repoRes.status === 403) {
      throw new Error('GitHub API rate limit reached. Please try again in a few minutes.');
    }
    throw new Error(`GitHub API returned status ${repoRes.status}`);
  }

  const repoData = await repoRes.json();

  // 2. Fetch language breakdown
  onStatus('Scanning languages & tech stack...');
  let languagesList = [];
  try {
    const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
    if (langRes.ok) {
      const langData = await langRes.json();
      // Sort languages by byte count descending
      languagesList = Object.keys(langData).slice(0, 5);
    }
  } catch (err) {
    console.warn('Could not fetch repo languages:', err);
  }

  let title = formatRepoName(repoData.name);
  let tag = repoData.language || (languagesList.length > 0 ? languagesList[0] : 'Software Project');
  let description = repoData.description ? repoData.description.trim() : '';
  let demoUrl = repoData.homepage ? repoData.homepage.trim() : '';
  
  // Combine topics (custom tags set on repo) and languages
  const rawTopics = Array.isArray(repoData.topics) ? repoData.topics : [];
  const normalizedTopics = rawTopics.map(t => {
    return formatRepoName(t);
  });

  const skillsSet = new Set([...normalizedTopics, ...languagesList]);
  let isInferred = false;

  // 3. Tier 3: If description is missing, inspect root contents or package.json
  if (!description) {
    onStatus('Analyzing file structure & dependencies...');
    isInferred = true;
    try {
      const contentsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, { headers });
      if (contentsRes.ok) {
        const contents = await contentsRes.json();
        if (Array.isArray(contents)) {
          // Check for package.json to read details
          const pkgFile = contents.find(f => f.name && f.name.toLowerCase() === 'package.json');
          if (pkgFile && pkgFile.download_url) {
            try {
              const pkgRes = await fetch(pkgFile.download_url);
              if (pkgRes.ok) {
                const pkgJson = await pkgRes.json();
                if (pkgJson.description && typeof pkgJson.description === 'string' && pkgJson.description.trim()) {
                  description = pkgJson.description.trim();
                }
                const pkgSkills = detectTechStackFromPackageJson(pkgJson);
                pkgSkills.forEach(s => skillsSet.add(s));
              }
            } catch (err) {
              console.warn('Could not parse package.json:', err);
            }
          }

          // If still no description, infer from directory files
          if (!description) {
            const { inferredDesc, detectedSkills } = inferFromContents(contents, repoData.language);
            description = inferredDesc;
            detectedSkills.forEach(s => skillsSet.add(s));
          }
        }
      }
    } catch (err) {
      console.warn('Could not inspect contents:', err);
    }
  }

  // Final fallback description if still empty
  if (!description) {
    description = repoData.language
      ? `A software engineering project built with ${repoData.language}.`
      : `An open-source repository on GitHub (${repoData.full_name}).`;
    isInferred = true;
  }

  // Format skills as unique array
  const skills = Array.from(skillsSet).filter(Boolean).slice(0, 8);

  return {
    title,
    tag,
    description,
    skills,
    demoUrl,
    githubUrl: canonicalUrl,
    isInferred,
  };
}
