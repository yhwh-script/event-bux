export const name = 'bus'; // implements EventTarget

const listeners = new WeakMap(); // WeakMap to store listeners per object. Keep it private unless you know what you do.
// Should auto-cleanup listeners when object is GC'd
export const addEventListener = function (eventName, handler, context = undefined) {
    if (context && typeof context === 'object') { // context is well defined, should be a WebComponent
        if (!listeners.has(context)) { // context is yet unknown to the listeners
            listeners.set(context, new Map()); // will be stored here
        }
        const contextListeners = listeners.get(context);
        if (!contextListeners.has(eventName)) { // eventName is not yet registered
            contextListeners.set(eventName, []);
        } // next push the handler to the WeakMap for the given context
        contextListeners.get(eventName).push(handler);
    } else { // default
        if (context) {
            throw new Error("Syntax error.") // illegal context
        }
        window.addEventListener(eventName, handler);
    }
}

export const removeEventListener = function (eventName, handler, context = undefined) {
    if (context && typeof context === 'object') {
        const contextListeners = listeners.get(context);
        if (contextListeners && contextListeners.has(eventName)) {
            const handlers = contextListeners.get(eventName);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    } else { // default
        window.removeEventListener(eventName);
    }
}

export const dispatchEvent = function (customEvent, context = undefined) {
    let eventName = customEvent.type;
    let detail = customEvent.detail;
    const event = { type: eventName, detail, target: context };

    // Call context-specific listeners
    if (context && listeners.has(context)) {
        const contextListeners = listeners.get(context);
        if (contextListeners.has(eventName)) {
            contextListeners.get(eventName).forEach(handler => handler(event));
        }
    } else {
        window.dispatchEvent(customEvent);
    }
}
