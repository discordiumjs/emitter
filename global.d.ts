declare module '@discordjs/emitter' {
  /**
   * A map of event listeners, where the key is the event name and the value is the listener function.
   */
  export interface ListenerMap {
    [key: string]: Listener;
  }

  /**
   * Represents a listener function that can be called with any number of arguments.
   */
  export interface Listener {
    (...args: any[]): unknown;
    listenerData?: ListenerData;
  }

  /**
   * Data associated with a listener, including its state and usage.
   */
  export interface ListenerData {
    suspended?: boolean;
    once?: boolean;
    listened?: boolean;
    listenedTimes?: number;
  }

  /**
   * A signature for listeners, mapping event names to their corresponding listener types.
   */
  export type ListenerSignature<E> = {
    [K in keyof E]: Listener;
  };

  /**
   * A signature for listener limits, allowing optional limits for each event type.
   */
  export type ListenerLimitSignature<E> = {
    [K in keyof E]?: number;
  };

  /**
   * Options for configuring the emitter's behavior.
   */
  export interface EmitterOptions {
    limitWarn?: boolean;
  }

  /**
   * A class that implements an event emitter with type safety and listener limits.
   */
  export default class Emitter<L extends ListenerSignature<L> = ListenerMap> {
    /**
     * Creates an instance of the Emitter class.
     * @param emitterOptions - Options for configuring the emitter.
     * @param limits - Optional limits for the number of listeners for each event type.
     */
    constructor(emitterOptions?: EmitterOptions, limits?: ListenerLimitSignature<L>);

    /**
     * Creates an event listener.
     * @param eventName - The name of the event to listen for.
     * @param listener - The callback function to execute when the event is emitted.
     * @returns The current instance of the Emitter for chaining.
     */
    public on<K extends keyof L>(eventName: K, listener: L[K]): this;

    /**
     * Creates a one-time event listener.
     * @param eventName - The name of the event to listen for.
     * @param listener - The callback function to execute when the event is emitted.
     * @returns The current instance of the Emitter for chaining.
     */
    public once<K extends keyof L>(eventName: K, listener: L[K]): this;

    /**
     * Creates an async event listener for single use.
     * @param eventName - The name of the event to listen for.
     * @returns A promise that resolves with the parameters passed to the listener when the event is emitted.
     */
    public onceAsync<K extends keyof L>(eventName: K): Promise<Parameters<L[K]>>;

    /**
     * Removes an event listener.
     * @param eventName - The name of the event to stop listening for.
     * @param listener - The callback function to remove.
     * @returns The current instance of the Emitter for chaining.
     */
    public off<K extends keyof L>(eventName: K, listener?: L[K]): this;

    /**
     * Emits an event.
     * @param eventName - The name of the event to emit.
     * @param args - The arguments to pass to the listener callbacks.
     * @returns A set of return values from the listener callbacks.
     */
    public emit<K extends keyof L>(eventName: K, ...args: Parameters<L[K]>): Set<L[keyof L]>;

    /**
     * Checks if the specified listener exists for a given event.
     * @param eventName - The name of the event to check.
     * @param callback - The callback function to check for.
     * @returns True if the listener exists, false otherwise.
     */
    public hasListener<K extends keyof L>(eventName: K, callback?: L[K]): boolean;

    /**
     * Checks if any listener is registered for a given event.
     * @param eventName - The name of the event to check.
     * @returns True if at least one listener is registered, false otherwise.
     */
    public isListened<K extends keyof L>(eventName: K): boolean;

    /**
     * Gets the number of listeners registered for a given event.
     * @param eventName - The name of the event to check.
     * @returns The number of listeners registered for the event.
     */
    public listenerCount<K extends keyof L>(eventName?: K): number;

    /**
     * Handles the emitter options, providing default values where necessary.
     * @param emitterOptions - Options for configuring the emitter.
     * @returns The processed emitter options.
     */
    protected static handleEmitterOptions(emitterOptions?: EmitterOptions): EmitterOptions;
  }
}