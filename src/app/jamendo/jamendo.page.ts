import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ServiceService } from '../service.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-jamendo',
  templateUrl: './jamendo.page.html',
  styleUrls: ['./jamendo.page.scss'],
  standalone: false,
})
export class JamendoPage {
  @ViewChild('audioPlayer', { static: false }) audioPlayerRef!: ElementRef<HTMLAudioElement>;

  searchQuery = '';
  tracks: any[] = [];
  currentTrackIndex: number = -1;
  currentTrack: any = null;
  isPlaying = false;
  loopMode: 0 | 1 | 2 = 0;
  currentTime = 0;
  duration = 0;
  showPlayerModal = false;

  constructor(
    private jamendoService: ServiceService,
  ) {}

  onSearch() {
    this.jamendoService.searchTracks(this.searchQuery).subscribe((data: any) => {
      this.tracks = data.results;
    });
  }

  selectTrack(index: number) {
    this.currentTrackIndex = index;
    this.currentTrack = this.tracks[index];
    this.currentTime = 0;
    this.duration = 0;
    setTimeout(() => this.playAudio());
  }

  openPlayer(index: number) {
    this.currentTrackIndex = index;
    this.currentTrack = this.tracks[index];
    setTimeout(() => this.playAudio());
  }

  closePlayer() {
    this.isPlaying = false;
    this.currentTrack = null;
    this.currentTrackIndex = -1;
    if (this.audioPlayerRef) {
      this.audioPlayerRef.nativeElement.pause();
    }
  }

  playAudio() {
    const audio = this.audioPlayerRef.nativeElement;
    audio.play();
    this.isPlaying = true;
  }

  togglePlayPause() {
    const audio = this.audioPlayerRef.nativeElement;
    if (audio.paused) {
      audio.play();
      this.isPlaying = true;
    } else {
      audio.pause();
      this.isPlaying = false;
    }
  }

  toggleLoop() {
    this.loopMode = (this.loopMode + 1) % 3 as 0 | 1 | 2;
  }

  nextTrack() {
    if (this.currentTrackIndex < this.tracks.length - 1) {
      this.selectTrack(this.currentTrackIndex + 1);
    }
  }


  previousTrack() {
    if (this.currentTrackIndex > 0) {
      this.selectTrack(this.currentTrackIndex - 1);
    }
  }

  onTimeUpdate() {
    const audio = this.audioPlayerRef.nativeElement;
    this.currentTime = audio.currentTime;
  }

  onLoadedMetadata() {
    const audio = this.audioPlayerRef.nativeElement;
    this.duration = audio.duration;
  }

  onEnded() {
    if (this.loopMode === 1) {
      this.audioPlayerRef.nativeElement.currentTime = 0;
      this.audioPlayerRef.nativeElement.play();
    } else if (this.loopMode === 2) {
      if (this.currentTrackIndex < this.tracks.length - 1) {
        this.nextTrack();
      } else {
        this.selectTrack(0);
      }
    } else {
      this.isPlaying = false;
    }
  }

  seek(event: any) {
    const audio = this.audioPlayerRef.nativeElement;
    audio.currentTime = event.detail.value;
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}

