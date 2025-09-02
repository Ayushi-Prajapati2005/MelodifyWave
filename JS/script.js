console.log("listen melodify!!!!");

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
    let response = await fetch("/songs.json");
    let data = await response.json();
    return data;
}

// Display albums on the page
async function displayAlbums() {
    let data = await fetchSongsJson();
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    data.forEach(folderData => {
        const folder = folderData.folder;
        const cover = folderData.cover;
        const title = folderData.folder;

        cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">
                        <g transform="translate(6,6) scale(0.85)">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" fill="#000" stroke-linejoin="round"/>
                            </svg>
                        </g>
                    </svg>
                </div>
                <img src="${cover}" alt="${title}">
                <h2>${title}</h2>
            </div>
        `;
    });

    // Add click event to load songs from album
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async e => {
            const folderName = e.currentTarget.dataset.folder;
            await getSongs(folderName);
            playMusic(songs[0], true);
        });
    });
}

// Load songs from a specific folder
async function getSongs(folder) {
    currfolder = folder;
    let data = await fetchSongsJson();
    let folderData = data.find(f => f.folder === folder);
    songs = folderData.songs.map(s => s.file);

    // Show playlist
    let songUL = document.querySelector(".songList ul");
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

    // Add click event to play song
    Array.from(songUL.getElementsByTagName("li")).forEach(li => {
        li.addEventListener("click", () => {
            playMusic(li.querySelector(".info div").innerText);
        });
    });
}

// Play a song
function playMusic(track, pause = false) {
    const songObj = songs.find(s => s.includes(track));
    currentSong.src = songObj;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerText = track;
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}

// Main function
async function main() {
    await displayAlbums();
    await getSongs("ncs"); // default folder
    playMusic(songs[0], true);

    // Play/pause toggle
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentSong.currentTime = currentSong.duration * percent;
        document.querySelector(".circle").style.left = percent * 100 + "%";
    });

    // Hamburger toggle
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-450px";
    });

    // Previous song
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index - 1 >= 0) playMusic(songs[index - 1]);
    });

    // Next song
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) playMusic(songs[index + 1]);
    });

    // Volume
    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = "img/volume.svg";
        }
    });

    // Mute toggle
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            e.target.src = "img/mute.svg";
            document.querySelector(".range input").value = 0;
        } else {
            currentSong.volume = 0.1;
            e.target.src = "img/volume.svg";
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
