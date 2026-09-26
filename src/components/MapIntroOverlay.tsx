import { useEffect, useRef, useState } from "react";
import { audio } from "../game/audio";
import type { MapId } from "../game/data";
import { MAP_ARCS, STORY_CHAPTERS } from "../game/story";

interface Props {
  mapId: MapId;
  voiceVolume: number;
  onComplete: () => void;
}

export default function MapIntroOverlay({ mapId, voiceVolume, onComplete }: Props) {
  const chapter = STORY_CHAPTERS.find((c) => c.mapId === mapId) ?? STORY_CHAPTERS[1];
  const arc = MAP_ARCS[mapId];
  const videoRef = useRef<HTMLVideoElement>(null);
  const doneRef = useRef(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [caption, setCaption] = useState(0);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const sentences = (chapter.transmission.match(/[^.!?]+[.!?]+/g) ?? [chapter.transmission])
    .map((s) => s.trim())
    .filter(Boolean);

  const finish = (skip = false) => {
    if (doneRef.current) return;
    doneRef.current = true;
    setLeaving(true);
    audio.stopNarration();
    if (skip) audio.ui();
    // Let the fade-out breathe before the briefing appears
    window.setTimeout(() => onComplete(), 550);
  };

  // Gentle cinematic entrance: black fade → letterbox → footage → voice
  useEffect(() => {
    const enterTimer = window.setTimeout(() => setEntered(true), 80);
    audio.ensure();
    audio.storySting();
    audio.radioChatter();
    audio.startAmbient(chapter.ambience);
    audio.startStoryBed();
    const v = videoRef.current;
    if (v) {
      v.load();
      v.play().catch(() => setPaused(true));
    }
    // Heavy commander voice starts only after the picture has settled
    const voiceTimer = window.setTimeout(() => {
      if (voiceVolume > 0) {
        audio.narrateCommander(chapter.transmission, voiceVolume);
      }
    }, 1400);
    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(voiceTimer);
      audio.stopNarration();
      audio.stopStoryBed();
      audio.stopAmbient();
      videoRef.current?.pause();
    };
  }, [chapter.ambience, chapter.transmission, voiceVolume]);

  useEffect(() => {
    if (sentences.length <= 1) return;
    let i = 0;
    const t = window.setInterval(() => {
      i += 1;
      if (i >= sentences.length) window.clearInterval(t);
      setCaption(Math.min(i, sentences.length - 1));
    }, 2600);
    return () => window.clearInterval(t);
  }, [sentences.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        finish(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onComplete]);

  const ready = entered && (videoReady || failed);

  return (
    <div
      className={`mapintro-overlay${entered ? " entered" : ""}${leaving ? " leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={`${arc.title} intro film`}
    >
      {!failed ? (
        <video
          ref={videoRef}
          className={`mapintro-video${videoReady ? " ready" : ""}`}
          src={chapter.video}
          poster={chapter.image}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={() => setVideoReady(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="mapintro-fallback ready" style={{ backgroundImage: `url(${chapter.image})` }} />
      )}
      <div className="mapintro-shade" />
      <div className="cinema-letterbox top" />
      <div className="cinema-letterbox bottom" />

      {!ready && !leaving && (
        <div className="mapintro-uplink">
          <span className="mapintro-uplink-dot" />
          ESTABLISHING SECURE UPLINK…
        </div>
      )}

      <div className={`mapintro-content${ready ? " ready" : ""}`}>
        <div className="mapintro-top">
          <span className="mapintro-act">{chapter.chapter}</span>
          <span className="mapintro-loc">{chapter.location}</span>
        </div>
        <div className="mapintro-center">
          <h2>{chapter.title}</h2>
          <p>{chapter.text}</p>
          <div className="mapintro-caption" aria-live="polite">
            <span key={caption} className="cinema-caption-line">“{sentences[caption]}”</span>
          </div>
        </div>
        <div className="mapintro-bottom">
          <div className="mapintro-controls">
            {!failed && (
              <button
                type="button"
                onClick={() => {
                  const v = videoRef.current;
                  if (!v) return;
                  audio.ui();
                  if (v.paused) {
                    v.play().catch(() => undefined);
                    setPaused(false);
                  } else {
                    v.pause();
                    setPaused(true);
                  }
                }}
              >
                {paused ? "▶ PLAY FILM" : "❚❚ PAUSE FILM"}
              </button>
            )}
          </div>
          <button type="button" className="deploy-btn mapintro-continue" onClick={() => { audio.purchase(); finish(); }}>
            Continue to briefing <span>→</span>
          </button>
          <span className="mapintro-hint">ESC / ENTER to skip</span>
        </div>
      </div>
    </div>
  );
}
