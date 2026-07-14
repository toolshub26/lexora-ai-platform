export function throttle<T extends (...args: any[]) => void>(
  callback: T,
  delay = 300
) {
  let waiting = false;

  return (...args: Parameters<T>) => {
    if (waiting) return;

    callback(...args);
    waiting = true;

    setTimeout(() => {
      waiting = false;
    }, delay);
  };
}
