export type CallResponse<T> = {
  success: boolean;
  data: T;
}

export async function executeUntil<T>(func: any, executionPeriod: number, maxTries: number = 10): Promise<T> {
  let funcResponse: CallResponse<T> = await func();
  let tryCount = 1;

  if (funcResponse.success) {
    return funcResponse.data
  }
  
  const funcExecution = ((resolve: any, reject: any) => {
    setTimeout(async () => {
      const res: CallResponse<T> = await func();
      tryCount++;
      if (res.success) {
        return resolve(res.data as T);
      }

      if (tryCount > maxTries) {
        return reject('Execute unitl error: Max tries reached with no positive result');
      }
      
      return await funcExecution(resolve, reject);
    }, executionPeriod)
  })

  return new Promise(async (resolve, reject) => {
    await funcExecution(resolve, reject);
  })
}