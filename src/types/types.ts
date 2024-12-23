export interface ListenerMap{
    [key: string]: Listener
}
export interface Listener{
    (...args: any[]): any;
    listenerData?: ListenerData;
}
export interface ListenerData {
    suspended?: boolean
    once?: boolean
    listened?: boolean
    listenedTimes?: number
}
export type ListenerSignature<E extends any> = {
    [K in keyof E]: Listener;
}
export type ListenerLimitSignature<E extends any> = {
    [K in keyof E]?: number | undefined;
}
export interface EmitterOptions{
    limitWarn?: boolean
}