import { askDialogflow } from "@/configs/dialogflow.config";
import type { auth } from "@/lib/auth";
import type { SocketEventHandler } from "@/types/socket.types";

export const sendMessagehandler: SocketEventHandler<{ data: typeof auth.$Infer.Session; message: string }> = async ({
  message,
  socket,
  data,
}) => {
  const dialogFlowResponseMessage = await askDialogflow(message, data.session.id);
  socket.emit("response-message", dialogFlowResponseMessage);
};
