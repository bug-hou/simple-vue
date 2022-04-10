const queue: any[] = [];

let isFlushPending = false;

export const queueJobs = (job: any) => {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  if (isFlushPending) return;
  isFlushPending = true;
  Promise.resolve().then(() => {
    let job;
    isFlushPending = false;
    while (job = queue.shift()) {
      job && job();
    }
  })
}