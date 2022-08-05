import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HeroDTO } from './DTO/heroDTO';

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  public heroList: HeroDTO[] = [];
  private originalHeroList: HeroDTO[] = [];
  constructor(private http: HttpClient) {
    this.http.options
  }

  getHeroList() {
    if (this.originalHeroList.length > 0) {
      this.heroList = this.originalHeroList.map(x => Object.assign({}, x));
      return;
    }
    return this.http.get('https://api.npoint.io/ea338c5ee1c9d316a0f5').subscribe((result: any) => {
      this.heroList = result.data;
      this.heroList.forEach(hero => {
        hero.isSelected = false;
      });
      this.heroList.sort((a: any, b: any) => this.compareName(a, b));
      this.originalHeroList = this.heroList.map(x => Object.assign({}, x));
    });
  }

  compareName(a: any, b: any) {
    // converting to uppercase to have case-insensitive comparison
    const name1 = a.name.toUpperCase();
    const name2 = b.name.toUpperCase();

    let comparison = 0;

    if (name1 > name2) {
      comparison = 1;
    } else if (name1 < name2) {
      comparison = -1;
    }
    return comparison;
  }
}
