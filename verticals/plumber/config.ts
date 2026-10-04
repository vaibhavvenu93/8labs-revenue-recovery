export const plumberConfig = {
  id: "plumber",

  name: "Plumbing & Heating",

  promise:
    "Never lose a plumbing job because you could not answer the phone.",

  requiredFields: [
    "name",
    "phone",
    "postcode",
    "problem",
    "urgency"
  ],

  emergencySignals: [
    "burst pipe",
    "pipe burst",
    "pipe has burst",
    "pipe's burst",
    "flooding",
    "flooded",
    "water everywhere",
    "water coming through",
    "coming through the ceiling",
    "ceiling leaking",
    "major leak",
    "gushing water",
    "water gushing",
    "no water",
    "gas smell",
    "smell gas",
    "gas leak",
    "carbon monoxide",
    "co alarm"
  ],

  urgentSignals: [
    "leaking",
    "leak",
    "boiler broken",
    "boiler stopped",
    "boiler isn't working",
    "boiler not working",
    "no heating",
    "no hot water",
    "blocked toilet",
    "blocked drain",
    "radiator leaking"
  ],

  prohibitedTopics: [
    "medical advice",
    "gas safety diagnosis",
    "electrical safety diagnosis"
  ],

  questions: [
    "What problem are you experiencing?",
    "What is your postcode?",
    "Is water currently leaking or causing damage?",
    "Is this affecting your heating, hot water, or water supply?",
    "When would you like someone to attend?",
    "What is the best number to reach you on?"
  ],

  escalation: {
    gasSmell: "emergency_services",
    carbonMonoxide: "emergency_services",
    activeFlooding: "call_now"
  },

  valueBands: {
    emergency: 300,
    urgent: 180,
    routine: 120
  }
} as const;
