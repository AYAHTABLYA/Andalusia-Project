import { useEffect, useRef, useState } from "react";
import type { ProgramVideo as ProgramVideoData } from "../../../Types/CatalogVideo";

type Props = {
  video: ProgramVideoData;
  title: string;
  poster?: string;
};

// MP4 player (English voice-over). The Arabic translation is read from a WebVTT track
// and shown in a bar right under the video, so it never covers the picture.
function ProgramVideo({ video, title, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [caption, setCaption] = useState("");
  const [showCaptions, setShowCaptions] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    const track = el?.textTracks[0];
    if (!el || !track) return;
    track.mode = "hidden"; // keep cues loading without the browser drawing them over the video
    const onCue = () => {
      const cues = Array.from(track.activeCues ?? []) as VTTCue[];
      setCaption(cues.map((c) => c.text).join("\n"));
    };
    track.addEventListener("cuechange", onCue);
    return () => track.removeEventListener("cuechange", onCue);
  }, [video.captionsAr]);

  if (failed) return null; // missing file: the page just shows no player

  return (
    <figure className="program-video">
      <video
        ref={videoRef}
        className="program-video_player"
        controls
        playsInline
        preload="metadata"
        poster={poster}
        aria-label={`${title} – program video`}
        onError={() => setFailed(true)}
        onEnded={() => setCaption("")}
      >
        <source src={video.src} type="video/mp4" />
        <track kind="subtitles" srcLang="ar" label="العربية" src={video.captionsAr} />
      </video>

      {showCaptions && (
        <div className="program-video_captions" dir="rtl" lang="ar" aria-live="polite">
          {caption || <span className="program-video_hint">الترجمة العربية ستظهر هنا أثناء التشغيل</span>}
        </div>
      )}

      <figcaption className="program-video_bar">
        <span className="program-video_label">
          <span className="material-symbols-outlined" aria-hidden="true">play_circle</span>
          Program overview · English audio
        </span>
        <button
          type="button"
          className="program-video_toggle"
          aria-pressed={showCaptions}
          onClick={() => setShowCaptions((v) => !v)}
        >
          <span className="material-symbols-outlined" aria-hidden="true">closed_caption</span>
          {showCaptions ? "إخفاء الترجمة" : "إظهار الترجمة"}
        </button>
      </figcaption>
    </figure>
  );
}

export default ProgramVideo;
