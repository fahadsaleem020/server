import type { Socket } from "socket.io";
import type { IO } from "@/types/socket.types";
import { sendMessagehandler } from "@/events/send-message.event";

export const registerEvents = (socket: Socket, _io: IO) => {
  socket.on("send-message", (data) => sendMessagehandler({ socket, ...data }));
};
