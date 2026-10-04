export interface SafetyResult {
  emergencyServicesRequired: boolean;
  reason?: string;
}

const GAS_SIGNALS = [
  "gas smell",
  "smell gas",
  "smells like gas",
  "gas leak",
  "carbon monoxide",
  "co alarm",
  "carbon monoxide alarm"
];

export function checkPlumbingSafety(
  message: string
): SafetyResult {
  const text = message.toLowerCase();

  const gasEmergency = GAS_SIGNALS.some((signal) =>
    text.includes(signal)
  );

  if (gasEmergency) {
    return {
      emergencyServicesRequired: true,
      reason:
        "Potential gas or carbon monoxide emergency detected."
    };
  }

  return {
    emergencyServicesRequired: false
  };
}
