// Anything that adds, signs or withdraws a request tells the sidebar badge to recount.
export const QUEUE_CHANGED = "omc:queue-changed";
export const queueChanged = () => window.dispatchEvent(new Event(QUEUE_CHANGED));
