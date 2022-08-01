import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { HeroDTO } from './DTO/heroDTO';
import { of, Subject, BehaviorSubject, map } from 'rxjs';
import { HeroService } from './hero-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'ml-draft';
  constructor(public heroService: HeroService) {

  }

  ngOnInit(): void {
    this.heroService.getHeroList();
  }

  selectHero(hero:any){
    console.log(hero);
  }


}

