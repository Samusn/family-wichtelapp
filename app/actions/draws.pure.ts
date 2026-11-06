export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function isUniqueViolation(err: unknown) {
  const cause = err instanceof Error ? err.cause : undefined;
  return (
    typeof cause === "object" &&
    cause !== null &&
    "code" in cause &&
    cause.code === "23505"
  );
}

export function isValidAssignment(
  givers: { id: string }[],
  receivers: { id: string }[],
) {
  const giverIds = new Set(givers.map((giver) => giver.id));
  const receiverIds = new Set(receivers.map((receiver) => receiver.id));

  return (
    givers.length === receivers.length &&
    giverIds.size === givers.length &&
    receiverIds.size === receivers.length &&
    receivers.every((receiver) => giverIds.has(receiver.id)) &&
    givers.every((giver, i) => giver.id !== receivers[i].id)
  );
}
