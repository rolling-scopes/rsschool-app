import { delay, EventEmitter } from '../../dependencies.ts';
import config from '../../config.ts';
import { eventBus, messageReceivedEvent, messageDeletedEvent } from '../../services/event-bus.ts';
import { discordCache } from '../../services/discord.ts';
import {
  GatewayPayload,
  HelloGatewayPayload,
  DispatchGatewayPayload,
  DispatchReadyEvent,
  Message,
  DispatchMessageDeleteEvent,
  DispatchMessageDeleteBulkEvent,
  InvalidSessionGatewayPayload,
  HeartbeatGatewayPayload,
  IdentifyGatewayPayload,
  ResumeGatewayPayload,
} from './discord-model.ts';
import { GatewayEventName, Opcode, Intent, getIntents } from './discord-enums.ts';

const { apiUrl, token } = config.discord;

let socket: WebSocket;
let heartbeatInterval: number;
let connectionAliveTimers: number[] = [];
const session: {
  id: string | null;
  seq: number | null;
  resumable: boolean;
  resumeGatewayUrl: string | null;
} = {
  id: null,
  seq: null,
  resumable: false,
  resumeGatewayUrl: null,
};
const resetSession = () => {
  session.id = null;
  session.resumable = false;
  session.resumeGatewayUrl = null;
  session.seq = null;
};

const openConnectionEvent = Symbol('Open connection');
const helloEvent = Symbol('Hello');
const heartbeatEvent = Symbol('Heartbeat');
const heartbeatAcknowledgeEvent = Symbol('Heartbeat acknowledge')
const identifyEvent = Symbol('Identify');
const resumeEvent = Symbol('Resume');
const dispatchEvent = Symbol('Dispatch');
const invalidSessionEvent = Symbol('Invalid session');
const reconnectEvent = Symbol('Reconnect')
const connectionDeadEvent = Symbol('Connection dead');

const listen = () => {
  socket.addEventListener('open', () => {
    console.info('Connected');
  });

  socket.addEventListener('close', (event) => {
    console.info(event);
  })

  socket.addEventListener('error', (error) => {
    console.error(error);
  })

  socket.addEventListener('message', (event: { data: string }) => {
    console.debug('Message from server ', event.data);
    const data: GatewayPayload = JSON.parse(event.data);

    switch(data.op) {
      case Opcode.Hello: {
        bus.emit(helloEvent, data);
        break;
      }
      case Opcode.Heartbeat: {
        bus.emit(heartbeatEvent, data);
        break;
      }
      case Opcode.HeartbeatACK: {
        bus.emit(heartbeatAcknowledgeEvent, data);
        break;
      }
      case Opcode.Dispatch: {
        bus.emit(dispatchEvent, data);
        break;
      }
      case Opcode.InvalidSession: {
        bus.emit(invalidSessionEvent, data);
        break;
      }
      case Opcode.Reconnect: {
        bus.emit(reconnectEvent, data);
        break;
      }
      default: {
        console.debug(`Opcode ${data.op} received. Skipping.`);
      }
    }
  });
}

const bus = new EventEmitter()

  /**
   * https://discord.com/developers/docs/topics/gateway#connecting-to-the-gateway
   */
  .on(openConnectionEvent, () => {
    console.info(openConnectionEvent.description);

    socket = new WebSocket(session.resumable ? session.resumeGatewayUrl! : apiUrl);

    listen();
  })

  /**
   * https://discord.com/developers/docs/topics/gateway#heartbeating
   */
  .on(helloEvent, async (event: HelloGatewayPayload) => {
    console.info(helloEvent.description, event);

    if (session.resumable) {
      bus.emit(resumeEvent);
    } else {
      bus.emit(identifyEvent);
    }

    await delay(event.d.heartbeat_interval * Math.random());

    bus.emit(heartbeatEvent);
    heartbeatInterval = event.d.heartbeat_interval;
    connectionAliveTimers.push(setTimeout(() => bus.emit(connectionDeadEvent), heartbeatInterval));
    setInterval(() => bus.emit(heartbeatEvent), heartbeatInterval);
  })

  /**
   * https://discord.com/developers/docs/topics/gateway#heartbeating
   */
  .on(heartbeatEvent, () => {
    console.info(heartbeatEvent.description);

    connectionAliveTimers.push(setTimeout(() => bus.emit(connectionDeadEvent), heartbeatInterval));

    socket.send(JSON.stringify({ op: Opcode.Heartbeat, d: session.seq } as HeartbeatGatewayPayload));
  })

  /**
   * https://discord.com/developers/docs/topics/gateway#heartbeating
   */
  .on(heartbeatAcknowledgeEvent, () => {
    console.info(heartbeatAcknowledgeEvent.description);

    connectionAliveTimers.map((timer) => clearTimeout(timer));
    connectionAliveTimers = [];
  })

  /**
   * https://discord.com/developers/docs/topics/gateway#identifying
   */
  .on(identifyEvent, () => {
    console.info(identifyEvent.description);

    socket.send(JSON.stringify({
      op: Opcode.Identify,
      d: {
        token,
        intents: getIntents(Intent.GUILD_MESSAGES, Intent.MESSAGE_CONTENT),
        properties: {
          os: 'linux',
          browser: 'bumblebee',
          device: 'bumblebee',
        },
      },
    } as IdentifyGatewayPayload));
  })

  /**
   * https://discord.com/developers/docs/topics/gateway#resuming
   */
  .on(resumeEvent, () => {
    console.info(resumeEvent.description);

    socket.send(JSON.stringify({
      op: Opcode.Resume,
      d: {
        token,
        session_id: session.id,
        seq: session.seq,
      },
    } as ResumeGatewayPayload));
  })

  /**
   * https://discord.com/developers/docs/topics/gateway#ready
   */
  .on(dispatchEvent, (event: DispatchGatewayPayload<unknown>) => {
    console.debug(dispatchEvent.description, event);

    if (typeof event.s === 'number') {
      session.seq = event.s;
    }

    if (event.t === GatewayEventName.READY) {
      const { session_id, resume_gateway_url } = (event as DispatchGatewayPayload<DispatchReadyEvent>).d;
      session.id = session_id;
      session.resumeGatewayUrl = resume_gateway_url;
      return;
    }

    if ([
      GatewayEventName.MESSAGE_CREATE,
      GatewayEventName.MESSAGE_UPDATE,
      GatewayEventName.MESSAGE_DELETE,
      GatewayEventName.MESSAGE_DELETE_BULK,
    ].includes(event.t)) {
      const channelId = (event as DispatchGatewayPayload<Message>).d.channel_id;
      if (!discordCache.activeChannels!.has(channelId)) return;
    }

    switch(event.t) {
      case GatewayEventName.MESSAGE_CREATE:
      case GatewayEventName.MESSAGE_UPDATE: {
        const data = (event as DispatchGatewayPayload<Message>).d;
        eventBus.emit(messageReceivedEvent, data);
        break;
      }
      case GatewayEventName.MESSAGE_DELETE: {
        const { id } = (event as DispatchGatewayPayload<DispatchMessageDeleteEvent>).d;
        eventBus.emit(messageDeletedEvent, id);
        break;
      }
      case GatewayEventName.MESSAGE_DELETE_BULK: {
        const { ids } = (event as DispatchGatewayPayload<DispatchMessageDeleteBulkEvent>).d;
        for (const id of ids) {
          eventBus.emit(messageDeletedEvent, id);
        }
        break;
      }
      default: {
        console.debug(`Event of type"${event.t}" received. Skipping.`);
      }
    }
  })

  /**
   * https://discord.com/developers/docs/topics/gateway#invalid-session
   */
  .on(invalidSessionEvent, (event: InvalidSessionGatewayPayload) => {
    console.info(invalidSessionEvent.description, event);

    if (event.d === true) {
      session.resumable = true;
    } else {
      resetSession();
    }

    bus.emit(reconnectEvent);
  })

  /**
   * https://discord.com/developers/docs/topics/gateway#resuming
   */
  .on(reconnectEvent, () => {
    console.info(reconnectEvent.description);

    /**
     * As mentioned here for resumable connection we need to use any code but 1000 (Normal Closure) and 1001 (Going Away):
     * https://discord.com/developers/docs/topics/gateway#heartbeating
     * https://discord.com/developers/docs/topics/gateway#disconnections
     *
     * So we are using 1012 (Service Restart).
     * https://www.iana.org/assignments/websocket/websocket.xhtml#close-code-number
     */
    socket.close(session.resumable ? 1012 : 1000);

    bus.emit(openConnectionEvent);
  })

  /**
   * https://discord.com/developers/docs/topics/gateway#heartbeating
   */
  .on(connectionDeadEvent, () => {
    console.info(connectionDeadEvent.description);

    resetSession();

    bus.emit(reconnectEvent);
  });

export const listenDiscord = () => bus.emit(openConnectionEvent);
