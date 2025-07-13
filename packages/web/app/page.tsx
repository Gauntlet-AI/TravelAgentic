import { redirect } from 'next/navigation';

/**
 * Root route redirect
 * The original VacationPlanner UI has been removed from the core workflow.
 * We keep the "/" route functional by forwarding visitors to the new
 * enhanced landing page instead.
 */
export default function Home() {
  // Server-side redirect to the new landing page
  redirect('/enhanced-home');
}
