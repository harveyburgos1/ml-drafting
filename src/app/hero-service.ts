import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HeroDTO } from './DTO/heroDTO';

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  heroList: HeroDTO[] = [];
  constructor(private http: HttpClient) { }

  getHeroList() {
    return this.http.get('/hero/list').subscribe((data: any) => {
      this.heroList = data.data;
    });
  }
}
