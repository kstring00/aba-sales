import type { ShelfId } from "@/lib/shelves";

/**
 * Editorial content for the shelf drawer that is NOT inventory: the lead
 * line, the "you'll be able to…" checklist, the one built-in tool, and the
 * items being made. Live products always come from Shopify and render
 * first; these fill a drawer so no shelf is ever empty. Coming-soon items
 * have no price and no checkout; their button leads to the shelf page,
 * where the item is named and an email can be left.
 */
export type DrawerIcon = "folder" | "cal" | "sun" | "people" | "doc" | "clip" | "files" | "map" | "flag" | "list" | "home" | "heart" | "clock";

export type ComingSoonItem = { title: string; blurb: string; icon: DrawerIcon };

export type ShelfContent = {
  lead: string;
  checks: [string, string, string, string];
  /** A built-in free tool shown as an "Available now" card. */
  tool: { title: string; blurb: string; href: string; cta: string; icon: DrawerIcon } | null;
  comingSoon: ComingSoonItem[];
};

export const SHELF_CONTENT: Record<ShelfId, ShelfContent> = {
  organized: {
    lead: "Keep the information you need in one place, so you can spend less time searching for it.",
    checks: ["Organize important information", "Keep track of appointments", "Find helpful templates and trackers", "Feel more prepared for meetings"],
    tool: {
      title: "ABC Tracker",
      blurb: "Track what happened before, during, and after a behavior so you can spot patterns and share observations with your BCBA.",
      href: "/abc",
      cta: "Open ABC Tracker",
      icon: "clip",
    },
    comingSoon: [
      { title: "Appointment Notes", blurb: "Take organized notes and prepare for your next appointment.", icon: "cal" },
      { title: "Important Documents", blurb: "A simple guide to the documents you may need and how to keep them organized.", icon: "files" },
    ],
  },
  plan: {
    lead: "Know what usually comes next, so each step feels less like a surprise and more like a plan.",
    checks: ["See what to expect after a diagnosis", "Prepare for IEP and ARD meetings", "Set goals you can actually track", "Plan the next transition early"],
    tool: null,
    comingSoon: [
      { title: "Next Steps Roadmap", blurb: "A plain-language map of what typically happens after a diagnosis and who to call first.", icon: "map" },
      { title: "IEP Meeting Prep", blurb: "Questions to ask, what to bring, and a one-page summary you can hand to the team.", icon: "clip" },
      { title: "Goal Planner", blurb: "Break a big goal into small, countable steps you can celebrate at home.", icon: "flag" },
      { title: "Transition Checklist", blurb: "Everything to line up before a new school, new teacher, or new routine.", icon: "list" },
    ],
  },
  everyday: {
    lead: "Simple, practical tools for the moments that happen every single day.",
    checks: ["Smoother mornings and bedtimes", "Fewer surprises at mealtime", "Outings that go better", "Visual tools your child understands"],
    tool: null,
    comingSoon: [
      { title: "Visual Schedules", blurb: "Printable picture schedules for the routines your child does every day.", icon: "cal" },
      { title: "Morning & Bedtime Routines", blurb: "Step-by-step routine cards that make transitions predictable.", icon: "clock" },
      { title: "Mealtime Helpers", blurb: "Gentle strategies for picky eating and calmer family dinners.", icon: "sun" },
      { title: "Outings Toolkit", blurb: "A grab-and-go kit for the grocery store, the doctor, and family trips.", icon: "map" },
    ],
  },
  home: {
    lead: "Tools for you, your child, and your whole family, because support works best when everyone has some.",
    checks: ["Take care of yourself, too", "Help siblings understand", "Build a calm-down space", "Keep the whole family on the same page"],
    tool: null,
    comingSoon: [
      { title: "Parent Care Guide", blurb: "Small, realistic ways to refill your own tank on hard weeks.", icon: "heart" },
      { title: "Sibling Support", blurb: "Conversation starters and activities so brothers and sisters feel included.", icon: "people" },
      { title: "Calm-Down Corner Kit", blurb: "How to set up a safe, low-cost calming space at home.", icon: "home" },
      { title: "Family Communication Board", blurb: "A shared board so everyone knows the plan for the day.", icon: "list" },
    ],
  },
};
