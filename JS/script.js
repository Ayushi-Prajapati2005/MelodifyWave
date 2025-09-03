console.log("listen melodify!!!!");
let currentSong = new Audio();
let songs = [];
let currfolder = "";
let songData = [];

// convert seconds to mm:ss
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// load songs.json
async function loadSongsJson() {
    try {
        let res = await fetch("/songs.json");
        if (!res.ok) throw new Error("songs.json not found");
        songData = await res.json();
    } catch (err) {
        console.error("Failed to load songs.json:", err);
        songData = [];
    }
}

// get songs of a folder from JSON
async function getSongs(folder) {
    currfolder = folder;
    let folderObj = songData.find(f => f.folder === folder);
    if (!folderObj) return [];

    // build full paths for audio files
    songs = folderObj.songs.map(s => `${folderObj.folder}/${s.file}`);

    // populate playlist
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    folderObj.songs.forEach(song => {
        songUL.innerHTML += `<li>
            <img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.title}</div>
                <div>${folderObj.folder}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    });

    // attach click events to play now
    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let clickedTitle = e.querySelector(".info div").innerHTML.trim();
            let songFile = folderObj.songs.find(s => s.title === clickedTitle);
            if (songFile) playMusic(`${folderObj.folder}/${songFile.file}`);
        });
    });

    return songs;
}

// play music
const playMusic = (track, pause = false) => {
    currentSong.src = `/${track}`;
    if (!pause) currentSong.play();
    document.querySelector(".songinfo").innerHTML = decodeURI(track.split("/").pop());
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    const playBtn = document.getElementById("play");
    playBtn.src = currentSong.paused ? "img/play.svg" : "img/pause.svg";
}

// display albums/cards
async function displayAlbums() {
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    songData.forEach(folder => {
        cardContainer.innerHTML += `<div data-folder="${folder.folder}" class="card">
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
            <p>${folder.description || ""}</p>
        </div>`;
    });

    // attach click to load playlist and play first song
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async item => {
            let folderName = item.currentTarget.dataset.folder;
            let folderSongs = await getSongs(folderName);
            if (folderSongs.length > 0) playMusic(folderSongs[0]);
        });
    });
}

// main
async function main() {
    await loadSongsJson();
    let defaultFolder = songData[0]?.folder || "";
    if (defaultFolder) {
        await getSongs(defaultFolder); // default folder
        if (songs.length > 0) playMusic(songs[0], true);
    }
    displayAlbums();

    const playBtn = document.getElementById("play");

    // play/pause
    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "img/play.svg";
        }
    });

    // time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentSong.currentTime = currentSong.duration * percent;
        document.querySelector(".circle").style.left = percent * 100 + "%";
    });

    // prev/next
    document.getElementById("previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.slice(1)); // remove leading '/'
        if (index > 0) playMusic(songs[index - 1]);
    });
    document.getElementById("next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.slice(1));
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    // hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => document.querySelector(".left").style.left = "0");
    document.querySelector(".close").addEventListener("click", () => document.querySelector(".left").style.left = "-450px");

    // volume
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
