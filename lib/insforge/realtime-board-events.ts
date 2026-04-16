interface RealtimeTaskPayload {
  board_id?: string;
  meta?: {
    channel?: string;
  };
}

const toSafeRealtimeTaskPayload = (value: unknown): RealtimeTaskPayload | null => {
  if (!value || typeof value !== "object") return null;
  const payload = value as Record<string, unknown>;
  const board_id = typeof payload.board_id === "string" ? payload.board_id : undefined;
  const metaRaw = payload.meta;
  const meta =
    metaRaw && typeof metaRaw === "object" && typeof (metaRaw as Record<string, unknown>).channel === "string"
      ? { channel: (metaRaw as Record<string, string>).channel }
      : undefined;
  return { board_id, meta };
};

export const isRealtimePayloadForBoard = (payload: unknown, selectedBoardId: string, channelName: string) => {
  const safePayload = toSafeRealtimeTaskPayload(payload);
  const payloadBoardId = safePayload?.board_id;
  const payloadChannel = safePayload?.meta?.channel;

  return (
    payloadBoardId === selectedBoardId ||
    payloadChannel === channelName ||
    payloadChannel === `board:${selectedBoardId}`
  );
};
