import type { ListenerMap, ListenerSignature, EmitterOptions, ListenerLimitSignature } from "./types/types";
import { DefaultEmitterOptions } from "./util/DefaultOptions";
import { isPromiseLike } from "./util/isPromiseLike";




export default class Emitter<L extends ListenerSignature<L> = ListenerMap>{
    limits?: ListenerLimitSignature<L> | undefined
    emitterOptions?: EmitterOptions;
    listeners: Map<keyof L, Set<L[keyof L]>>
    warned?: boolean
    constructor(emitterOptions?: EmitterOptions,  limits?: ListenerLimitSignature<L>){
        this.emitterOptions = Emitter.handleEmitterOptions(emitterOptions)
        this.limits = limits;
        this.listeners = new Map<keyof L, Set<L[keyof L]>>();
    }
    /**
     * Creates an event listener
     */
    public on<K extends keyof L>(eventName: K, listener: L[K]): this {
        if(!this.listeners.has(eventName)){
            if(!listener.listenerData) listener.listenerData = {};
            Object.defineProperty(listener.listenerData, "once", { value: false })
            this.listeners.set(eventName, new Set([listener]));
        } else {
            const listeners = this.listeners.get(eventName) as Set<L[keyof L]>
            if(!listener.listenerData) listener.listenerData = {};
            Object.defineProperty(listener.listenerData, "once", { value: false })
            listeners?.add(listener);
            this.listeners.set(eventName, listeners)
        }
        if(this.limits !== "undefined" && ((this.limits as ListenerLimitSignature<L>)[eventName] as number) > (this.listeners.get(eventName)?.size as number) && !this.warned && this.emitterOptions?.limitWarn){
            process.emitWarning(`listener limit is ${(this.limits as ListenerLimitSignature<L>)[eventName] as number} for ${eventName as string}, but this events listener size is bigger than listener limit, but you can change this in 2nd parameter`);
            this.warned = true;
        }
        return this
    }
    /**
     * Creates an event listener for single use
     */
    public once<K extends keyof L>(eventName: K, listener: L[K]): this {
        if(!this.listeners.has(eventName)){
            if(!listener.listenerData) listener.listenerData = {};
            Object.defineProperty(listener.listenerData, "once", { value: true })
            this.listeners.set(eventName, new Set([listener]));
        } else {
            const listeners = this.listeners.get(eventName) as Set<L[keyof L]>
            if(!listener.listenerData) listener.listenerData = {};
            Object.defineProperty(listener.listenerData, "once", { value: true })
            listeners?.add(listener);
            this.listeners.set(eventName, listeners)
        }
        if(this.limits !== "undefined" && ((this.limits as ListenerLimitSignature<L>)[eventName] as number) > (this.listeners.get(eventName)?.size as number) && !this.warned && this.emitterOptions?.limitWarn){
            process.emitWarning(`listener limit is ${(this.limits as ListenerLimitSignature<L>)[eventName] as number} for ${eventName as string}, but this events listener size is bigger than listener limit, but you can change this in 2nd parameter`);
            this.warned = true;
        }
        return this
    }
    /**
     * Creates an async event listener for single use
     */
    public onceAsync<K extends keyof L>(eventName: K): Promise<Parameters<L[K]>>{
        let promise = new Promise<Parameters<L[K]>>((resolve, reject) => {
            //@ts-ignore
            this.once(eventName, (...parameters: Parameters<L[K]>) => {
                try {
                    resolve(parameters)
                } catch(e){
                    reject(e)
                }
            })
        })

        return promise
    }
    /**
     * Removes an event listener for single use
     */
    public off<K extends keyof L>(eventName: K, listener?: L[K]){
        if(this.listeners.has(eventName)) {
            const listeners = this.listeners.get(eventName) as Set<L[keyof L]>
            for(const callback of this.listeners.get(eventName) as Set<L[keyof L]>){
                if(String(listener) === String(callback)) listeners.delete(listener as L[K]);
            }
            if(listeners.size > 0) {
                this.listeners.set(eventName, listeners);
            } else {
                this.listeners.delete(eventName);
            }
        }
        return this
    }
    /**
     * Emits an event
     */
    public emit<K extends keyof L>(eventName: K, ...args: Parameters<L[K]>): Set<L[keyof L]>{
        let returnVal: Set<L[keyof L]> = new Set();
        if(this.listeners.has(eventName)){
        for(const callback of this.listeners.get(eventName) as Set<L[keyof L]>){
            if(callback.listenerData?.suspended) continue;

            const callbackRes = callback(...args);

            if(isPromiseLike(callbackRes)){
                callbackRes.then(() => {
                    Object.defineProperty(callback.listenerData, "listened", {
                        value: true
                    })
                    if(callback.listenerData?.once) this.off(eventName, callback);
                    returnVal.add(callbackRes);
                })
            } else {
                Object.defineProperty(callback.listenerData, "listened", {
                    value: true
                })
                if(callback.listenerData?.once) this.off(eventName, callback);
                returnVal.add(callbackRes);
            }
        }
       }
       return returnVal;
    }
    /**
     * Checks the specified listener exists
     */
    public hasListener<K extends keyof L>(eventName: K, callback?: L[K]): boolean{
        if(!callback){
            return this.listeners.has(eventName);
        } else {
            if(this.listeners.has(eventName)){
                for(const listener of this.listeners.get(eventName) as Set<L[keyof L]>){
                    if(String(listener) === String(callback)) return true;
                }
                return false;
            } return false;
        }
    }
    /**
     * Checks there is a listener with the specified name listened or not listened
     */
    public isListened<K extends keyof L>(eventName: K){
        if(this.listeners.has(eventName)){
            for(let listeners of this.listeners.get(eventName) as Set<L[keyof L]>){
                if(listeners?.listenerData?.listened) return true;
            }
            return false;
        } else return false;
    }
    /**
     * If an event name is specified, it returns the number of listeners with the specified name. If not specified, it returns the total number of listeners on the emitter.
     */
    public listenerCount<K extends keyof L>(eventName?: K){
        let listenerCount = 0;
        if(eventName){
            if(this.listeners.has(eventName)){
                return (this.listeners.get(eventName) as Set<L[keyof L]>).size
            } return 0;
        } else {
            
            for(let listeners of this.listeners){
               listenerCount += listeners[1].size;
            }
            return listenerCount
        }
    }
    protected static handleEmitterOptions(emitterOptions?: EmitterOptions): EmitterOptions{
        if(emitterOptions && (emitterOptions?.limitWarn === undefined)) emitterOptions.limitWarn = true;
        if(!emitterOptions) emitterOptions = DefaultEmitterOptions;
        return emitterOptions
    }
}