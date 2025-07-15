import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private apiUrl = 'https://api.jamendo.com/v3.0';
  private clientId = '5a5f5ae3';

  constructor(private http: HttpClient) {}

  searchTracks(query: string): Observable<any> {
    const clientId = '5a5f5ae3';
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&format=json&limit=20&namesearch=${encodeURIComponent(query)}`;
    return this.http.get<any>(url);
  }

  getPlaylists(): Promise<any[]> {
    const url = `${this.apiUrl}/playlists/?client_id=${this.clientId}&format=json&type=featured&limit=20`;
    return this.http.get<any>(url).toPromise().then(res => {
      console.log('Jamendo playlists response:', res);
      return res.results;
    });
  }

  getPlaylistTracks(playlistId: string): Promise<any[]> {
    const url = `${this.apiUrl}/playlists/tracks/?client_id=${this.clientId}&id=${playlistId}&format=json`;
    return this.http.get<any>(url).toPromise()
      .then(res => res.results[0]?.tracks || [])
      .catch(err => {
        console.error('Failed to fetch playlist tracks:', err);
        return [];
      });
  }
}