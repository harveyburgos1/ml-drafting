import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HeroDTO } from './DTO/heroDTO';

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  public heroList: HeroDTO[] = [];
  public originalHeroList: HeroDTO[] = [];
  constructor(private http: HttpClient) {
    this.http.options
  }

  getHeroList() {
    return this.http.get('https://api.jsonbin.io/v3/b/62e79f5460c3536f3fcc853f', {
      headers: { 'X-Master-Key': '$2b$10$DapXgB9/4AcoVGhstD7y7.rqazG.CYEdxt0pHHEg4rN0E9uJ83zvi' }
    }).subscribe((result: any) => {
      this.heroList = result.record.data;
      this.heroList.sort((a: any, b: any) => this.compareName(a,b));
    });
  }

  // getHeroList() {
  //   return this.http.get<HeroDTO>('../assets/hero-list.json').subscribe((result: any) => {
  //     this.heroList = result.data;
  //     this.originalHeroList = result.data;
  //     this.heroList.forEach(hero => {
  //       hero.isSelected = false;
  //     });
  //     this.heroList.sort((a: any, b: any) => this.compareName(a,b));
  //   });
  // }

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
