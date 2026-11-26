import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import css from "./ProductImageZoom.module.css";

const Svg = ({ children, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const ExpandIcon = () => (
  <Svg size={14}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </Svg>
);
const MinusIcon = () => <Svg size={14}><path d="M5 12h14" /></Svg>;
const PlusIcon = () => <Svg size={14}><path d="M12 5v14M5 12h14" /></Svg>;
const ChevronLeftIcon = () => <Svg><path d="m15 18-6-6 6-6" /></Svg>;
const ChevronRightIcon = () => <Svg><path d="m9 18 6-6-6-6" /></Svg>;
const CloseIcon = () => <Svg><path d="M18 6 6 18M6 6l12 12" /></Svg>;
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const roundZoom = (value) => Math.round(value * 10) / 10;

// Mirrors the clamp math the page's own mobile pinch-zoom already uses
// (clampZoomTranslate in pages/product-info/index.js): translate() is
// applied AFTER scale() in the transform string, so the pan offset is in
// plain screen pixels and the image edge reaches the viewport edge once
// |pan| hits half the scaled overflow.
const clampPan = (pan, scale, rect) => {
  if (!rect || scale <= 1) return { x: 0, y: 0 };
  const maxX = (rect.width * (scale - 1)) / 2;
  const maxY = (rect.height * (scale - 1)) / 2;
  return { x: clamp(pan.x, -maxX, maxX), y: clamp(pan.y, -maxY, maxY) };
};

const getTouchDistance = (touches) => {
  const [a, b] = touches;
  return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
};

const defaultGetImageSrc = (item) =>
  typeof item === "string" ? item : item?.src || item?.ImageMapPath || "";

// This app's existing convention for telling a product video apart from a
// photo in the shared PhotosAndVideos rows (see components/customer/
// aboutproduct/index.js) is a plain ".mp4" suffix check — there's no
// dedicated media-type column, so this matches that rather than inventing a
// new one.
const isVideoSrc = (src) => typeof src === "string" && /\.mp4($|\?)/i.test(src);

/**
 * Direct-manipulation zoom/pan for the fullscreen stage: wheel + click-to-
 * pan-when-zoomed + click-at-1x-zooms-toward-point on desktop, pinch +
 * single-finger pan + double-tap on touch. All gated by `enabled` (false for
 * video media, where native playback controls should own the surface).
 */
function useStageZoomPan({
  zoomLevel,
  setZoomLevel,
  minZoom,
  maxZoom,
  defaultZoom,
  enabled,
  isOpen,
  onSwipePrev,
  onSwipeNext,
}) {
  const ref = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const pinchRef = useRef(null);
  const touchPanRef = useRef(null);
  const swipeRef = useRef(null);
  const swipeNavRef = useRef({ onSwipePrev, onSwipeNext });
  swipeNavRef.current = { onSwipePrev, onSwipeNext };
  const lastTapRef = useRef(0);

  const resetPan = () => setPan({ x: 0, y: 0 });

  // Always-fresh state for the native (non-passive) listeners below, which
  // are attached once per open and must not go stale between renders.
  const liveRef = useRef({ enabled, zoomLevel, pan });
  liveRef.current = { enabled, zoomLevel, pan };

  const zoomToPoint = (clientX, clientY, atZoom) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = clientX - rect.left - rect.width / 2;
    const dy = clientY - rect.top - rect.height / 2;
    setPan(clampPan({ x: -dx * atZoom, y: -dy * atZoom }, atZoom, rect));
  };

  // Desktop: click-and-drag pan once zoomed in. Listeners are attached
  // imperatively right here, synchronously in the same handler as
  // mousedown — not via a useEffect keyed on an `isDragging` state flip.
  // That would leave a real timing gap (state update → re-render → effect
  // run) during which the very first mousemove of a fast drag can arrive
  // before the listener exists, so it's silently dropped, `moved` never
  // gets set, and the drag's trailing click is then wrongly treated as a
  // plain click — toggling zoom instead of just panning.
  const onMouseDown = (e) => {
    if (!enabled || zoomLevel <= minZoom) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPan = pan;
    dragRef.current = { moved: false };
    setIsDragging(true);

    const onMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
      const rect = ref.current?.getBoundingClientRect();
      setPan(
        clampPan({ x: startPan.x + dx, y: startPan.y + dy }, zoomLevel, rect)
      );
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Desktop: plain click toggles between 1x and defaultZoom, zooming toward
  // the click point. Suppressed if that click was actually the end of a drag.
  const onClick = (e) => {
    if (!enabled) return;
    if (dragRef.current?.moved) {
      dragRef.current = null;
      return;
    }
    if (zoomLevel > minZoom) {
      setZoomLevel(minZoom);
      resetPan();
    } else {
      zoomToPoint(e.clientX, e.clientY, defaultZoom);
      setZoomLevel(defaultZoom);
    }
  };

  // Mobile: two fingers pinch to zoom; one finger pans once zoomed; a second
  // tap within 300ms toggles between 1x and defaultZoom (zoomed toward the
  // tap point), mirroring the page's own existing mobile double-tap gesture.
  const onTouchStart = (e) => {
    if (!enabled) return;
    const touches = e.touches;
    if (touches.length === 2) {
      pinchRef.current = {
        startDistance: getTouchDistance(touches),
        startZoom: zoomLevel,
      };
      touchPanRef.current = null;
      swipeRef.current = null;
      return;
    }
    if (touches.length !== 1) return;
    const touch = touches[0];
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      lastTapRef.current = 0;
      swipeRef.current = null;
      if (zoomLevel > minZoom) {
        setZoomLevel(minZoom);
        resetPan();
      } else {
        zoomToPoint(touch.clientX, touch.clientY, defaultZoom);
        setZoomLevel(defaultZoom);
      }
      return;
    }
    lastTapRef.current = now;
    if (zoomLevel > minZoom) {
      touchPanRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startPan: pan,
      };
      swipeRef.current = null;
    } else {
      touchPanRef.current = null;
      swipeRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: now,
      };
    }
  };

  const onTouchEnd = (e) => {
    if (!enabled) return;
    if (e.touches.length === 0) {
      if (pinchRef.current && zoomLevel <= minZoom + 0.02) resetPan();
      pinchRef.current = null;
      touchPanRef.current = null;

      if (swipeRef.current && liveRef.current.zoomLevel <= minZoom) {
        const touch = e.changedTouches?.[0];
        if (touch) {
          const dx = touch.clientX - swipeRef.current.startX;
          const dy = touch.clientY - swipeRef.current.startY;
          const dt = Date.now() - swipeRef.current.startTime;
          // Natural swipe: within 500ms, >35px travel, and primarily horizontal
          if (
            dt < 500 &&
            Math.abs(dx) > 35 &&
            Math.abs(dx) > Math.abs(dy) * 1.2
          ) {
            if (dx < 0) swipeNavRef.current.onSwipeNext?.();
            else if (dx > 0) swipeNavRef.current.onSwipePrev?.();
          }
        }
      }
      swipeRef.current = null;
    }
  };

  // Mouse wheel and pinch/pan touchmove both need to block the page's own
  // scroll (preventDefault), but React's JSX onWheel/onTouchMove props are
  // attached as PASSIVE listeners by default — preventDefault() inside one
  // is silently a no-op there. (The page's own existing mobile pinch-zoom
  // hits this same issue; see its comment on onTouchMove in
  // pages/product-info/index.js.) That let the wheel/pinch gesture zoom the
  // image *and* scroll the page/overlay underneath at the same time. Fixed
  // by attaching real, non-passive listeners here instead. Re-attached
  // whenever the stage (re)mounts — it's inside a portal that only exists
  // while the viewer is open, so `ref.current` isn't there yet on the
  // hook's very first render.
  useEffect(() => {
    const el = ref.current;
    if (!isOpen || !el) return undefined;

    const handleWheel = (e) => {
      const { enabled, zoomLevel, pan } = liveRef.current;
      if (!enabled) return;
      e.preventDefault();
      const step = 0.4;
      const dir = e.deltaY < 0 ? 1 : -1;
      const next = clamp(roundZoom(zoomLevel + dir * step), minZoom, maxZoom);
      if (next === zoomLevel) return;
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      const imgX = (cx - pan.x) / zoomLevel;
      const imgY = (cy - pan.y) / zoomLevel;
      setPan(
        clampPan({ x: cx - imgX * next, y: cy - imgY * next }, next, rect)
      );
      setZoomLevel(next);
      if (next <= minZoom) resetPan();
    };

    const handleTouchMove = (e) => {
      const { enabled, zoomLevel } = liveRef.current;
      if (!enabled) return;
      const touches = e.touches;
      if (touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const ratio =
          getTouchDistance(touches) / pinchRef.current.startDistance;
        const next = clamp(
          roundZoom(pinchRef.current.startZoom * ratio),
          minZoom,
          maxZoom
        );
        const rect = el.getBoundingClientRect();
        setZoomLevel(next);
        setPan((p) => clampPan(p, next, rect));
        return;
      }
      if (touches.length === 1 && touchPanRef.current) {
        e.preventDefault();
        const dx = touches[0].clientX - touchPanRef.current.startX;
        const dy = touches[0].clientY - touchPanRef.current.startY;
        const rect = el.getBoundingClientRect();
        setPan(
          clampPan(
            {
              x: touchPanRef.current.startPan.x + dx,
              y: touchPanRef.current.startPan.y + dy,
            },
            zoomLevel,
            rect
          )
        );
        return;
      }
      if (touches.length === 1 && swipeRef.current) {
        // Prevent background or page scroll during horizontal swipe navigation
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isOpen, minZoom, maxZoom, defaultZoom]);

  return {
    ref,
    pan,
    isDragging,
    onMouseDown,
    onClick,
    onTouchStart,
    onTouchEnd,
    resetPan,
  };
}

/**
 * Reusable product-media fullscreen viewer: click (desktop) or an explicit
 * trigger button (any device) opens a portalled lightbox with direct-
 * manipulation zoom — wheel/click-to-zoom/drag on desktop, pinch/drag/
 * double-tap on touch — plus prev/next arrows, an image counter, and a
 * thumbnail strip (video thumbnails get a play-icon badge). No zoom slider
 * anywhere. Renders nothing for the inline trigger on touch/coarse-pointer
 * devices where a plain image click would conflict with an existing mobile
 * pinch/swipe gallery; the fullscreen viewer itself still supports the same
 * touch gestures once open, since it's a separate portalled surface.
 */
export default function useProductImageZoom({
  images = [],
  selectedIndex = 0,
  onSelectIndex,
  onPrev,
  onNext,
  getImageSrc = defaultGetImageSrc,
  getThumbSrc,
  getImageAlt = (item) => (typeof item === "string" ? "" : item?.alt || ""),
  minZoom = 1,
  maxZoom = 4,
  defaultZoom = 2,
  zoomStep = 0.5,
}) {
  const [isFinePointer, setIsFinePointer] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [zoomLevel, setZoomLevelState] = useState(minZoom);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsFinePointer(mq.matches);
    const handler = (e) => setIsFinePointer(e.matches);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  const hasImages = Array.isArray(images) && images.length > 0;
  const fullscreenSrc = hasImages ? getImageSrc(images[selectedIndex]) : "";
  const fullscreenAlt = hasImages ? getImageAlt(images[selectedIndex]) : "";
  const fullscreenIsVideo = isVideoSrc(fullscreenSrc);

  const setZoomLevel = (value) => {
    const next = clamp(roundZoom(value), minZoom, maxZoom);
    setZoomLevelState(next);
    if (next <= minZoom) stage.resetPan();
  };

  const canGoPrev = onPrev ? true : hasImages ? selectedIndex > 0 : false;
  const canGoNext = onNext
    ? true
    : hasImages
    ? selectedIndex < images.length - 1
    : false;

  const goPrev = () => {
    if (onPrev) return onPrev();
    if (hasImages && onSelectIndex && selectedIndex > 0)
      onSelectIndex(selectedIndex - 1);
  };
  const goNext = () => {
    if (onNext) return onNext();
    if (hasImages && onSelectIndex && selectedIndex < images.length - 1)
      onSelectIndex(selectedIndex + 1);
  };

  const stage = useStageZoomPan({
    zoomLevel,
    setZoomLevel,
    minZoom,
    maxZoom,
    defaultZoom,
    enabled: !fullscreenIsVideo,
    isOpen: isFullscreenOpen,
    onSwipePrev: goPrev,
    onSwipeNext: goNext,
  });

  // Automatically scroll thumbnail strip to keep active thumbnail in view
  const activeThumbRef = useRef(null);
  useEffect(() => {
    if (isFullscreenOpen && activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [selectedIndex, isFullscreenOpen]);

  // Every media change (thumbnail click, prev/next, or opening on whatever
  // was selected on the page) starts fresh at 1x — never inherits the last
  // media's zoom/pan.
  useEffect(() => {
    setZoomLevelState(minZoom);
    stage.resetPan();
  }, [fullscreenSrc]);

  const openFullscreen = () => setIsFullscreenOpen(true);

  const handleCloseFullscreen = () => setIsFullscreenOpen(false);

  // Keyboard nav needs the latest goPrev/goNext/handleCloseFullscreen (which
  // close over the current selectedIndex), but the scroll-lock effect below
  // must only run once on open and once on close — never on every index
  // change — or a stale/rewritten "previous overflow" value can leave the
  // page permanently unscrollable after closing. A ref bridges the two.
  const navRef = useRef(null);
  navRef.current = { goPrev, goNext, handleCloseFullscreen };

  useEffect(() => {
    if (!isFullscreenOpen || typeof document === "undefined") return undefined;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") navRef.current.handleCloseFullscreen();
      else if (e.key === "ArrowLeft") navRef.current.goPrev();
      else if (e.key === "ArrowRight") navRef.current.goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isFullscreenOpen]);

  // Desktop: clicking the existing main image opens fullscreen directly.
  // Left undefined on touch devices so it never fights the page's own
  // mobile swipe/pinch/double-tap gestures on that same inline image — those
  // reach fullscreen instead through FullscreenTrigger below.
  const onMainImageClick = isFinePointer ? openFullscreen : undefined;

  const FullscreenTrigger = (
    <button
      type="button"
      className={css.fullscreenBtn}
      onClick={openFullscreen}
      aria-label="View fullscreen"
    >
      <ExpandIcon />
    </button>
  );

  const zoomTransformStyle = {
    transform: `translate(${stage.pan.x}px, ${stage.pan.y}px) scale(${zoomLevel})`,
    transition: stage.isDragging ? "none" : "transform 0.15s ease",
  };

  const FullscreenViewer =
    isFullscreenOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className={css.fsOverlay}
            role="dialog"
            aria-modal="true"
            aria-label="Product media, fullscreen"
            onClick={(e) => {
              // Only when the click actually lands on the backdrop itself —
              // not when it bubbles up from the stage, controls, or
              // thumbnails, which each stop it being e.currentTarget.
              if (e.target === e.currentTarget) handleCloseFullscreen();
            }}
          >
            <button
              type="button"
              className={css.fsClose}
              onClick={handleCloseFullscreen}
              aria-label="Close"
            >
              <CloseIcon />
            </button>

            <div className={css.fsMain}>
              <div className={css.fsStageColumn}>
                {!fullscreenIsVideo ? (
                  <div className={css.fsControlsBar}>
                    <button
                      type="button"
                      className={css.controlBtn}
                      onClick={() => setZoomLevel(zoomLevel - zoomStep)}
                      disabled={zoomLevel <= minZoom}
                      aria-label="Zoom out"
                    >
                      <MinusIcon />
                    </button>
                    <span className={css.zoomReadout}>
                      {zoomLevel.toFixed(1)}x
                    </span>
                    <button
                      type="button"
                      className={css.controlBtn}
                      onClick={() => setZoomLevel(zoomLevel + zoomStep)}
                      disabled={zoomLevel >= maxZoom}
                      aria-label="Zoom in"
                    >
                      <PlusIcon />
                    </button>
                  </div>
                ) : null}

                <div className={css.fsBody}>
                  {hasImages && images.length > 1 ? (
                    <button
                      type="button"
                      className={`${css.fsNavBtn} ${css.fsNavPrev}`}
                      onClick={goPrev}
                      disabled={!canGoPrev}
                      aria-label="Previous media"
                    >
                      <ChevronLeftIcon />
                    </button>
                  ) : null}

                  <div
                    ref={stage.ref}
                    className={css.fsImageStage}
                    onMouseDown={stage.onMouseDown}
                    onClick={stage.onClick}
                    onTouchStart={stage.onTouchStart}
                    onTouchEnd={stage.onTouchEnd}
                    style={{
                      cursor: fullscreenIsVideo
                        ? "default"
                        : zoomLevel > minZoom
                        ? stage.isDragging
                          ? "grabbing"
                          : "grab"
                        : "zoom-in",
                    }}
                  >
                    {fullscreenIsVideo ? (
                      <video
                        key={fullscreenSrc}
                        src={fullscreenSrc}
                        className={css.fsVideo}
                        controls
                        playsInline
                        autoPlay
                      />
                    ) : fullscreenSrc ? (
                      <img
                        src={fullscreenSrc}
                        alt={fullscreenAlt}
                        className={css.fsImage}
                        style={zoomTransformStyle}
                        draggable={false}
                      />
                    ) : null}
                  </div>

                  {hasImages && images.length > 1 ? (
                    <button
                      type="button"
                      className={`${css.fsNavBtn} ${css.fsNavNext}`}
                      onClick={goNext}
                      disabled={!canGoNext}
                      aria-label="Next media"
                    >
                      <ChevronRightIcon />
                    </button>
                  ) : null}
                </div>
              </div>

              {hasImages && images.length > 1 ? (
                <div className={css.fsThumbStrip}>
                  {images.map((item, i) => {
                    const thumbSrc = (getThumbSrc || getImageSrc)(item);
                    const thumbIsVideo = isVideoSrc(getImageSrc(item));
                    return (
                      <button
                        type="button"
                        key={i}
                        ref={i === selectedIndex ? activeThumbRef : null}
                        className={`${css.fsThumb} ${
                          i === selectedIndex ? css.fsThumbActive : ""
                        }`}
                        onClick={() => onSelectIndex && onSelectIndex(i)}
                        aria-label={
                          thumbIsVideo ? `Video ${i + 1}` : `Image ${i + 1}`
                        }
                        aria-current={i === selectedIndex}
                      >
                        {thumbIsVideo ? (
                          <video
                            src={thumbSrc}
                            muted
                            playsInline
                            preload="metadata"
                          />
                        ) : (
                          <img src={thumbSrc} alt={getImageAlt(item)} />
                        )}
                        {thumbIsVideo ? (
                          <span className={css.fsThumbPlay} aria-hidden="true">
                            <PlayIcon />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>,
          document.body
        )
      : null;

  return {
    onMainImageClick,
    FullscreenTrigger,
    FullscreenViewer,
    openFullscreen,
  };
}
