const tracks = [
  {
    id: "track-1",
    title: "Summer Beats",
    artist: "Spotlight Mix",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    videoSrc: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
    audioOnly: true,
    videoOnly: true,
  },
  {
    id: "track-2",
    title: "Cinematic Drive",
    artist: "Studio One",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    videoSrc: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
    audioOnly: true,
    videoOnly: true,
  },
  {
    id: "track-3",
    title: "Focus Loop",
    artist: "Deep Chill",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    videoSrc: "",
    audioOnly: true,
    videoOnly: false,
  },
];

const playlistElement = document.getElementById("playlist");
const playAudioButton = document.getElementById("play-audio");
const playVideoButton = document.getElementById("play-video");
const stopButton = document.getElementById("stop-btn");
const audioPlayer = document.getElementById("audio-player");
const videoPlayer = document.getElementById("video-player");
const playerInfo = document.getElementById("player-info");
const mediaPreview = document.getElementById("media-preview");

let activeTrack = null;
let activeMode = null;

function createTrackCard(track, index) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "track-card";
  card.dataset.trackId = track.id;
  card.innerHTML = `
    <div class="track-number">${index + 1}</div>
    <div class="track-details">
      <div class="track-name">${track.title}</div>
      <div class="track-artist">${track.artist}</div>
      <div class="track-badges">
        <span class="badge">Audio</span>
        ${track.videoOnly ? '<span class="badge">Video</span>' : ""}
      </div>
    </div>
  `;

  card.addEventListener("click", () => setActiveTrack(track, card));
  return card;
}

function setActiveTrack(track, card) {
  activeTrack = track;
  activeMode = null;
  const trackCards = document.querySelectorAll(".track-card");
  trackCards.forEach((item) => item.classList.remove("active"));
  card.classList.add("active");

  playAudioButton.disabled = !Boolean(track.audioSrc);
  playVideoButton.disabled = !Boolean(track.videoSrc);
  stopButton.disabled = false;

  audioPlayer.hidden = true;
  videoPlayer.hidden = true;
  audioPlayer.pause();
  videoPlayer.pause();

  playerInfo.innerHTML = `
    <div class="track-meta">
      <span class="track-label">Ready to play</span>
      <h2 class="track-title">${track.title}</h2>
      <p class="track-subtitle">${track.artist} — pick audio or video below.</p>
    </div>
  `;
}

function renderPlaylist() {
  tracks.forEach((track, index) => {
    const card = createTrackCard(track, index);
    playlistElement.appendChild(card);
  });
}

function playAudio() {
  if (!activeTrack) return;
  activeMode = "audio";
  audioPlayer.src = activeTrack.audioSrc;
  audioPlayer.hidden = false;
  videoPlayer.hidden = true;
  videoPlayer.pause();
  audioPlayer.play().catch(() => {
    alert("Audio playback is blocked by the browser. Try clicking the play button again.");
  });
}

function playVideo() {
  if (!activeTrack || !activeTrack.videoSrc) return;
  activeMode = "video";
  videoPlayer.src = activeTrack.videoSrc;
  videoPlayer.hidden = false;
  audioPlayer.hidden = true;
  audioPlayer.pause();
  videoPlayer.play().catch(() => {
    alert("Video playback is blocked by the browser. Try clicking the play button again.");
  });
}

function stopPlayback() {
  if (activeMode === "audio") {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }
  if (activeMode === "video") {
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
  }
  activeMode = null;
  audioPlayer.hidden = true;
  videoPlayer.hidden = true;
}

playAudioButton.addEventListener("click", playAudio);
playVideoButton.addEventListener("click", playVideo);
stopButton.addEventListener("click", stopPlayback);

renderPlaylist();
