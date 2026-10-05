export function detectActiveDamage(
  message: string
): boolean | undefined {
  const text = message.toLowerCase();

  const negativeSignals = [
    "no active leak",
    "not leaking",
    "isn't leaking",
    "is not leaking",
    "stopped leaking",
    "leak has stopped",
    "no water leaking",
    "no flooding"
  ];

  if (
    negativeSignals.some((signal) =>
      text.includes(signal)
    )
  ) {
    return false;
  }

  const activeSignals = [
    "water everywhere",
    "flooding",
    "flooded",
    "currently leaking",
    "still leaking",
    "coming through the ceiling",
    "water coming through",
    "pouring",
    "gushing",
    "burst pipe",
    "pipe has burst",
    "pipe burst"
  ];

  if (
    activeSignals.some((signal) =>
      text.includes(signal)
    )
  ) {
    return true;
  }

  return undefined;
}
