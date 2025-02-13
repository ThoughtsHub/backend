/**
 * Retry to call a function till the value is satisfactory
 * @param {[Function]} func
 * @param {[Any]} stopVal return value of function at which to not retry
 * @param {[Integer]} interval time in miliseconds
 */
const retry = async (func, stopVal = true, interval = 3000) => {
  const functionResult = await func();
  if (functionResult !== stopVal)
    await new Promise(() => {
      setTimeout(() => {
        const functionResult = func();
        if (functionResult !== stopVal) retry(func, stopVal, interval);
      }, interval);
    });
};

export default retry;
