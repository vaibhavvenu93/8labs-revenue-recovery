export type LeadUrgency =
  | "emergency"
  | "urgent"
  | "routine"
  | "unknown";

export type LeadAction =
  | "continue"
  | "call_now"
  | "book"
  | "follow_up"
  | "emergency_services"
  | "human_review";

export type LeadStage =
  | "new"
  | "discovering"
  | "qualifying"
  | "qualified"
  | "ready_to_book"
  | "escalated"
  | "booked"
  | "lost";

export interface DashboardLead {
  id: string;

  vertical:
    | "plumber"
    | "roofer"
    | "garage";

  channel:
    | "phone"
    | "web"
    | "whatsapp"
    | "email";

  stage: LeadStage;
  urgency: LeadUrgency;

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
    messages: Array<{
      role: "customer" | "agent";
      text: string;
      timestamp: string;
    }>;

    nextQuestion?: string;
  };

  action: LeadAction;

  createdAt: string;
  updatedAt: string;
}
