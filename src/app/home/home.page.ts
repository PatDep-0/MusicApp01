import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  songs: File[] = [];
  currentSongIndex = 0;
  isPlaying = false;
  isLooping = false;
  currentSongUrl: string | null = null;
  duration = 0;
  currentTime = 0;

  @ViewChild('audioPlayer', { static: false }) audioPlayer!: ElementRef<HTMLAudioElement>;

  get currentSong() {
    return this.songs[this.currentSongIndex];
  }

  onFileSelected(event: any) {
    const newFiles: File[] = Array.from(event.target.files as FileList);
    const existingNames = this.songs.map(f => f.name);
    const uniqueNewFiles = newFiles.filter((f: File) => !existingNames.includes(f.name));
    this.songs = [...this.songs, ...uniqueNewFiles];
    if (this.songs.length === uniqueNewFiles.length || !this.currentSong) {
      this.currentSongIndex = 0;
      this.loadSong();
    }
    event.target.value = '';
  }

  deleteSong(index: number) {
    this.songs.splice(index, 1);
    if (this.currentSongIndex >= this.songs.length) {
      this.currentSongIndex = this.songs.length - 1;
    }
    if (this.songs.length === 0) {
      this.currentSongUrl = null;
      this.isPlaying = false;
      this.currentTime = 0;
      this.duration = 0;
    } else {
      this.loadSong();
    }
  }

  loadSong() {
    if (this.currentSong) {
      this.currentSongUrl = URL.createObjectURL(this.currentSong);
      setTimeout(() => {
        this.play();
        this.resetTime();
      }, 100);
    }
  }

  playSong(index: number) {
    this.currentSongIndex = index;
    this.loadSong();
  }

  play() {
    this.audioPlayer?.nativeElement.play();
    this.isPlaying = true;
  }

  pause() {
    this.audioPlayer?.nativeElement.pause();
    this.isPlaying = false;
  }

  togglePlay() {
    this.isPlaying ? this.pause() : this.play();
  }

  nextSong() {
    if (this.songs.length > 1) {
      this.currentSongIndex = (this.currentSongIndex + 1) % this.songs.length;
      this.loadSong();
    }
  }

  prevSong() {
    if (this.songs.length > 1) {
      this.currentSongIndex =
        (this.currentSongIndex - 1 + this.songs.length) % this.songs.length;
      this.loadSong();
    }
  }

  toggleLoop() {
    this.isLooping = !this.isLooping;
    if (this.audioPlayer) {
      this.audioPlayer.nativeElement.loop = this.isLooping;
    }
  }

  onLoadedMetadata() {
    const audio = this.audioPlayer?.nativeElement;
    if (audio) {
      this.duration = audio.duration;
    }
  }

  onTimeUpdate() {
    const audio = this.audioPlayer?.nativeElement;
    if (audio) {
      this.currentTime = audio.currentTime;
    }
  }

  seekTo(event: any) {
    const value = event.target.value;
    if (this.audioPlayer) {
      this.audioPlayer.nativeElement.currentTime = value;
    }
  }

  onEnded() {
    if (!this.isLooping) {
      this.nextSong();
    }
  }

  resetTime() {
    this.duration = 0;
    this.currentTime = 0;
  }

  formatTime(time: number): string {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
