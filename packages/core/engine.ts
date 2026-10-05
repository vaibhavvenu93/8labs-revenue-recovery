import {
  CustomerInput,
  RevenueLead,
  Urgency
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

const urgencyRank: Record<Urgency, number> = {
  unknown: 0,
  routine: 1,
  urgent: 2,
  emergency: 3
};

function strongestUrgency(
  current: Urgency,
  candidate: Urgency
): Urgency {
  return urgencyRank[candidate] >
    urgencyRank[current]
    ? candidate
    : current;
}

function accumulatedCustomerText(
  lead: RevenueLead
): string {
  return lead.conversation.messages
    .filter(
      (message) =>
        message.role === "customer"
    )
    .map((message) => message.text)
    .join(" ");
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

  const extractedActiveDamage =
    detectActiveDamage(input.message);

  if (
    extractedActiveDamage !== undefined
  ) {
    lead.job.activeDamage =
      extractedActiveDamage;
  }

  const conversationText =
    accumulatedCustomerText(lead);

  const safety =
    checkPlumbingSafety(conversationText);

  if (
    safety.emergencyServicesRequired
  ) {
    lead.safety = safety;

    lead.stage = "escalated";

    lead.urgency = "emergency";

    lead.action =
      "emergency_services";

    lead.commercial.score = 100;

    lead.commercial.estimatedValueGBP =
      Math.max(
        lead.commercial
          .estimatedValueGBP,
        300
      );

    lead.commercial.revenueAtRiskGBP =
      Math.max(
        lead.commercial
          .revenueAtRiskGBP,
        300
      );

    lead.conversation.nextQuestion =
      undefined;

    return lead;
  }

  const qualification =
    qualifyPlumbingLead(
      conversationText,
      lead.customer.postcode,
      lead.customer.phone,
      {
        activeDamage:
          lead.job.activeDamage
      }
    );

  const resolvedUrgency =
    strongestUrgency(
      lead.urgency,
      qualification.urgency
    );

  lead.urgency = resolvedUrgency;

  lead.commercial.score =
    Math.max(
      lead.commercial.score,
      qualification.score
    );

  lead.commercial.estimatedValueGBP =
    Math.max(
      lead.commercial
        .estimatedValueGBP,
      qualification
        .estimatedValueGBP ?? 0
    );

  lead.commercial.revenueAtRiskGBP =
    Math.max(
      lead.commercial
        .revenueAtRiskGBP,
      qualification
        .estimatedValueGBP ?? 0
    );

  lead.conversation.nextQuestion =
    determineNextQuestion(lead);

  if (
    lead.conversation.nextQuestion
  ) {
    lead.stage = "qualifying";

    if (
      lead.urgency === "emergency"
    ) {
      lead.action = "call_now";
    } else {
      lead.action = "continue";
    }

    return lead;
  }

  lead.stage = "ready_to_book";

  lead.action =
    lead.urgency === "emergency"
      ? "call_now"
      : "book";

  return lead;
}
