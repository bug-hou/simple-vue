const queue: any[] = [];

let isFlushPending = false;

export const nextTick = (fn?: any) => {
  return fn ? Promise.resolve().then(fn) : Promise.resolve();
}

export const queueJobs = (job: any) => {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  if (isFlushPending) return;
  isFlushPending = true;
  nextTick(flushJobs)
}

function flushJobs() {
  let job;
  isFlushPending = false;
  while (job = queue.shift()) {
    job && job();
  }
}