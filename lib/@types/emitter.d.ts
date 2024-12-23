interface ListenerMap {
  [key: string]: Listener;
}

interface Listener {
  (...args: any[]): unknown;
  listenerData?: ListenerData;
}

interface ListenerData {
  suspended?: boolean;
  once?: boolean;
  listened?: boolean;
  listenedTimes?: number;
}

type ListenerSignature<E> = {
  [K in keyof E]: Listener;
};

type ListenerLimitSignature<E> = {
  [K in keyof E]?: number;
};

interface EmitterOptions {
  limitWarn?: boolean;
}