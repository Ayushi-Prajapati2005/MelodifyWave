console.log("Melodify loaded!");

let currentSong = new Audio();
let songs = [];
let currfolder = "";

// Convert seconds to MM:SS
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Fetch songs.json
async function fetchSongsJson() {
    const response = await fetch("/songs.json");
    return await response.json();
}

// Display albums on the page
async function displayAlbums() {
    const data = await fetchSongsJson();
    const cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    data.forEach(folderData => {
        cardContainer.innerHTML += `
            <div data-folder="${folderData.folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">
                        <g transform="translate(6,6) scale(0.85)">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" fill="#000" stroke-linejoin="round"/>
                            </svg>
                        </g>
                    </svg>
                </div>
                <img src="${folderData.cover}" alt="${folderData.folder}">
                <h2>${folderData.folder}</h2>
            </div>
        `;
    });

    // Click event to load songs
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async e => {
            const folderName = e.currentTarget.dataset.folder;
            await loadSongs(folderName);
            playMusic(songs[0], true);
        });
    });
}

// Load songs from a folder
async function loadSongs(folder) {
    currfolder = folder;
    const data = await fetchSongsJson();
    const folderData = data.find(f => f.folder === folder);

    songs = folderData.songs.map(s => s.file);

    // Populate playlist
    const songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    folderData.songs.forEach(song => {
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

    // Click event to play song
    Array.from(songUL.getElementsByTagName("li")).forEach(li => {
        li.addEventListener("click", () => {
            playMusic(li.querySelector(".info div").innerText);
        });
    });
}

// Play a song
function playMusic(track, pause = false) {
    const songObj = songs.find(s => s.includes(track));
    if (!songObj) return;
    currentSong.src = songObj;
    if (!pause) currentSong.play();
    document.querySelector(".songinfo").innerText = track;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
    document.getElementById("play").src = currentSong.paused ? "img/play.svg" : "img/pause.svg";
}

// Main function
async function main() {
    await displayAlbums();
    await loadSongs("ncs"); // default folder
    playMusic(songs[0], true);

    // Play/pause toggle
    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            document.getElementById("play").src = "img/pause.svg";
        } else {
            currentSong.pause();
            document.getElementById("play").src = "img/play.svg";
        }
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentSong.currentTime = currentSong.duration * percent;
        document.querySelector(".circle").style.left = percent * 100 + "%";
    });

    // Previous/Next
    document.getElementById("previous").addEventListener("click", () => {
        const index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) playMusic(songs[index - 1]);
    });
    document.getElementById("next").addEventListener("click", () => {
        const index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    // Hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => document.querySelector(".left").style.left = "0");
    document.querySelector(".close").addEventListener("click", () => document.querySelector(".left").style.left = "-450px");

    // Volume
    const volumeInput = document.querySelector(".range input");
    const volumeIcon = document.querySelector(".volume>img");
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
