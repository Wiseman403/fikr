/**
 * state.js — Reactive State Management with Proxy API
 *
 * Creates a reactive store using JavaScript's Proxy API to automatically
 * notify subscribers whenever a state property changes. This enables
 * declarative UI bindings without any framework dependency.
 *
 * @module state
 */

/**
 * Creates a reactive store with automatic change notification.
 *
 * @param {Object} initialState - The initial state object
 * @returns {{ state: Proxy, subscribe: Function, getSnapshot: Function }}
 *
 * @example
 *   const store = createStore({ points: 0, name: 'Alex' });
 *   store.subscribe('points', (newVal, oldVal) => {
 *     document.getElementById('pts').textContent = newVal;
 *   });
 *   store.state.points = 100; // UI updates automatically
 */
export function createStore(initialState) {
  /**
   * Map of property names → Set of subscriber callbacks.
   * Each callback receives (newValue, oldValue, propertyName).
   * @type {Map<string, Set<Function>>}
   */
  const listeners = new Map();

  /**
   * Proxy handler — intercepts `set` operations on the state
   * object and fans out change notifications to all subscribers
   * registered for the modified property.
   */
  const handler = {
    set(target, property, value) {
      const oldValue = target[property];
      target[property] = value;

      // Only notify when the value actually changed
      if (oldValue !== value && listeners.has(property)) {
        listeners.get(property).forEach((callback) => {
          try {
            callback(value, oldValue, property);
          } catch (err) {
            console.error(`[Store] Subscriber error for "${property}":`, err);
          }
        });
      }

      return true; // Indicate success to the Proxy
    },

    get(target, property) {
      return target[property];
    },
  };

  // Create the reactive proxy from a shallow clone of initial state
  const state = new Proxy({ ...initialState }, handler);

  return {
    /** The reactive state proxy — mutations trigger subscribers */
    state,

    /**
     * Subscribe to changes on a specific state property.
     *
     * The callback fires immediately with the current value (for
     * initial render), then again whenever the property mutates.
     *
     * @param {string}   property - State key to observe
     * @param {Function} callback - (newValue, oldValue, property) => void
     * @returns {Function} Unsubscribe function
     */
    subscribe(property, callback) {
      if (!listeners.has(property)) {
        listeners.set(property, new Set());
      }
      listeners.get(property).add(callback);

      // Fire immediately with current value for initial UI hydration
      callback(state[property], undefined, property);

      // Return a teardown function
      return () => {
        const subs = listeners.get(property);
        if (subs) {
          subs.delete(callback);
          if (subs.size === 0) listeners.delete(property);
        }
      };
    },

    /**
     * Get a plain-object snapshot of the current state.
     * Useful for debugging or serialization.
     * @returns {Object}
     */
    getSnapshot() {
      return { ...state };
    },
  };
}
