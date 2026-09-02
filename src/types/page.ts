import type {
  AuditedDocument,
  DisplayOrdered,
  Publishable,
  SeoFields,
} from "./common";

export type ManagedPageId = "home" | "about" | "contact";

interface ManagedPageBase<TId extends ManagedPageId>
  extends AuditedDocument,
    Publishable,
    SeoFields {
  id: TId;
  title: string;
}

export interface PageImage {
  imageUrl: string;
  imagePublicId?: string;
  imageAlt: string;
}

export interface PageFeature extends DisplayOrdered {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface ProcessStep extends DisplayOrdered {
  id: string;
  title: string;
  description: string;
}

export interface TeamMember extends DisplayOrdered, PageImage {
  id: string;
  name: string;
  role: string;
  bio?: string;
}

export interface AwardOrCertification extends DisplayOrdered, PageImage {
  id: string;
  title: string;
  issuer?: string;
  year?: string;
  description?: string;
}

export interface CallToAction {
  heading: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}

export interface HomePageDocument extends ManagedPageBase<"home"> {
  introductionHeading: string;
  introductionBody: string;
  introductionImage?: PageImage;
  whyChooseHeading: string;
  whyChooseItems: PageFeature[];
  processHeading: string;
  processSteps: ProcessStep[];
  contactCallToAction: CallToAction;
}

export interface AboutPageDocument extends ManagedPageBase<"about"> {
  introduction: string;
  heroImage?: PageImage;
  mission: string;
  vision: string;
  experience: string;
  teamHeading: string;
  teamMembers: TeamMember[];
  processHeading: string;
  processSteps: ProcessStep[];
  whyChooseHeading: string;
  whyChooseItems: PageFeature[];
  awardsHeading: string;
  awards: AwardOrCertification[];
  contactCallToAction: CallToAction;
}

export interface ContactPageDocument extends ManagedPageBase<"contact"> {
  heading: string;
  introduction: string;
  formHeading: string;
  mapHeading: string;
}

export type ManagedPageDocument =
  | HomePageDocument
  | AboutPageDocument
  | ContactPageDocument;
