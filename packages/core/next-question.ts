import { RevenueLead } from "./types";

export function determineNextQuestion(
  lead: RevenueLead
): string | undefined {
  if (!lead.job.problem) {
    return "What problem are you experiencing?";
  }

  if (!lead.customer.postcode) {
    return "What is the postcode where you need help?";
  }

  if (
    lead.job.activeDamage === undefined &&
    lead.vertical === "plumber"
  ) {
    return "Is water currently leaking or causing damage?";
  }

  if (!lead.customer.phone) {
    return "What is the best phone number to reach you on?";
  }

  if (!lead.customer.name) {
    return "What name should I put this enquiry under?";
  }

  if (!lead.job.preferredTime) {
    return "When would you like someone to attend?";
  }

  return undefined;
}
