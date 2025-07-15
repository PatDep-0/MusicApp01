import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ServiceService } from '../service.service'; 
import { Storage } from '@capacitor/storage';

interface LocalTrack {
  name: string;
  artist: string;
  audio: string;
  image: string | null;
}

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.page.html',
  styleUrls: ['./playlist.page.scss'],
  standalone: false,
})
export class PlaylistPage implements OnInit {
  jamendoPlaylists: any[] = [];
  localPlaylists: any[] = [];
  selectedPlaylist: any = null;
  selectedPlaylistSource: 'jamendo' | 'local' | null = null;
  jamendoTracks: any[] = [];
  currentTrackIndex = 0;
  isPlaying = false;
  loopMode: 0 | 1 | 2 = 2;
  duration = 0;
  currentTime = 0;
  isLoadingTracks = false;

  @ViewChild('audioPlayer', { static: false }) audioPlayer!: ElementRef<HTMLAudioElement>;
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  constructor(private jamendoService: ServiceService) {}

  async ngOnInit() {
    this.jamendoPlaylists = await this.jamendoService.getPlaylists();
    this.loadLocalPlaylists();
  }

  async loadLocalPlaylists() {
    const { value } = await Storage.get({ key: 'localPlaylists' });
    this.localPlaylists = value ? JSON.parse(value) : [];
  }

  async saveLocalPlaylists() {
    await Storage.set({
      key: 'localPlaylists',
      value: JSON.stringify(this.localPlaylists),
    });
  }

  async selectPlaylist(playlist: any, source: 'jamendo' | 'local') {
    if (this.isLoadingTracks) return;
    this.isLoadingTracks = true;
    this.selectedPlaylistSource = source;
    this.currentTrackIndex = 0;
    this.isPlaying = false;
    this.duration = 0;
    this.currentTime = 0;

    try {
      if (source === 'jamendo') {
        this.selectedPlaylist = playlist;
        this.jamendoTracks = await this.jamendoService.getPlaylistTracks(playlist.id);
      } else {
        const idx = this.localPlaylists.findIndex(p => p.id === playlist.id);
        if (idx !== -1) {
          this.selectedPlaylist = this.localPlaylists[idx];
          if (!this.selectedPlaylist.tracks) this.selectedPlaylist.tracks = [];
        }
      }
    } catch {
      if (source === 'jamendo') this.jamendoTracks = [];
    } finally {
      setTimeout(() => { this.isLoadingTracks = false; }, 500);
    }
  }

  get tracks() {
    return this.selectedPlaylistSource === 'jamendo'
      ? this.jamendoTracks
      : (this.selectedPlaylist?.tracks || []);
  }

  get currentTrack() {
    return this.tracks[this.currentTrackIndex];
  }

  addLocalPlaylist() {
    const name = prompt('Enter Local playlist name:');
    if (name) {
      const newPlaylist = { name, id: Date.now(), image: null, tracks: [] };
      this.localPlaylists.push(newPlaylist);
      this.saveLocalPlaylists();
    }
  }

  deleteLocalPlaylist(playlist: any, event: Event) {
    event.stopPropagation();
    this.localPlaylists = this.localPlaylists.filter(p => p.id !== playlist.id);
    this.saveLocalPlaylists();
    if (this.selectedPlaylist && this.selectedPlaylist.id === playlist.id) {
      this.selectedPlaylist = null;
      this.selectedPlaylistSource = null;
    }
  }

  addTrackToPlaylist() {
    if (!this.selectedPlaylist) return;

    const name = prompt('Track name?');
    const artist = prompt('Artist name?');
    const audio = prompt('Audio URL?');
    const image = prompt('Image URL?');

    if (!name || !audio) return;

    const duplicate = this.tracks.some(
      (track: LocalTrack) => track.name === name || track.audio === audio
    );

    if (duplicate) {
      alert('Track already exists in this playlist.');
      return;
    }

    const newTrack = { name, artist, audio, image };

    if (this.selectedPlaylistSource === 'jamendo') {
      this.jamendoTracks.push(newTrack);
    } else {
      this.selectedPlaylist.tracks.push(newTrack);
      this.saveLocalPlaylists();
    }
  }

  deleteTrackFromPlaylist(index: number, event: Event) {
    event.stopPropagation();
    if (this.selectedPlaylistSource === 'jamendo') {
      this.jamendoTracks.splice(index, 1);
    } else {
      this.selectedPlaylist.tracks.splice(index, 1);
      this.saveLocalPlaylists();
    }
  }

  onLocalFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    const addFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const audioUrl = reader.result as string;
        const name = file.name.replace(/\.[^/.]+$/, "");
        if (!this.selectedPlaylist.tracks) this.selectedPlaylist.tracks = [];
        const duplicate = this.selectedPlaylist.tracks.some(
          (track: LocalTrack) => track.name === name || track.audio === audioUrl
        );
        if (duplicate) {
          return;
        }
        const newTrack = {
          name,
          artist: 'Local',
          audio: audioUrl,
          image: null
        };
        this.selectedPlaylist.tracks.push(newTrack);
        this.saveLocalPlaylists();
      };
      reader.readAsDataURL(file);
    };

    Array.from(files).forEach(file => addFile(file));
    this.fileInput.nativeElement.value = '';
  }

  playTrack(index: number) {
    this.currentTrackIndex = index;
    setTimeout(() => this.play(), 100);
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

  nextTrack() {
    if (this.tracks.length > 1) {
      if (this.currentTrackIndex < this.tracks.length - 1) {
        this.currentTrackIndex++;
      } else if (this.loopMode === 2) {
        this.currentTrackIndex = 0;
      } else {
        this.pause();
        return;
      }
      setTimeout(() => this.play(), 100);
    }
  }

  prevTrack() {
    if (this.tracks.length > 1) {
      if (this.currentTrackIndex > 0) {
        this.currentTrackIndex--;
      } else if (this.loopMode === 2) {
        this.currentTrackIndex = this.tracks.length - 1;
      } else {
        this.pause();
        return;
      }
      setTimeout(() => this.play(), 100);
    }
  }

  toggleLoopPlaylist() {
    this.loopMode = (this.loopMode + 1) % 3 as 0 | 1 | 2;
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
    const value = Number(event.target.value);
    if (this.audioPlayer && this.audioPlayer.nativeElement) {
      this.audioPlayer.nativeElement.currentTime = value;
      this.currentTime = value;
    }
  }

  onEnded() {
    if (this.loopMode === 1) {
      const audio = this.audioPlayer?.nativeElement;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
      }
    } else if (this.loopMode === 2) {
      if (this.currentTrackIndex < this.tracks.length - 1) {
        this.nextTrack();
      } else {
        this.currentTrackIndex = 0;
        setTimeout(() => this.play(), 100);
      }
    } else {
      this.pause();
    }
  }

  formatTime(time: number): string {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
}
