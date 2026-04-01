import Pusher from "pusher";

declare global {
  // eslint-disable-next-line no-var
  var pusherServer: Pusher | undefined;
}

function getPusherServer(): Pusher {
  if (global.pusherServer) return global.pusherServer;

  global.pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
  });

  return global.pusherServer;
}

export async function publishRoomUpdate(
  code: string,
  payload: { type: string; [key: string]: unknown }
) {
  try {
    await getPusherServer().trigger(`room-${code}`, "room-updated", payload);
  } catch (err) {
    console.error("[Pusher] Failed to publish:", err);
  }
}
