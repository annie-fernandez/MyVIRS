import { PageSkeleton } from "./_components/page-skeleton";

/**
 * Every screen reads the session on the server, so every route is dynamic. With this file Next
 * switches screens as soon as a menu item is clicked, showing this until the screen is ready,
 * instead of leaving the old screen up while the server answers.
 */
export default function Loading() {
  return <PageSkeleton />;
}
