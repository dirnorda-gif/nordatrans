import { LucideIcon } from "lucide-react";
import { useState } from "react";

interface FlipCardProps {
  problem: {
    title: string;
    description: string;
    icon: LucideIcon;
  };
  solution: {
    title: string;
    description: string;
    icon: LucideIcon;
  };
}

export const FlipCard = ({ problem, solution }: FlipCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const ProblemIcon = problem.icon;
  const SolutionIcon = solution.icon;

  return (
    <div
      className="group h-[400px] w-full cursor-pointer perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative h-full w-full transition-transform duration-700 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front Side - Problem */}
        <div className="absolute inset-0 backface-hidden rounded-2xl bg-gradient-to-br from-problem-light to-problem-light/50 p-8 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-hover)] md:p-10">
          <div className="flex h-full flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-problem/10 px-4 py-2">
                  <ProblemIcon className="h-5 w-5 text-problem" />
                  <span className="text-sm font-semibold uppercase tracking-wide text-problem">
                    Проблема
                  </span>
                </div>
                <div className="rounded-full bg-problem/10 p-3">
                  <ProblemIcon className="h-8 w-8 text-problem" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-foreground">{problem.title}</h3>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {problem.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg
                className="h-5 w-5 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="hidden md:inline">Наведите для решения</span>
              <span className="md:hidden">Нажмите для решения</span>
            </div>
          </div>
        </div>

        {/* Back Side - Solution */}
        <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-2xl bg-gradient-to-br from-solution to-solution-light p-8 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-hover)] md:p-10">
          <div className="flex h-full flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                  <SolutionIcon className="h-5 w-5 text-white" />
                  <span className="text-sm font-semibold uppercase tracking-wide text-white">
                    Решение
                  </span>
                </div>
                <div className="rounded-full bg-white/20 p-3">
                  <SolutionIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-white">{solution.title}</h3>
                <p className="text-lg leading-relaxed text-white/90">
                  {solution.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium text-white/90">Гарантировано</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

