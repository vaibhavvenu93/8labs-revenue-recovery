import { QualificationResult } from "../shared/types";
import { plumberConfig } from "../../verticals/plumber/config";

export interface PlumbingQualificationContext {
  activeDamage?: boolean;
}

export function qualifyPlumbingLead(
  message: string,
  postcode?: string,
  phone?: string,
  context: PlumbingQualificationContext = {}
): QualificationResult {
  const text = message.toLowerCase();

  const emergencySignal =
    plumberConfig.emergencySignals.some((signal) =>
      text.includes(signal)
    );

  const urgentSignal =
    plumberConfig.urgentSignals.some((signal) =>
      text.includes(signal)
    );

  const emergency =
    emergencySignal || context.activeDamage === true;

  const missingInformation: string[] = [];

  if (!postcode) {
    missingInformation.push("postcode");
  }

  if (!phone) {
    missingInformation.push("phone");
  }

  if (emergency) {
    return {
      urgency: "emergency",
      score: 100,
      estimatedValueGBP:
        plumberConfig.valueBands.emergency,
      requiredQuestions:
        plumberConfig.questions,
      missingInformation,
      recommendedAction: "call_now",
      reason:
        context.activeDamage === true
          ? "Active property damage or emergency plumbing signal detected."
          : "Emergency plumbing signal detected."
    };
  }

  if (urgentSignal) {
    return {
      urgency: "urgent",
      score: 80,
      estimatedValueGBP:
        plumberConfig.valueBands.urgent,
      requiredQuestions:
        plumberConfig.questions,
      missingInformation,
      recommendedAction:
        postcode && phone
          ? "book"
          : "follow_up",
      reason:
        "Urgent plumbing problem detected."
    };
  }

  return {
    urgency: "routine",
    score: 50,
    estimatedValueGBP:
      plumberConfig.valueBands.routine,
    requiredQuestions:
      plumberConfig.questions,
    missingInformation,
    recommendedAction:
      postcode && phone
        ? "book"
        : "follow_up",
    reason:
      "Routine plumbing enquiry."
  };
}
