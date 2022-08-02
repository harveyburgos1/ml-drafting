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
  onHeroClick = new Subject<HeroDTO>();
  timeLeft: number = 2;
  interval: any;
  search: string = "";
  blueBanList: HeroDTO[] = [];
  redBanList: HeroDTO[] = [];
  bluePickList: HeroDTO[] = [];
  redPickList: HeroDTO[] = [];
  unfilteredHeroList: HeroDTO[] = [];
  teamTurn: string = "blue";
  isDraftStarted: boolean = false;
  emptyHero: HeroDTO = { heroid: '', name: '', key: '', isSelected: false }
  
  constructor(public heroService: HeroService) {
    // this.startTimer ();
  }

  ngOnInit(): void {
    this.heroService.getHeroList();
  }

  selectHero(hero: HeroDTO) {
    if (this.heroService.heroList.find(x => x.heroid == hero.heroid)?.isSelected)
      return;

    hero.isSelected = true;
    this.assignSelectedHero(hero);
    this.updateHeroUI();
    this.onHeroClick.next(hero);
  }

  assignSelectedHero(hero: any): void {
    if (this.isDraftStarted == true) {
      this.timeLeft = 2;
      this.stopTimer();
      this.startTimer();
      this.draftSequence(hero);
    }
    else {
      this.draftSequence(hero);
    }

    this.disableSelectedHero(hero);
  }

  disableSelectedHero(hero: HeroDTO) {
    let selectedHeroDOM = document.querySelector(`#hero-id-${hero.heroid}`);
    (selectedHeroDOM as HTMLElement).style.backgroundImage = 'url()';

  }

  startTimer(): void {
    this.isDraftStarted = true;
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.selectEmptyHero();
        this.timeLeft = 2;
      }
    }, 1000)
  }

  selectEmptyHero(): void {
    this.draftSequence(this.emptyHero);
    this.updateHeroUI();
  }

  randomHero(): HeroDTO{
    let unselectedHeroPool = this.heroService.heroList.filter(x => x.isSelected == false);
    let randomHero = unselectedHeroPool[Math.floor(Math.random() * unselectedHeroPool.length)];
    randomHero.isSelected = true;
    return randomHero;
  }

  stopTimer(): void {
    clearInterval(this.interval);
  }

  onInputSearch($event: any): void {
    if (this.search.toLowerCase().length == 0) {
      this.heroService.getHeroList();
      return;
    }

    let newHeroList = [];
    for (var i = 0; i < this.heroService.heroList.length; i++) {
      if (this.heroService.heroList[i].name.toLowerCase().indexOf(this.search.toLowerCase()) != -1) {
        newHeroList.push(this.heroService.heroList[i]);
      }
    }
    this.heroService.heroList = newHeroList;
  }

  getSelectedHeroes(): HeroDTO[] {
    return this.blueBanList.concat(this.redBanList).concat(this.bluePickList).concat(this.redPickList);
  }

  draft() {
    this.setDivBorderOnDraft();
    this.startTimer();
  }

  draftSequence(hero: HeroDTO): void {
    if (this.blueBanList.length == 0 && this.redBanList.length == 0) {
      this.blueBanList.push(hero);
      return;
    }
    else if (this.blueBanList.length == 1 && this.redBanList.length <= 1) {
      this.redBanList.push(hero);
      return;
    }
    else if (this.blueBanList.length <= 2 && this.redBanList.length == 2) {
      this.blueBanList.push(hero);
      return;
    }
    else if (this.blueBanList.length == 3 && this.redBanList.length == 2) {
      this.redBanList.push(hero);
      return;
    }

    // Assign random hero when the timer expires
    if (this.isEmptyHero(hero)){
      hero = this.randomHero();
    }
    
    if (this.bluePickList.length == 0 && this.redPickList.length == 0) {
      this.bluePickList.push(hero);
      return;
    }
    else if (this.bluePickList.length == 1 && this.redPickList.length <= 1) {
      this.redPickList.push(hero);
      return;
    }
    else if (this.bluePickList.length <= 2 && this.redPickList.length == 2) {
      this.bluePickList.push(hero);
      return;
    }
    else if (this.bluePickList.length == 3 && this.redPickList.length <= 3) {
      this.redPickList.push(hero);
      return;
    }
    else if (this.bluePickList.length <= 4 && this.redPickList.length == 4) {
      this.bluePickList.push(hero);
      return;
    }
    else if (this.bluePickList.length == 5 && this.redPickList.length == 4) {
      this.redPickList.push(hero);
      return;
    }
  }

  freeDraft(): void {
    
  }

  isEmptyHero(hero: HeroDTO): boolean {
    return hero.name == '';
  }

  updateUIImageBanSelection(): void{
    this.commonUpdateUIBanImage('#blue-ban-list', '#blue-ban', this.blueBanList);
    this.commonUpdateUIBanImage('#red-ban-list', '#red-ban', this.redBanList);
  }

  updateUIImagePickSelection(): void{
    this.commonUpdateUIPick('#blue-player-list', '#blue-player', this.bluePickList);
    this.commonUpdateUIPick('#red-player-list', '#red-player', this.redPickList);
  }

  updateHeroUI(): void{
    this.updateUIImageBanSelection();
    this.updateUIImagePickSelection();
    setTimeout(() => this.setDivBorderOnDraft(), 100);
  }


  commonUpdateUIBanImage(parentIdName: string, childrenIdName: string, banList: HeroDTO[]): void {
    let parent = document.querySelector(parentIdName);
    let children = parent!.querySelectorAll(childrenIdName);

    banList.forEach((x, i) => {
      let imageDOM = children[i].getElementsByClassName('image')[0];
      (imageDOM as HTMLElement).style.backgroundImage = `url(${x.key})`;
    });
  }

  commonUpdateUIPick(parentIdName: string, childrenIdName: string, pickList: HeroDTO[]): void {
    let parent = document.querySelector(parentIdName);
    let children = parent!.querySelectorAll(childrenIdName);

    pickList.forEach((x, i) => {
      let imageDOM = children[i].getElementsByClassName('player-image')[0];
      (imageDOM as HTMLElement).style.backgroundImage = `url(${x.key})`;
    });
  }

  checkWhichTeamToBan(): string {
    if (this.blueBanList.length == 0 && this.redBanList.length == 0)
      return "Blue";
    else if (this.blueBanList.length == 1 && this.redBanList.length == 0) {
      return "Red";
    }
    else if (this.blueBanList.length == 1 && this.redBanList.length == 2) {
      return "Blue";
    }
    else {
      // else if (this.blueBanList.length == 3 && this.redBanList.length == 2){
      return "Red"
    }
  }

  setDivBorderOnDraft() {
    // let blueBanParent = document.querySelector('#blue-ban-list');
    // let redBanParent = document.querySelector('#red-ban-list');
    // let blueBanChildren = blueBanParent!.querySelectorAll('#blue-ban');
    // let redBanChildren = redBanParent!.querySelectorAll('#red-ban');

    // let borderStyle = '1px solid white'

    // this.clearCurrentHeroPickBorder();

    // if (this.blueBanList.length == 0 && this.redBanList.length == 0)
    // {
    //   (blueBanChildren[0] as HTMLElement).style.border = borderStyle;
    // }
    // else if (this.blueBanList.length == 1 && this.redBanList.length == 0)
    // {
    //   (redBanChildren[0] as HTMLElement).style.border = borderStyle;
    //   (redBanChildren[1] as HTMLElement).style.border = borderStyle;
    // }
    // else if (this.blueBanList.length == 1 && this.redBanList.length == )
    // {
    //   (redBanChildren[0] as HTMLElement).style.border = borderStyle;
    //   (redBanChildren[1] as HTMLElement).style.border = borderStyle;
    // }


  }

  clearCurrentHeroPickBorder() {
    let blueBanParent = document.querySelector('#blue-ban-list');
    let redBanParent = document.querySelector('#red-ban-list');
    let blueBanChildren = blueBanParent!.querySelectorAll('#blue-ban');
    let redBanChildren = redBanParent!.querySelectorAll('#red-ban');

    this.clearDivBorder(blueBanChildren);
    this.clearDivBorder(redBanChildren);
  }

  clearDivBorder(array: NodeListOf<Element>){ 
    array.forEach(x => {
      (x as HTMLElement).style.border = 'none';
    });
  }

}

