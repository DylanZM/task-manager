import { useEffect } from "react";
import { getInsforgeClient } from "@/lib/insforge/client";
import { isRealtimePayloadForBoard } from "@/lib/insforge/realtime-board-events";
import { AuthUser } from "@/app/hooks/kanban/types";

type InsforgeClient = ReturnType<typeof getInsforgeClient>;

type Params = {
  insforge: InsforgeClient | null;
  user: AuthUser | null;
  selectedBoardId: string | null;
  loadTasks: (client: InsforgeClient, userId: string, boardId: string) => Promise<void>;
  setTaskError: (value: string) => void;
};

export const useBoardRealtimeSync = ({
  insforge,
  user,
  selectedBoardId,
  loadTasks,
  setTaskError,
}: Params) => {
  useEffect(() => {
    if (!insforge || !user || !selectedBoardId) return;

    const channelName = `board:${selectedBoardId}`;
    const refreshFromRealtime = (payload: unknown) => {
      if (!isRealtimePayloadForBoard(payload, selectedBoardId, channelName)) return;
      void loadTasks(insforge, user.id, selectedBoardId);
    };

    void (async () => {
      try {
        await insforge.realtime.connect();
      } catch (error) {
        setTaskError(error instanceof Error ? error.message : "No se pudo conectar al realtime.");
        return;
      }

      const subscribeResult = await insforge.realtime.subscribe(channelName);
      if (!subscribeResult.ok) {
        setTaskError(subscribeResult.error.message ?? "No se pudo suscribir al canal realtime.");
        return;
      }

      insforge.realtime.on("task_created", refreshFromRealtime);
      insforge.realtime.on("task_changed", refreshFromRealtime);
      insforge.realtime.on("task_status_changed", refreshFromRealtime);
      insforge.realtime.on("task_deleted", refreshFromRealtime);
    })();

    return () => {
      insforge.realtime.off("task_created", refreshFromRealtime);
      insforge.realtime.off("task_changed", refreshFromRealtime);
      insforge.realtime.off("task_status_changed", refreshFromRealtime);
      insforge.realtime.off("task_deleted", refreshFromRealtime);
      insforge.realtime.unsubscribe(channelName);
    };
  }, [insforge, loadTasks, selectedBoardId, setTaskError, user]);
};
