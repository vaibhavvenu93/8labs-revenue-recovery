import type {
  CustomerInput,
  RevenueLead
} from "../../../../packages/core/types";

function extractPostcode(
  message: string
): string | undefined {
  const match = message.match(
    /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i
  );

  return match?.[0]
    ?.toUpperCase()
    .replace(
      /([A-Z0-9]+)(\d[A-Z]{2})$/,
      "$1 $2"
    );
}

function extractPhone(
  message: string
): string | undefined {
  const compact =
    message.replace(
      /[\s()-]/g,
      ""
    );

  const match = compact.match(
    /(?:\+44|0)7\d{9}\b/
  );

  return match?.[0];
}

function extractPreferredTime(
  message: string
): string | undefined {
  const text =
    message.toLowerCase();

  const signals = [
    "today",
    "tonight",
    "tomorrow morning",
    "tomorrow afternoon",
    "tomorrow evening",
    "tomorrow",
    "this morning",
    "this afternoon",
    "this evening",
    "morning",
    "afternoon",
    "evening",
    "as soon as possible",
    "asap"
  ];

  return signals.find(
    (signal) =>
      text.includes(signal)
  );
}

function extractName(
  message: string
): string | undefined {
  const patterns = [
    /\bmy name is\s+([a-z][a-z'-]*)/i,
    /\bi am\s+([a-z][a-z'-]*)\b/i,
    /\bi'm\s+([a-z][a-z'-]*)\b/i
  ];

  for (const pattern of patterns) {
    const match =
      message.match(pattern);

    if (match?.[1]) {
      const value = match[1];

      const rejected = [
        "in",
        "at",
        "having",
        "looking",
        "calling"
      ];

      if (
        !rejected.includes(
          value.toLowerCase()
        )
      ) {
        return (
          value.charAt(0).toUpperCase() +
          value.slice(1)
        );
      }
    }
  }

  return undefined;
}

export function adaptWebMessage(
  lead: RevenueLead,
  message: string
): CustomerInput {
  return {
    message,

    postcode:
      lead.customer.postcode ??
      extractPostcode(message),

    phone:
      lead.customer.phone ??
      extractPhone(message),

    name:
      lead.customer.name ??
      extractName(message),

    preferredTime:
      lead.job.preferredTime ??
      extractPreferredTime(message)
  };
}

