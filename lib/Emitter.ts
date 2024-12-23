import { DefaultEmitterOptions } from './util/DefaultOptions';
import isPromiseLike from './util/isPromiseLike';

/**
 * A class that implements an event emitter with type safety and listener limits.
 */
export default class Emitter<L extends ListenerSignature<L> = ListenerMap> {
  /**
   * Optional limits for the number of listeners for each event type.
   */
  protected limits?: ListenerLimitSignature<L> | undefined;

  /**
   * Options for configuring the emitter's behavior.
   */
  protected options?: EmitterOptions;

  /**
   * A map that holds the event listeners for each event type.
   */
  protected listeners: Map<keyof L, Set<L[keyof L]>> = new Map();

  /**
   * A flag indicating whether a warning has been issued for exceeding listener limits.
   */
  private warned?: boolean;

  /**
   * Creates an instance of the Emitter class.
   * @param emitterOptions - Options for configuring the emitter.
   * @param limits - Optional limits for the number of listeners for each event type.
   */
  constructor(
    emitterOptions?: EmitterOptions,
    limits?: ListenerLimitSignature<L>
  ) {
    this.options = Emitter.handleEmitterOptions(emitterOptions);
    this.limits = limits;
  }

  /**
   * Creates an event listener.
   * @param eventName - The name of the event to listen for.
   * @param listener - The callback function to execute when the event is emitted.
   * @returns The current instance of the Emitter for chaining.
   */
  public on<K extends keyof L>(eventName: K, listener: L[K]): this {
    if (!this.listeners.has(eventName)) {
      if (!listener.listenerData) listener.listenerData = {};
      Object.defineProperty(listener.listenerData, 'once', { value: false });
      this.listeners.set(eventName, new Set([listener]));
    } else {
      const listeners = this.listeners.get(eventName) as Set<L[keyof L]>;
      if (!listener.listenerData) listener.listenerData = {};
      Object.defineProperty(listener.listenerData, 'once', { value: false });
      listeners?.add(listener);
      this.listeners.set(eventName, listeners);
    }
    if (
      this.limits !== 'undefined' &&
      ((this.limits as ListenerLimitSignature<L>)[eventName] as number) >
        (this.listeners.get(eventName)?.size as number) &&
      !this.warned &&
      this.options?.limitWarn
    ) {
      process.emitWarning(
        `listener limit is ${
          (this.limits as ListenerLimitSignature<L>)[eventName] as number
        } for ${
          eventName as string
        }, but this events listener size is bigger than listener limit, but you can change this in 2nd parameter`
      );
      this.warned = true;
    }
    return this;
  }

  /**
   * Creates an event listener for single use.
   * @param eventName - The name of the event to listen for.
   * @param listener - The callback function to execute when the event is emitted.
   * @returns The current instance of the Emitter for chaining.
   */
  public once<K extends keyof L>(eventName: K, listener: L[K]): this {
    if (!this.listeners.has(eventName)) {
      if (!listener.listenerData) listener.listenerData = {};
      Object.defineProperty(listener.listenerData, 'once', { value: true });
      this.listeners.set(eventName, new Set([listener]));
    } else {
      const listeners = this.listeners.get(eventName) as Set<L[keyof L]>;
      if (!listener.listenerData) listener.listenerData = {};
      Object.defineProperty(listener.listenerData, 'once', { value: true });
      listeners?.add(listener);
      this.listeners.set(eventName, listeners);
    }
    if (
      this.limits !== 'undefined' &&
      ((this.limits as ListenerLimitSignature<L>)[eventName] as number) >
        (this.listeners.get(eventName)?.size as number) &&
      !this.warned &&
      this.options?.limitWarn
    ) {
      process.emitWarning(
        `listener limit is ${
          (this.limits as ListenerLimitSignature<L>)[eventName] as number
        } for ${
          eventName as string
        }, but this events listener size is bigger than listener limit, but you can change this in 2nd parameter`
      );
      this.warned = true;
    }
    return this;
  }

  /**
   * Creates an async event listener for single use.
   * @param eventName - The name of the event to listen for.
   * @returns A promise that resolves with the parameters passed to the listener when the event is emitted.
   */
  public onceAsync<K extends keyof L>(eventName: K): Promise<Parameters<L[K]>> {
    let promise = new Promise<Parameters<L[K]>>((resolve, reject) => {
      //@ts-ignore
      this.once(eventName, (...parameters: Parameters<L[K]>) => {
        try {
          resolve(parameters);
        } catch (e) {
          reject(e);
        }
      });
    });

    return promise;
  }

  /**
   * Removes an event listener for single use.
   * @param eventName - The name of the event to stop listening for.
   * @param listener - The callback function to remove.
   * @returns The current instance of the Emitter for chaining.
   */
  public off<K extends keyof L>(eventName: K, listener?: L[K]) {
    if (this.listeners.has(eventName)) {
      const listeners = this.listeners.get(eventName) as Set<L[keyof L]>;
      for (const callback of this.listeners.get(eventName) as Set<L[keyof L]>) {
        if (String(listener) === String(callback))
          listeners.delete(listener as L[K]);
      }
      if (listeners.size > 0) {
        this.listeners.set(eventName, listeners);
      } else {
        this.listeners.delete(eventName);
      }
    }
    return this;
  }

  /**
   * Emits an event.
   * @param eventName - The name of the event to emit.
   * @param args - The arguments to pass to the listener callbacks.
   * @returns A set of return values from the listener callbacks.
   */
  public emit<K extends keyof L>(
    eventName: K,
    ...args: Parameters<L[K]>
  ): Set<L[keyof L]> {
    let returnVal: Set<L[keyof L]> = new Set();
    if (this.listeners.has(eventName)) {
      for (const callback of this.listeners.get(eventName) as Set<L[keyof L]>) {
        if (callback.listenerData?.suspended) continue;

        const callbackRes: any = callback(...args);

        if (isPromiseLike(callbackRes)) {
          callbackRes.then(() => {
            Object.defineProperty(callback.listenerData, 'listened', {
              value: true,
            });
            if (callback.listenerData?.once) this.off(eventName, callback);
            returnVal.add(callbackRes);
          });
        } else {
          Object.defineProperty(callback.listenerData, 'listened', {
            value: true,
          });
          if (callback.listenerData?.once) this.off(eventName, callback);
          returnVal.add(callbackRes);
        }
      }
    }
    return returnVal;
  }

  /**
   * Checks if the specified listener exists for a given event.
   * @param eventName - The name of the event to check.
   * @param callback - The callback function to check for.
   * @returns True if the listener exists, false otherwise.
   */
  public hasListener<K extends keyof L>(
    eventName: K,
    callback?: L[K]
  ): boolean {
    if (!callback) {
      return this.listeners.has(eventName);
    } else {
      if (this.listeners.has(eventName)) {
        for (const listener of this.listeners.get(eventName) as Set<
          L[keyof L]
        >) {
          if (String(listener) === String(callback)) return true;
        }
        return false;
      }
      return false;
    }
  }

  /**
   * Checks if there is a listener with the specified name that has been listened to or not.
   * @param eventName - The name of the event to check.
   * @returns True if there is a listener that has been listened to, false otherwise.
   */
  public isListened<K extends keyof L>(eventName: K) {
    if (this.listeners.has(eventName)) {
      for (let listeners of this.listeners.get(eventName) as Set<L[keyof L]>) {
        if (listeners?.listenerData?.listened) return true;
      }
      return false;
    } else return false;
  }

  /**
   * Returns the number of listeners for a specified event name, or the total number of listeners if no event name is specified.
   * @param eventName - The name of the event to check.
   * @returns The number of listeners for the specified event, or the total number of listeners.
   */
  public listenerCount<K extends keyof L>(eventName?: K) {
    let listenerCount = 0;
    if (eventName) {
      if (this.listeners.has(eventName)) {
        return (this.listeners.get(eventName) as Set<L[keyof L]>).size;
      }
      return 0;
    } else {
      for (let listeners of this.listeners) {
        listenerCount += listeners[1].size;
      }
      return listenerCount;
    }
  }

  /**
   * Handles the emitter options, setting default values if necessary.
   * @param emitterOptions - Options for configuring the emitter.
   * @returns The processed emitter options.
   */
  protected static handleEmitterOptions(
    emitterOptions?: EmitterOptions
  ): EmitterOptions {
    const options = emitterOptions || { ...DefaultEmitterOptions };
    if (options.limitWarn === undefined) {
      options.limitWarn = true;
    }
    return options;
  }
}
