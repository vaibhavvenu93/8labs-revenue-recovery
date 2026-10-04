export type DemoLead = {
  urgency: "UNKNOWN" | "ROUTINE" | "URGENT" | "EMERGENCY";
  score: number;
  value: number;
  action: string;
  problem: string;
  postcode: string;
  phone: string;
  timing: string;
  nextQuestion: string;
  activeDamage: boolean;
};

export const initialLead: DemoLead = {
  urgency: "UNKNOWN",
  score: 0,
  value: 0,
  action: "LISTENING",
  problem: "Waiting for enquiry",
  postcode: "Missing",
  phone: "Missing",
  timing: "Missing",
  nextQuestion: "What problem are you experiencing?",
  activeDamage: false,
};

export function analyseDemoMessage(
  message: string,
  previous: DemoLead
): DemoLead {
  const text = message.toLowerCase();

  const gasEmergency =
    text.includes("smell gas") ||
    text.includes("gas smell") ||
    text.includes("gas leak") ||
    text.includes("carbon monoxide");

  if (gasEmergency) {
    return {
      ...previous,
      urgency: "EMERGENCY",
      score: 100,
      value: 300,
      action: "EMERGENCY ESCALATION",
      problem: message,
      nextQuestion: "Emergency safety escalation required.",
    };
  }

  const flooding =
    text.includes("burst") ||
    text.includes("flood") ||
    text.includes("water everywhere") ||
    text.includes("coming through the ceiling") ||
    text.includes("gushing");

  const urgent =
    flooding ||
    text.includes("no heating") ||
    text.includes("no hot water") ||
    text.includes("boiler") ||
    text.includes("blocked toilet") ||
    text.includes("blocked drain") ||
    text.includes("leak");

  const postcodeMatch = message.match(
    /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i
  );

  const phoneMatch = message.match(
    /(?:\+44\s?7\d{3}|07\d{3})\s?\d{3}\s?\d{3}/
  );

  const timing =
    text.includes("today")
      ? "Today"
      : text.includes("tomorrow")
        ? "Tomorrow"
        : text.includes("morning")
          ? "Morning"
          : text.includes("afternoon")
            ? "Afternoon"
            : previous.timing;

  const postcode =
    postcodeMatch?.[0]?.toUpperCase() ?? previous.postcode;

  const phone =
    phoneMatch?.[0] ?? previous.phone;

  let nextQuestion = "When would you like someone to attend?";

  if (postcode === "Missing") {
    nextQuestion = "What is the postcode where you need help?";
  } else if (phone === "Missing") {
    nextQuestion = "What is the best phone number to reach you on?";
  } else if (timing === "Missing") {
    nextQuestion = "When would you like someone to attend?";
  } else {
    nextQuestion = "I have everything I need. Shall I book this now?";
  }

  return {
    urgency: flooding ? "EMERGENCY" : urgent ? "URGENT" : "ROUTINE",
    score: flooding ? 100 : urgent ? 80 : 50,
    value: flooding ? 300 : urgent ? 180 : 120,
    action:
      flooding
        ? "CALL NOW"
        : postcode !== "Missing" &&
            phone !== "Missing" &&
            timing !== "Missing"
          ? "READY TO BOOK"
          : "QUALIFY",
    problem:
      previous.problem === "Waiting for enquiry"
        ? message
        : previous.problem,
    postcode,
    phone,
    timing,
    nextQuestion,
    activeDamage: flooding,
  };
}
