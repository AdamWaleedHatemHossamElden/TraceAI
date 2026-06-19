import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '◎',
    title: 'Claim Extraction',
    description:
      'The AI service automatically separates an AI-generated answer into individual factual claims, filtering out opinions and non-verifiable statements.',
  },
  {
    icon: '◈',
    title: 'Evidence Retrieval',
    description:
      'Semantic search locates the most relevant passages from your uploaded PDF and text documents for each extracted claim.',
  },
  {
    icon: '◉',
    title: 'Automated Classification',
    description:
      'Each claim is classified as supported, partially supported, contradicted, or unverifiable, with a confidence score.',
  },
  {
    icon: '⬡',
    title: 'Human Review',
    description:
      'Reviewers inspect the evidence and correct automated assessments, creating a transparent audit trail and high-quality evaluation data.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Submit the AI response',
    description:
      'Paste the original prompt, AI-generated answer, model name, and topic into TraceAI.',
  },
  {
    number: '02',
    title: 'Upload evidence documents',
    description:
      'Upload one or more PDF or plain-text files to use as the verification source.',
  },
  {
    number: '03',
    title: 'Review the analysis',
    description:
      'TraceAI extracts claims, retrieves evidence passages, and classifies each claim automatically.',
  },
  {
    number: '04',
    title: 'Confirm or correct',
    description:
      'Human reviewers validate the results and record corrections, building a transparent audit record.',
  },
];

const TECH = [
  { label: 'React', category: 'Frontend' },
  { label: 'TypeScript', category: 'Frontend' },
  { label: 'Vite', category: 'Frontend' },
  { label: 'Node.js', category: 'Backend' },
  { label: 'Express', category: 'Backend' },
  { label: 'MySQL', category: 'Database' },
  { label: 'Python', category: 'AI Service' },
  { label: 'FastAPI', category: 'AI Service' },
  { label: 'Docker', category: 'Infrastructure' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Navbar isPublic />

      {/* ═══════════════════════════════════════════════════════ HERO */}
      <section className={styles.hero}>
        <div className={[styles.heroInner, 'container'].join(' ')}>
          <Badge variant="info">Phase 1 — Foundation</Badge>

          <h1 className={styles.heroHeadline}>
            Verify AI answers
            <br />
            <span className={styles.heroAccent}>with evidence</span>
          </h1>

          <p className={styles.heroSub}>
            TraceAI is a human-in-the-loop platform that extracts factual claims
            from AI-generated responses, retrieves supporting evidence, and
            classifies each claim's reliability — letting human reviewers confirm
            or correct the result.
          </p>

          <div className={styles.heroCta}>
            <Button size="lg" onClick={() => navigate('/register')}>
              Get started free
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
              Sign in
            </Button>
          </div>
        </div>

        {/* Decorative grid */}
        <div className={styles.heroGrid} aria-hidden="true" />
      </section>

      {/* ═══════════════════════════════════════════════════════ PROBLEM */}
      <section className={styles.problem}>
        <div className={['container', styles.problemInner].join(' ')}>
          <div className={styles.problemText}>
            <p className={styles.eyebrow}>The problem</p>
            <h2 className={styles.sectionTitle}>
              AI systems produce fluent answers that can be wrong
            </h2>
            <p className={styles.sectionBody}>
              Large language models generate confident-sounding statements that
              may be inaccurate, unsupported, contradictory, or outdated. Because
              the errors are fluent and confident, they are difficult to detect
              without comparing the claims to actual evidence.
            </p>
            <p className={styles.sectionBody}>
              TraceAI makes that comparison systematic and transparent — at the
              level of individual claims rather than the response as a whole.
            </p>
          </div>
          <div className={styles.problemStats}>
            {[
              { value: 'Claim-level', label: 'Granularity of verification' },
              { value: 'Evidence-backed', label: 'Every result is sourced' },
              { value: 'Human-in-loop', label: 'Reviewers correct the AI' },
            ].map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ FEATURES */}
      <section id="features" className={styles.features}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>What TraceAI does</p>
            <h2 className={styles.sectionTitle}>
              End-to-end AI response verification
            </h2>
            <p className={styles.sectionIntro}>
              Four tightly integrated steps take an AI-generated answer from raw
              text to a fully verified, human-reviewed reliability report.
            </p>
          </div>

          <div className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ HOW IT WORKS */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>How it works</p>
            <h2 className={styles.sectionTitle}>
              Four steps from answer to verified result
            </h2>
          </div>

          <div className={styles.steps}>
            {STEPS.map((step, i) => (
              <div key={step.number} className={styles.step}>
                <div className={styles.stepLeft}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  {i < STEPS.length - 1 && (
                    <span className={styles.stepLine} aria-hidden="true" />
                  )}
                </div>
                <div className={styles.stepContent}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ TECHNOLOGY */}
      <section id="technology" className={styles.technology}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.eyebrow}>Technology</p>
            <h2 className={styles.sectionTitle}>Built on a modern stack</h2>
            <p className={styles.sectionIntro}>
              Every layer is chosen for reliability, maintainability, and clear
              separation of concerns between the frontend, API, AI service, and
              database.
            </p>
          </div>

          <div className={styles.techGrid}>
            {TECH.map((t) => (
              <div key={t.label} className={styles.techChip}>
                <span className={styles.techLabel}>{t.label}</span>
                <span className={styles.techCategory}>{t.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ CTA */}
      <section className={styles.cta}>
        <div className={['container', styles.ctaInner].join(' ')}>
          <h2 className={styles.ctaTitle}>
            Ready to verify your first AI answer?
          </h2>
          <p className={styles.ctaBody}>
            Create an account to start uploading evidence documents and
            submitting AI responses for claim-level verification.
          </p>
          <div className={styles.ctaButtons}>
            <Button size="lg" onClick={() => navigate('/register')}>
              Create account
            </Button>
            <Button variant="ghost" size="lg" onClick={() => navigate('/login')}>
              Sign in instead
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ FOOTER */}
      <footer className={styles.footer}>
        <div className={['container', styles.footerInner].join(' ')}>
          <div className={styles.footerLogo}>
            <span className={styles.footerLogoMark}>⬡</span>
            <span className={styles.footerLogoText}>TraceAI</span>
          </div>
          <p className={styles.footerNote}>
            A human-in-the-loop platform for claim-level AI verification. Phase 1 foundation.
          </p>
        </div>
      </footer>
    </div>
  );
}
