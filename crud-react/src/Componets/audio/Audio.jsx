import React, { useEffect, useRef } from 'react';
import './Audio.css';

function Audio({ AudioToSpeak, audio_ref }) {
  const playBtnRef = useRef(null);
  const seekRef = useRef(null);
  const currentRef = useRef(null);
  const durationRef = useRef(null);
  const volRef = useRef(null);
  const muteBtnRef = useRef(null);

  function formatTime(sec) {
    sec = Math.floor(sec) || 0;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ':' + (s < 10 ? '0' + s : s);
  }

  useEffect(() => {
    const audio = audio_ref.current;
    const playBtn = playBtnRef.current;
    const seek = seekRef.current;
    const currentEl = currentRef.current;
    const durationEl = durationRef.current;
    const vol = volRef.current;
    const muteBtn = muteBtnRef.current;

    if (!audio) return; // seguridad

    const onLoadedMetadata = () => {
      seek.max = audio.duration;
      durationEl.textContent = formatTime(audio.duration);
    };

    const togglePlay = () => {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    };

    const onPlay = () => {
      playBtn.textContent = '⏸';
      playBtn.setAttribute('aria-label', 'Pausar');
    };

    const onPause = () => {
      playBtn.textContent = '▶';
      playBtn.setAttribute('aria-label', 'Reproducir');
    };

    const onTimeUpdate = () => {
      seek.value = audio.currentTime;
      currentEl.textContent = formatTime(audio.currentTime);
    };

    const onSeekChange = () => {
      audio.currentTime = seek.value;
    };

    const onVolumeChange = () => {
      audio.volume = vol.value;
      audio.muted = audio.volume === 0;
    };

    const toggleMute = () => {
      audio.muted = !audio.muted;
      muteBtn.textContent = audio.muted ? '🔇' : '🔊';
    };

    const onKeyDown = (e) => {
      if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        if (audio.paused) audio.play(); else audio.pause();
      }
    };

    const onLoadedData = () => {
      if (isNaN(audio.duration)) durationEl.textContent = '--:--';
    };

    // Añadir listeners
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    playBtn.addEventListener('click', togglePlay);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    document.addEventListener('keydown', onKeyDown);
    audio.addEventListener('loadeddata', onLoadedData);

    // Limpieza
    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      playBtn.removeEventListener('click', togglePlay);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      document.removeEventListener('keydown', onKeyDown);
      audio.removeEventListener('loadeddata', onLoadedData);  
    };
  }, [audio_ref]);

  return (
    <div className="player" aria-label="Reproductor de audio personalizado">
      <audio ref={audio_ref} preload="metadata">
        <source src={AudioToSpeak} type="audio/mpeg" />
        Tu navegador no soporta audio.
      </audio>

  
      <div style={{ height: '12px' }}></div>

      <div className="row">
            <div className="">
          <button ref={playBtnRef} className="btn audiob" aria-label="Reproducir">▶</button>
        </div>
        <div className="progress" aria-hidden="false">
          <input ref={seekRef} type="range" min="0" max="100" defaultValue="0" step="0.1" aria-label="Barra de progreso" />
        </div>
        <div className="time" aria-live="polite">
          <span ref={currentRef}>0:00</span> / <span ref={durationRef}>0:00</span>
        </div>
      </div>

    </div>
  );
}

export default Audio;
