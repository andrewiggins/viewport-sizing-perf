export { App } from "../react/lib-react.js";

const viewportWidthMin = {
  s: 0,
  m: 480,
  l: 640,
  xl: 1024,
  xxl: 1366,
  xxxl: 1920,
};

const viewportWidthMax = {
  s: viewportWidthMin.m - 1,
  m: viewportWidthMin.l - 1,
  l: viewportWidthMin.xl - 1,
  xl: viewportWidthMin.xxl - 1,
  xxl: viewportWidthMin.xxxl - 1,
  xxxl: Number.MAX_SAFE_INTEGER,
};

const viewportTypes = Object.keys(viewportWidthMin);

export function getStyle(viewportType) {
  return { width: viewportType == "s" || viewportType == "m" ? "100%" : "50%" };
}

export class MatchMediaViewportTypeObservable {
  constructor(useCachedValue = false) {
    this.useCachedValue = useCachedValue;

    this.subscribers = [];
    this.matchers = [];
    this.mediaQueryToViewportType = {};

    for (const viewportType of viewportTypes) {
      let mediaQuery;
      if (viewportWidthMin[viewportType] === 0) {
        mediaQuery = `(max-width: ${viewportWidthMax[viewportType]}px)`;
      } else if (viewportWidthMax[viewportType] === Number.MAX_SAFE_INTEGER) {
        mediaQuery = `(min-width: ${viewportWidthMin[viewportType]}px)`;
      } else {
        mediaQuery = `(min-width: ${viewportWidthMin[viewportType]}px) and (max-width: ${viewportWidthMax[viewportType]}px)`;
      }

      const matcher = window.matchMedia(mediaQuery);
      this.matchers.push(matcher);

      this.mediaQueryToViewportType[matcher.media] = viewportType;
    }

    if (this.useCachedValue) {
      this.cachedValue = this.readCurrentViewportType();
    }
  }

  /**
   * Get the current ViewportType
   */
  getCurrentValue = () => {
    if (this.useCachedValue) {
      return this.cachedValue;
    } else {
      return this.readCurrentViewportType();
    }
  };

  /**
   * Subscribe to viewport type changes
   * @param {() => void} listener A callback that should be invoked when the viewport type changes
   * @returns A function to call when you want to unsubscribe from viewport type changes
   */
  subscribe = (listener) => {
    this.subscribers.push(listener);
    if (this.subscribers.length === 1) {
      // We got our first subscriber! Let's setup the media queries.
      for (const matcher of this.matchers) {
        matcher.addListener(this.emitChange);
      }
    }

    return () => {
      this.subscribers.splice(this.subscribers.indexOf(listener), 1);
      if (this.subscribers.length === 0) {
        // Awww... no one is listening anymore. Let's cleanup after ourselves
        for (const matcher of this.matchers) {
          matcher.removeListener(this.emitChange);
        }
      }
    };
  };

  /**
   * @param {MediaQueryListEvent} mqListEvent
   */
  emitChange = (mqListEvent) => {
    if (!mqListEvent.matches) {
      return;
    }

    performance.mark("start");
    requestAnimationFrame(() => {
      let entry = performance.measure("duration", "start");
      window.parent.postMessage(entry.duration);
    });

    if (this.useCachedValue) {
      this.cachedValue = this.mediaQueryToViewportType[mqListEvent.media];
    }

    ReactDOM.unstable_batchedUpdates(() => {
      this.subscribers.forEach((cb) => cb());
    });
  };

  readCurrentViewportType = () => {
    for (const matcher of this.matchers) {
      if (matcher.matches) {
        return this.mediaQueryToViewportType[matcher.media];
      }
    }

    return "xxxl";
  };
}
