export function isPromiseLike(data: any){
    return (data && ((data instanceof Promise) || (data.then !== undefined && typeof data.then === "function"))) ? true : false
}