import type {
  AboutPageDocument,
  CallToAction,
  PageFeature,
  ProcessStep,
  TeamMember,
} from "@/types/page";

interface HomeFallbackContent {
  introductionHeading: string;
  introductionBody: string;
  whyChooseHeading: string;
  whyChooseItems: readonly PageFeature[];
  processHeading: string;
  processSteps: readonly ProcessStep[];
  contactCallToAction: CallToAction;
}

export const DEFAULT_WHY_CHOOSE_ITEMS: readonly PageFeature[] = [
  {
    id: "connected-thinking",
    title: "Connected thinking",
    description:
      "Architecture, interior design, and planning are considered as parts of one coherent whole.",
    displayOrder: 1,
  },
  {
    id: "clear-process",
    title: "A clear process",
    description:
      "Each stage moves from the brief and concept through planning, detail, and delivery.",
    displayOrder: 2,
  },
  {
    id: "purposeful-design",
    title: "Purposeful design",
    description:
      "Decisions are guided by use, context, proportion, and long-term value.",
    displayOrder: 3,
  },
];

export const DEFAULT_PROCESS_STEPS: readonly ProcessStep[] = [
  {
    id: "discover",
    title: "Discover",
    description: "Understand the brief, priorities, site, and practical needs.",
    displayOrder: 1,
  },
  {
    id: "define",
    title: "Define",
    description: "Organize the requirements into a clear spatial direction.",
    displayOrder: 2,
  },
  {
    id: "design",
    title: "Design",
    description: "Develop the architecture, interiors, and planning in detail.",
    displayOrder: 3,
  },
  {
    id: "refine",
    title: "Refine",
    description: "Resolve decisions and prepare the project for its next stage.",
    displayOrder: 4,
  },
];

export const DEFAULT_CONTACT_CTA: Readonly<CallToAction> = Object.freeze({
  heading: "Planning a space or project?",
  description:
    "Share what you are considering, and start a focused conversation with SKETCHPLAN.",
  buttonText: "Discuss your project",
  buttonUrl: "/contact/",
});

export const DEFAULT_HOME_CONTENT: Readonly<HomeFallbackContent> =
  Object.freeze({
    introductionHeading: "Designing spaces with clarity and purpose",
    introductionBody:
      "SKETCHPLAN brings architecture, interior design, and planning into one connected design process—balancing how a place works, feels, and belongs to its context.",
    whyChooseHeading: "Why choose SKETCHPLAN",
    whyChooseItems: DEFAULT_WHY_CHOOSE_ITEMS,
    processHeading: "A considered working process",
    processSteps: DEFAULT_PROCESS_STEPS,
    contactCallToAction: DEFAULT_CONTACT_CTA,
  });

export interface AboutFallbackContent {
  introduction: string;
  mission: string;
  vision: string;
  experience: string;
  teamHeading: string;
  teamMembers: readonly TeamMember[];
  processHeading: string;
  processSteps: readonly ProcessStep[];
  whyChooseHeading: string;
  whyChooseItems: readonly PageFeature[];
  awardsHeading: string;
  awards: AboutPageDocument["awards"];
  contactCallToAction: CallToAction;
}

export const DEFAULT_ABOUT_CONTENT: Readonly<AboutFallbackContent> =
  Object.freeze({
    introduction:
      "SKETCHPLAN is an architecture, interior design, and planning practice. The studio approaches buildings and spaces as connected environments shaped by use, context, and thoughtful detail.",
    mission:
      "To turn clear briefs and real needs into purposeful architecture, interiors, and plans.",
    vision:
      "To create considered spaces where function, character, and long-term relevance belong together.",
    experience:
      "A multidisciplinary point of view brings architectural, engineering, interior, and planning considerations into the same conversation.",
    teamHeading: "Studio contacts",
    teamMembers: [
      {
        id: "biswanath-das",
        name: "Ar. Biswanath Das",
        role: "Studio contact",
        imageUrl: "",
        imageAlt: "",
        displayOrder: 1,
      },
      {
        id: "partha-sarothi-podder",
        name: "Er. Partha Sarothi Podder",
        role: "Studio contact",
        imageUrl: "",
        imageAlt: "",
        displayOrder: 2,
      },
      {
        id: "pablu-saha",
        name: "Er. Pablu Saha",
        role: "Studio contact",
        imageUrl: "",
        imageAlt: "",
        displayOrder: 3,
      },
    ],
    processHeading: "How the work moves forward",
    processSteps: DEFAULT_PROCESS_STEPS,
    whyChooseHeading: "A joined-up design approach",
    whyChooseItems: DEFAULT_WHY_CHOOSE_ITEMS,
    awardsHeading: "Awards & certifications",
    awards: [],
    contactCallToAction: DEFAULT_CONTACT_CTA,
  });
