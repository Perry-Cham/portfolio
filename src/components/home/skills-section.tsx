'use client';
//This component uses framer motion to get an effect where the skills cards roll in
import { motion, Variants } from 'framer-motion';
import {
  Code,
  Layout,
  Wrench,
  Zap,
  PersonStanding,
} from 'lucide-react';

type SkillGroup = {
  icon: React.ReactNode;
  title: string;
  blurb: string;
  items: string[];
};

//Card Data
const groups: SkillGroup[] = [
  {
    icon: <Layout className="h-5 w-5" />,
    title: 'Frontend',
    blurb: 'Building accessible, responsive UIs with modern tooling.',
    items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'shadcn/ui'],
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: 'Realtime',
    blurb: 'Live experiences for collab and dashboards.',
    items: ['WebSockets', 'Socket.io', 'Server-Sent Events'],
  },
  {
    icon: <Wrench className="h-5 w-5" />,
    title: 'Tooling',
    blurb: 'DX and pipelines that keep teams unblocked.',
    items: ['Vite', 'ESLint', 'Vitest', 'Playwright', 'GitHub Actions'],
  },
  {
    icon: <PersonStanding className="h-5 w-5" />,
    title: 'Communication',
    blurb:
      'Getting and Delivering feedback is one of my values. I prefer to communicate regularly over projects',
    items: [],
  },
  {
    icon: <Code className="h-5 w-5" />,
    title: 'Languages',
    blurb: 'I pick whatever tool I need for the job',
    items: ['TypeScript', 'Dart'],
  },
];

// Animation variants for container and items
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Stagger effect between each card
    },
  },
};

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -80,        // Starts off-screen to the left
    rotate: -10    // Slight tilt for a "rolling" entry effect
  },
  visible: { 
    opacity: 1, 
    x: 0, 
    rotate: 0,     // Settles into place upright
    transition: { 
      type: 'spring', 
      damping: 20, 
      stiffness: 100 
    } 
  },
};

export function SkillsSection() {
  return (
    <section id="skills" className="py-20 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
            What I work with
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Skills & tools
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            I've spent the last few years broadening my horizons with different
            tools. These are the technologies I reach for daily — picked because
            they make me faster, the code clearer, and the product better, not
            because they happen to be trendy this week.
          </p>
        </div>

        {/* Animated Grid Container */}
        <motion.div 
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {groups.map((group) => (
            <motion.div
              key={group.title}
              variants={cardVariants}
              className="rounded-xl border border-border/60 bg-card p-6 transition-colors hover:border-border hover:shadow-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {group.icon}
                </span>
                <h3 className="text-lg font-semibold">{group.title}</h3>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                {group.blurb}
              </p>
              {group.items.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}