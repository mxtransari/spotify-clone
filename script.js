console.log("chal rha h ");

let playBtn = document.querySelector("#playb");

let songs;
let currentSong = new Audio();
let currentFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currentFolder = folder;

  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  console.log(as);

  songs = [];
  for (let index = 0; index < as.length; index++) {
    const elementS = as[index];
    if (elementS.href.endsWith(".mp3")) {
      console.log(elementS.href.split(`/${folder}/`)[1]);
      songs.push(elementS.href.split(`/${folder}/`)[1]);
    }
  }

  let songUL = document
    .querySelector(".playlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";

  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `
       <li>
           <div class="music-icon">
               <i class="bi bi-music-note-beamed"></i>
           </div>
           <div class="songbox">
               <div class="song-name">
                   ${song.replaceAll("%20", " ")}  
               </div>
               <div class="singer">
                   Atif Aslam
               </div>
           </div>
           <div class="playnow">
               <span class="play-n-text">Play Now</span>
              <a class="playbtn">
                   <i class="bi bi-play-fill"></i>
               </a>
           </div>
       </li>`;
  }

  // Attach an event listener to each song
  Array.from(
    document.querySelector(".playlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".songbox").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currentFolder}/` + track;
  // console.log(currentSong.src);
  // currentSong.play()

  if (!pause) {
    currentSong.play();
    playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
  }

  let songInfo = document.querySelector(".song-info");

  // let songName = decodeURI(track);

  songInfo.innerHTML = `<div class="music-icon">
                                <i class="bi bi-music-note-beamed"></i>

                            </div>
                            <div class="songbox">
                                <div class="song-name">
                                  ${decodeURI(track)}
                                </div>  
                                <div class="singer">
                                  Atif Aslam
                                </div>
                            </div>`;

  // Before playing, set initial time and reset duration
  let playTimeElements = document.querySelectorAll(".play-time");
  playTimeElements[0].innerHTML = "00:00"; // Left side - current time
  playTimeElements[1].innerHTML = "00:00"; // Right side - total duration
};

async function displayAlbums() {
  // console.log("displaying albums")
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");

  let cardContainer = document.querySelector(".artist-cards");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      // console.log(e.href.split("/").slice(-1)[0]);
      let folder = e.href.split("/").slice(-1)[0];

      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      // console.log(response);

      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">

                            <span class="spotify-play-btn">
                                <i class="bi bi-play-fill"></i>
                            </span>

                            <img src="./songs/${folder}/cover.jfif" alt="">
                            <div class="card-content">

                                <h3>${response.title}</h3>
                                <p>${response.description}</p>
                            </div>
                        </div>`;
    }
  }

  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching Songs");
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}



async function main() {
  await getSongs("songs/artistfolder");
  // console.log("main k song", songs);

  playMusic(songs[0], true);

  displayAlbums();

  let playBtn = document.querySelector("#playb");

  //  song play & pause event ---------
  playBtn.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      // playMusic(songs[0]);

      playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
    } else {
      currentSong.pause();
      playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.duration);
    // document.querySelector(".play-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} `
    let playTimeElements = document.querySelectorAll(".play-time");
    playTimeElements[0].innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}`;
    playTimeElements[1].innerHTML = `${secondsToMinutesSeconds(
      currentSong.duration
    )}`;

    let seekDot = document.querySelector(".seek-dot");
    seekDot.style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to seekbar
  document.querySelector(".seek-bar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".seek-dot").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener for hamburger
  document.querySelector(".playlist-toggle").addEventListener("click", () => {
    document.querySelector(".left-box").style.left = "0";
  });

  // Add an event listener for close button
  document.querySelector(".closebtn").addEventListener("click", () => {
    document.querySelector(".left-box").style.left = "-120%";
  });

  let next = document.querySelector(".nextbtn");
  let previous = document.querySelector(".prevbtn");

  // Add an event listener to previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listener to next
  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("Next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      // console.log("Setting volume to", e.target.value, "/ 100")
      currentSong.volume = parseInt(e.target.value) / 100;
      // if (currentSong.volume >0){
      //     document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
      // }
    });

  // Add event listener to mute the track
  let volumeIcon = document.querySelector(".voice-icon>i");

  volumeIcon.addEventListener("click", (e) => {
    console.log(e.target.classList);

    if (e.target.classList.contains("bi-volume-down")) {
      // Volume ko mute karo
      e.target.classList.replace("bi-volume-down", "bi-volume-mute");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      // Volume ko wapas low karo
      e.target.classList.replace("bi-volume-mute", "bi-volume-down");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 20;
    }
  });

  //   // Load the playlist whenever card is clicked
  //   Array.from(document.getElementsByClassName("card")).forEach(e => {
  //     e.addEventListener("click", async item => {
  //         console.log("Fetching Songs")
  //         songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
  //         playMusic(songs[0])

  //     })
  // })
}
main();
