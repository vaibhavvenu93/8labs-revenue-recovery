export function detectActiveDamage(
  message: string
): boolean | undefined {
  const text = message.toLowerCase();

  const activeSignals = [
    "water everywhere",
    "flooding",
    "currently leaking",
    "still leaking",
    "coming through the ceiling",
    "pouring",
    "gushing",
    "burst pipe"
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
