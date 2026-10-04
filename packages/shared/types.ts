export type UrgencyLevel =
  | "emergency"
  | "urgent"
  | "routine"
  | "unknown";

export type LeadStatus =
  | "new"
  | "qualifying"
  | "qualified"
  | "needs_human"
  | "booked"
  | "lost";

export interface Customer {
  name?: string;
  phone?: string;
  email?: string;
  postcode?: string;
}

export interface Enquiry {
  id: string;
  vertical: string;
  source: "phone" | "web" | "whatsapp" | "email";
  message: string;
  customer: Customer;
  createdAt: string;
}

export interface QualificationResult {
  urgency: UrgencyLevel;
  score: number;
  estimatedValueGBP?: number;

  requiredQuestions: readonly string[];
  missingInformation: string[];

  recommendedAction:
    | "dispatch"
    | "call_now"
    | "book"
    | "follow_up"
    | "human_review";

  reason: string;
}
