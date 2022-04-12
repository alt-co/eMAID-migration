export function setDelay(time: number) {
    return new Promise(res=>setTimeout(res,time));
}