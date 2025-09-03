console.log("listen melodify!!!!");

let currentSong = new Audio();
let songs = [];
let currfolder = "";
let songData = [];

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Load songs.json
async function loadSongsJson() {
    const response = await fetch("/songs.json");
    songData = await response.json();
}

// Load a folder's songs into playlist
function loadFolderSongs(folder) {
    currfolder = folder;
    const folderObj = songData.find(f => f.folder === folder);
    if (!folderObj) return;

    songs = folderObj.songs.map(s => s.file);

    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    folderObj.songs.forEach(song => {
        songUL.innerHTML += `
            <li>
                <img class="invert" width="34" src="img/music.svg" alt="">
                <div class="info">
                    <div>${song.title}</div>
                    <div>${folder}</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>
        `;
    });

    Array.from(songUL.getElementsByTagName("li")).forEach(li => {
        li.addEventListener("click", () => playMusic(li.querySelector(".info div").innerText));
    });
}

// Play a song
function playMusic(track, pause = false) {
    const songObj = songs.find(f => f.includes(track));
    if (!songObj) return;

    currentSong.src = songObj;
    if (!pause) currentSong.play();

    document.querySelector(".songinfo").innerText = track;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";

    document.getElementById("play").src = currentSong.paused ? "img/play.svg" : "img/pause.svg";
}

// Display albums/cards
function displayAlbums() {
    const container = document.querySelector(".cardContainer");
    container.innerHTML = "";

    songData.forEach(folder => {
        container.innerHTML += `
            <div data-folder="${folder.folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">
                        <g transform="translate(6,6) scale(0.85)">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" fill="#000" stroke-linejoin="round"/>
                            </svg>
                        </g>
                    </svg>
                </div>
                <img src="${folder.cover}" alt="${folder.folder}">
                <h2>${folder.folder}</h2>
            </div>
        `;
    });

    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", e => {
            loadFolderSongs(e.currentTarget.dataset.folder);
            playMusic(songs[0], true);
        });
    });
}

// Initialize everything
async function main() {
    await loadSongsJson();
    displayAlbums();
    loadFolderSongs("ncs"); // default folder
    playMusic(songs[0], true);

    const playBtn = document.getElementById("play");
    const prevBtn = document.getElementById("previous");
    const nextBtn = document.getElementById("next");
    const seekBar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");
    const volumeInput = document.querySelector(".range input");
    const volumeIcon = document.querySelector(".volume>img");

    // Play/pause toggle
    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "img/play.svg";
        }
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        circle.style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click
    seekBar.addEventListener("click", e => {
        const percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentSong.currentTime = currentSong.duration * percent;
        circle.style.left = percent * 100 + "%";
    });

    // Previous/Next
    prevBtn.addEventListener("click", () => {
        const index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) playMusic(songs[index - 1]);
    });
    nextBtn.addEventListener("click", () => {
        const index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => document.querySelector(".left").style.left = "0");
    document.querySelector(".close").addEventListener("click", () => document.querySelector(".left").style.left = "-450px");

    // Volume
    volumeInput.addEventListener("change", e => {
        currentSong.volume = e.target.value / 100;
        if (currentSong.volume > 0) volumeIcon.src = "img/volume.svg";
    });
    volumeIcon.addEventListener("click", () => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            volumeIcon.src = "img/mute.svg";
            volumeInput.value = 0;
        } else {
            currentSong.volume = 0.1;
            volumeIcon.src = "img/volume.svg";
            volumeInput.value = 10;
        }
    });
}

main();

