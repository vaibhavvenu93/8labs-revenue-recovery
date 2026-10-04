export type Vertical =
  | "plumber"
  | "roofer"
  | "garage";

export type Channel =
  | "phone"
  | "web"
  | "whatsapp"
  | "email";

export type LeadStage =
  | "new"
  | "discovering"
  | "qualifying"
  | "qualified"
  | "ready_to_book"
  | "escalated"
  | "booked"
  | "lost";

export type Urgency =
  | "emergency"
  | "urgent"
  | "routine"
  | "unknown";

export type RevenueAction =
  | "continue"
  | "call_now"
  | "book"
  | "follow_up"
  | "emergency_services"
  | "human_review";

export interface RevenueLead {
  id: string;

  vertical: Vertical;
  channel: Channel;

  stage: LeadStage;
  urgency: Urgency;

  customer: {
    name?: string;
    phone?: string;
    email?: string;
    postcode?: string;
  };

  job: {
    problem?: string;
    activeDamage?: boolean;
    preferredTime?: string;
  };

  commercial: {
    score: number;
    estimatedValueGBP: number;
    revenueAtRiskGBP: number;
  };

  safety: {
    emergencyServicesRequired: boolean;
    reason?: string;
  };

  conversation: {
    messages: ConversationMessage[];
    nextQuestion?: string;
  };

  action: RevenueAction;

  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  role: "customer" | "agent";
  text: string;
  timestamp: string;
}

export interface CustomerInput {
  message: string;

  name?: string;
  phone?: string;
  email?: string;
  postcode?: string;

  preferredTime?: string;
}
