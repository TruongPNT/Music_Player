const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'PNT_Player';

const cd = $('.cd');
const player = $('.player');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Đi Để Trở Về 1',
            singer: 'Soobin Hoàng Sơn',
            path: './assets/music/Đi để trở về.mp3',
            image: './assets/img/đi để trở về 1.jpg',
        },
        {
            name: 'Đi Để Trở Về 2',
            singer: 'Soobin Hoàng Sơn',
            path: './assets/music/Chuyen-Di-Cua-Nam-Di-De-Tro-Ve-2-SOOBIN.mp3',
            image: './assets/img/đi để trở về 2.jpg',
        },
        {
            name: 'Đi Để Trở Về 3',
            singer: 'Soobin Hoàng Sơn X DaLab',
            path: './assets/music/Se-Hua-Di-Cung-Nhau-Di-De-Tro-Ve-3-SOOBIN-Da-LAB.mp3',
            image: './assets/img/đi để trở về 3.jpg',
        },
        {
            name: 'Đi Để Trở Về 4',
            singer: 'Phan Mạnh Quỳnh',
            path: './assets/music/Tet-Ve-Som-Nhe-Di-De-Tro-Ve-4-Phan-Manh-Quynh.mp3',
            image: './assets/img/đi để trở về 4.jpg',
        },
        {
            name: 'Tết Chỉ Cần Được Trở Về',
            singer: 'HƯƠNG TRÀM x TIÊN COOKIE',
            path: './assets/music/Di De Tro Ve 5 - Tet Chi Can Duoc Tro Ve.mp3',
            image: './assets/img/đi để trở về 5.jpg',
        },
    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function (){
        const htmls = this.songs.map((song, index)=> {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    },

    defineProperties: function (){
        Object.defineProperty(this, 'currentSong', {
            get: function (){
                return this.songs[this.currentIndex];
            }
        })
        
    },

    handleEvents: function (){
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration : 10000, //10 seconds
            iterations : Infinity
        });
        cdThumbAnimate.pause();

        // xử lý phóng to thu nhỏ cd
        document.onscroll = function (){
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = (newCdWidth > 0 ) ? newCdWidth + 'px': 0;
            cd.style.opacity = (newCdWidth / cdWidth);
        }

        // xử lý khi click play
        playBtn.onclick = function (){
            if(_this.isPlaying){
                audio.pause();
            } else {
                audio.play();
            }
        }

        // khi song được play
        audio.onplay = function (){
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // khi song bị pause
        audio.onpause = function (){
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function (){
            if (audio.duration){
                const progressPercent = Math.floor( audio.currentTime / audio.duration * 100 );
                progress.value = progressPercent;
            }
            
        }

        // xử lý khi tua bài hát 
        progress.oninput = function(e){
            const seekTime = (audio.duration * e.target.value) / 100 ;
            audio.currentTime = seekTime;
        }

        // khi next bài hát
        nextBtn.onclick = function (){
            if (_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        //khi trở lại bài hát trước
        prevBtn.onclick = function (){
            if (_this.isRandom){
                _this.playRandomSong();
            }else{
                _this.prevSong();
            }
            audio.play(); 
            _this.render();     
        }

        //xử lý random bật/tắt random song
        randomBtn.onclick = function (){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // xử lý phát lại 1 song
        repeatBtn.onclick = function (){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }


        // xử lý next song khi audio ended
        audio.onended = function (){
            if (_this.isRepeat){
                audio.play();
            }else {
                nextBtn.click();
            }
            
        }

        // lắng nghe hành vi click vào playlist
        playlist.onclick = function (e){
            const songNode = e.target.closest('.song:not(.active)');
            // xử lý khi click vào song 
            if ( songNode || !e.target.closet('.option') ){
                // xử lý khi click vào trong
                if (songNode){
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }


                // xử lý khi click vào song option
                if (e.target.closet('.option')){

                }
            }
        }

    },

    scrollToActiveSong: function (){
        setTimeout(function (){
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                blocked: 'nearest',
            });
        }, 300);
    },

    loadCurrentSong: function (){

        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;

    },

    loadConfig: function (){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;

    },

    nextSong: function (){
        this.currentIndex++ ;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    prevSong: function (){
        this.currentIndex-- ;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },

    playRandomSong: function (){
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        }while(newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    start: function(){
        //gán cấu hình từ config vào ứng dụng
        this.loadConfig()

        // định nghĩa các thuộc tính cho object
        this.defineProperties();

        // lắng nghe / xử lý các sự kiện (DOM events)
        this.handleEvents();

        // tải thông tin bài hát đầu tiên vào UI(user interface) khi chạy ứng dụng
        this.loadCurrentSong();

        // render playlist
        this.render();

        // hiển thị trạng thái ban đầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    }
};

app.start();