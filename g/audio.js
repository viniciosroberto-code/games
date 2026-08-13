const bgMusic = new Audio("musica.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.5;

function initAudio() {
  const startAudio = () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(e => console.log("Aguardando interação para tocar o áudio"));
    }
  };

  window.addEventListener('keydown', startAudio, { once: true });
  window.addEventListener('click', startAudio, { once: true });
}

initAudio();