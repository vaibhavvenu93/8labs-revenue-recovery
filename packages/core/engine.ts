import {
  CustomerInput,
  RevenueLead
} from "./types";

import {
  qualifyPlumbingLead
} from "../qualification/plumber";

import {
  checkPlumbingSafety
} from "./safety";

import {
  detectActiveDamage
} from "./extract";

import {
  determineNextQuestion
} from "./next-question";


function now(): string {
  return new Date().toISOString();
}


export function createPlumbingLead(
  id: string,
  channel: RevenueLead["channel"] = "phone"
): RevenueLead {
  const timestamp = now();

  return {
    id,

    vertical: "plumber",
    channel,

    stage: "new",
    urgency: "unknown",

    customer: {},

    job: {},

    commercial: {
      score: 0,
      estimatedValueGBP: 0,
      revenueAtRiskGBP: 0
    },

    safety: {
      emergencyServicesRequired: false
    },

    conversation: {
      messages: [],
      nextQuestion:
        "What problem are you experiencing?"
    },

    action: "continue",

    createdAt: timestamp,
    updatedAt: timestamp
  };
}


export function processPlumbingMessage(
  currentLead: RevenueLead,
  input: CustomerInput
): RevenueLead {
  const lead: RevenueLead =
    structuredClone(currentLead);

  const timestamp = now();

  lead.updatedAt = timestamp;

  lead.conversation.messages.push({
    role: "customer",
    text: input.message,
    timestamp
  });

  if (input.name) {
    lead.customer.name = input.name;
  }

  if (input.phone) {
    lead.customer.phone = input.phone;
  }

  if (input.email) {
    lead.customer.email = input.email;
  }

  if (input.postcode) {
    lead.customer.postcode = input.postcode;
  }

  if (input.preferredTime) {
    lead.job.preferredTime =
      input.preferredTime;
  }

  if (!lead.job.problem) {
    lead.job.problem = input.message;
  }

  const activeDamage =
    detectActiveDamage(input.message);

  if (activeDamage !== undefined) {
    lead.job.activeDamage =
      activeDamage;
  }

  // ------------------------------------------------
  // SAFETY OVERRIDES EVERYTHING
  // ------------------------------------------------

  const safety =
    checkPlumbingSafety(input.message);

  if (safety.emergencyServicesRequired) {
    lead.safety = safety;

    lead.stage = "escalated";
    lead.urgency = "emergency";
    lead.action = "emergency_services";

    lead.commercial.score = 100;

    lead.conversation.nextQuestion =
      undefined;

    return lead;
  }

  // ------------------------------------------------
  // COMMERCIAL QUALIFICATION
  // ------------------------------------------------

  const qualification =
    qualifyPlumbingLead(
      [
        lead.job.problem ?? "",
        input.message
      ].join(" "),
      lead.customer.postcode,
      lead.customer.phone,
      {
        activeDamage:
          lead.job.activeDamage
      }
    );

  lead.urgency =
    qualification.urgency;

  lead.commercial.score =
    qualification.score;

  lead.commercial.estimatedValueGBP =
    qualification.estimatedValueGBP ?? 0;

  lead.commercial.revenueAtRiskGBP =
    qualification.estimatedValueGBP ?? 0;

  // ------------------------------------------------
  // DETERMINE NEXT QUESTION
  // ------------------------------------------------

  lead.conversation.nextQuestion =
    determineNextQuestion(lead);

  if (lead.conversation.nextQuestion) {
    lead.stage = "qualifying";

    if (
      qualification.recommendedAction ===
      "call_now"
    ) {
      lead.action = "call_now";
    } else {
      lead.action = "continue";
    }

    return lead;
  }

  // ------------------------------------------------
  // LEAD IS COMPLETE
  // ------------------------------------------------

  lead.stage = "ready_to_book";

  lead.action =
    qualification.recommendedAction ===
    "call_now"
      ? "call_now"
      : "book";

  return lead;
}

