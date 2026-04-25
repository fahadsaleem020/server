import type { Server, Socket, DefaultEventsMap } from "socket.io";

export type SocketEventHandler<Data = { [p in string]: any }, WithSocketObject = { socket: Socket; io: IO } & Data> = (
  params: WithSocketObject,
) => any;

export type IO = Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
