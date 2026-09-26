import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { audio } from "../game/audio";
import { STORY_CHAPTERS } from "../game/story";
import { Icon } from "./Icons";
import StoryIntel3D from "./StoryIntel3D";

interface Props {
  initialChapter?: number;
  voiceVolume?: number;
  onClose: () => void;
  onDeploy?: () => void;
}

export default function StoryCinematic({ initialChapter = 0, voiceVolume = 0.8, onClose, onDeploy }: Props) {
  const [index, setIndex] = useState(Math.max(0, Math.min(initialChapter, STORY_CHAPTERS.length - 1)));
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [replay, setReplay] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [caption, setCaption] = useState(0);
  const [hover, setHover] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const chapter = STORY_CHAPTERS[index];
  const voiceAvailable = typeof window !== "undefined" && "speechSynthesis" in window;

  const sentences = useMemo(
    () => (chapter.transmission.match(/[^.!?]+[.!?]+/g) ?? [chapter.transmission]).map((s) => s.trim()).filter(Boolean),
    [chapter.transmission],
  );

  // Per-chapter ambience + deep cinematic bed under the film
  useEffect(() => {
    audio.radioChatter();
    audio.startAmbient(chapter.ambience);
    audio.startStoryBed();
    if (chapter.id === "harbor") audio.braam();
    return () => {
      audio.stopAmbient();
      audio.stopStoryBed();
    };
  }, [chapter.id, chapter.ambience]);

  // (Re)load the chapter footage
  useEffect(() => {
    setVideoFailed(false);
    setVideoPaused(false);
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(() => setVideoPaused(true));
    }
  }, [chapter.id, chapter.video, replay]);

  // Caption track — sentences surface in rhythm with the radio transmission
  useEffect(() => {
    setCaption(0);
    if (sentences.length <= 1) return;
    const step = Math.max(1700, Math.min(3000, 9500 / sentences.length));
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      if (i >= sentences.length) window.clearInterval(timer);
      setCaption(Math.min(i, sentences.length - 1));
    }, step);
    return () => window.clearInterval(timer);
  }, [chapter.id, replay, sentences.length]);

  // Heavy commander narration of the transmission
  useEffect(() => {
    if (!voiceEnabled || !voiceAvailable || voiceVolume <= 0) {
      setSpeaking(false);
      audio.stopNarration();
      return;
    }
    let disposed = false;
    const timeout = window.setTimeout(() => {
      if (disposed) return;
      const ok = audio.narrateCommander(chapter.transmission, voiceVolume, {
        onStart: () => { if (!disposed) setSpeaking(true); },
        onEnd: () => { if (!disposed) setSpeaking(false); },
      });
      if (!ok) setSpeaking(false);
    }, 420);
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      audio.stopNarration();
    };
  }, [chapter.transmission, voiceEnabled, voiceAvailable, voiceVolume, replay]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((current) => Math.min(STORY_CHAPTERS.length - 1, current + 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((current) => Math.max(0, current - 1));
      } else if (event.key === " ") {
        event.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  useEffect(() => () => {
    videoRef.current?.pause();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || videoFailed) return;
    audio.ui();
    if (video.paused) {
      video.play().catch(() => setVideoPaused(true));
      setVideoPaused(false);
    } else {
      video.pause();
      setVideoPaused(true);
    }
  };

  const move = (step: number) => {
    audio.ui();
    setIndex((current) => Math.max(0, Math.min(STORY_CHAPTERS.length - 1, current + step)));
  };

  const parallax = { transform: `scale(1.1) translate(${hover.x * 1.6}%, ${hover.y * 1.1}%)` } as CSSProperties;
  const style = { "--story-accent": chapter.color } as CSSProperties;

  return (
    <div className="cinema-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="cinema-frame" style={style} role="dialog" aria-modal="true" aria-label="Duskline campaign story film">
        <div
          className="cinema-photo-area"
          onPointerMove={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            setHover({
              x: (event.clientX - box.left) / Math.max(1, box.width) - 0.5,
              y: (event.clientY - box.top) / Math.max(1, box.height) - 0.5,
            });
          }}
          onPointerLeave={() => setHover({ x: 0, y: 0 })}
        >
          {!videoFailed && chapter.video ? (
            <video
              ref={videoRef}
              className="cinema-video"
              src={chapter.video}
              poster={chapter.image}
              style={parallax}
              autoPlay
              muted
              loop
              playsInline
              onError={() => setVideoFailed(true)}
            />
          ) : (
            <div className="cinema-photo" style={{ backgroundImage: `url(${chapter.image})`, ...parallax }} />
          )}
          <div className="cinema-photo-shade" />
          <div className="cinema-letterbox top" />
          <div className="cinema-letterbox bottom" />
          <div className="cinema-video-tag"><span className="cinema-rec" /> LIVE-ACTION INTEL FEED</div>
          <div className="cinema-photo-top"><Icon name="crosshair" /> DUSKLINE / CLASSIFIED ARCHIVE</div>

          <div className="cinema-captions" aria-live="polite">
            <span key={`${chapter.id}-${caption}`} className="cinema-caption-line">
              {sentences[caption]}
            </span>
          </div>

          <div className="cinema-video-controls">
            <button type="button" onClick={togglePlay} aria-label={videoPaused ? "Play footage" : "Pause footage"}>
              {videoPaused ? "▶" : "❚❚"}
            </button>
            <button type="button" onClick={() => { audio.ui(); setReplay((current) => current + 1); }} aria-label="Replay chapter">
              ↻
            </button>
            <span className="cinema-tc">REEL {String(index + 1).padStart(2, "0")} · SC {String(caption + 1).padStart(2, "0")}</span>
          </div>

          <div className="cinema-photo-bottom">
            <span className="cinema-photo-index">{String(index + 1).padStart(2, "0")} <i>/</i> {String(STORY_CHAPTERS.length).padStart(2, "0")}</span>
            <span>{chapter.location}</span>
          </div>
        </div>

        <div className="cinema-info-area">
          <div className="cinema-head">
            <div className="cinema-head-brand"><span className="cinema-rec" /> FIELD TRANSMISSION <i> / </i> KITE-04</div>
            <button type="button" className="cinema-close" onClick={() => { audio.ui(); onClose(); }} aria-label="Close story">×</button>
          </div>

          <div className="cinema-scroll" key={`${chapter.id}-content`}>
            <div className="cinema-chapter">{chapter.chapter}</div>
            <h2>{chapter.title}</h2>
            <p className="cinema-text">{chapter.text}</p>
            <div className="cinema-transmission">
              <div className="cinema-transmission-head">
                <span>◉ COMMAND / ENCRYPTED RADIO</span>
                <div className={`cinema-wave${speaking ? " active" : ""}`} aria-hidden="true">
                  {Array.from({ length: 13 }, (_, i) => <i key={i} style={{ animationDelay: `${i * 0.09}s` }} />)}
                </div>
              </div>
              <blockquote>“{chapter.transmission}”</blockquote>
              <div className="cinema-voice-controls">
                <button type="button" onClick={() => { audio.ui(); setVoiceEnabled((current) => !current); }}>
                  {voiceEnabled ? "▣ NARRATION ON" : "□ NARRATION OFF"}
                </button>
                {voiceAvailable && voiceEnabled && (
                  <button type="button" onClick={() => { audio.ui(); setReplay((current) => current + 1); }}>↻ REPLAY TRANSMISSION</button>
                )}
                {!voiceAvailable && <span>Voice playback unavailable in this browser</span>}
              </div>
            </div>
            <div className="cinema-map-wrap">
              <div className="cinema-map-title"><span>◉</span> LIVE 3D INTEL ROUTE <small>FIVE THEATRES / ONE TARGET</small></div>
              <StoryIntel3D chapter={index} accent={chapter.color} />
            </div>
          </div>

          <div className="cinema-footer">
            <div className="cinema-progress" aria-label={`Chapter ${index + 1} of ${STORY_CHAPTERS.length}`}>
              {STORY_CHAPTERS.map((scene, i) => (
                <button
                  type="button"
                  key={scene.id}
                  className={i === index ? "active" : i < index ? "passed" : ""}
                  onClick={() => { audio.ui(); setIndex(i); }}
                  aria-label={`Go to ${scene.chapter}`}
                />
              ))}
            </div>
            <div className="cinema-nav">
              <button type="button" className="cinema-back" disabled={index === 0} onClick={() => move(-1)}>← PREVIOUS</button>
              {index < STORY_CHAPTERS.length - 1 ? (
                <button type="button" className="cinema-next" onClick={() => move(1)}>NEXT CHAPTER <span>→</span></button>
              ) : onDeploy ? (
                <button type="button" className="cinema-next" onClick={() => { audio.purchase(); onDeploy(); }}>BEGIN OPERATION <span>→</span></button>
              ) : (
                <button type="button" className="cinema-next" onClick={onClose}>BACK TO MISSION <span>→</span></button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
