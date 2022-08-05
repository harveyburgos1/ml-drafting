import { Component, Input, OnInit } from '@angular/core';
import { HeroDTO } from './DTO/heroDTO';
import { Subject } from 'rxjs';
import { HeroService } from './hero-service';
import { SetBackgroundImageDTO } from './DTO/SetBackgroundImageDTO';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  private readonly TIMER_LENGTH: number = 30;
  private readonly BAN_IMAGE_CLASS_NAME = ".image"

  title = 'ml-draft';
  onHeroClick = new Subject<HeroDTO>();
  interval: any;
  search: string = "";
  blueBanList: HeroDTO[] = [];
  redBanList: HeroDTO[] = [];
  bluePickList: HeroDTO[] = [];
  redPickList: HeroDTO[] = [];
  unfilteredHeroList: HeroDTO[] = [];
  isTimedDraftStarted: boolean = false;
  isDraftEnded: boolean = false;
  isDraftStarted: boolean = false;
  emptyHero: HeroDTO = { heroid: '', name: '', key: '', isSelected: false }

  timeLeft: any = this.TIMER_LENGTH;
  constructor(public heroService: HeroService) {
  }

  ngOnInit(): void {
    this.heroService.getHeroList();
    this.applyDisableHeroContainerStyle();
  }

  selectHero(hero: HeroDTO) {
    if (this.isDraftStarted == false || this.isDraftEnded == true || this.heroService.heroList.find(x => x.heroid == hero.heroid)?.isSelected)
      return;

    hero.isSelected = true;
    this.assignSelectedHero(hero);
    this.updateHeroUI();
    this.onHeroClick.next(hero);
  }

  assignSelectedHero(hero: any): void {
    if (this.isTimedDraftStarted == true) {
      this.draftSequence(hero);
      if (this.isOddArrayLength(this.blueBanList, this.redBanList) || this.isOddArrayLength(this.bluePickList, this.redPickList)) {
        this.timeLeft = this.TIMER_LENGTH;
        this.stopTimer();
        this.startTimer();
      }
    }
    else {
      this.draftSequence(hero);
    }
  }

  isEven(number: any): boolean {
    return number % 2 == 0;
  }

  isOddArrayLength(array1: any, array2: any) {
    return (array1.length + array2.length) % 2;
  }

  startTimer(): void {
    this.isTimedDraftStarted = true;
    this.interval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.selectEmptyHero();
        this.timeLeft = this.TIMER_LENGTH;
      }
    }, 1000)
  }

  selectEmptyHero(): void {
    this.draftSequence(this.emptyHero, this.emptyHero);
    this.updateHeroUI();
  }

  randomizeSelectedHero(): HeroDTO {
    let unselectedHeroPool = this.heroService.heroList.filter(x => x.isSelected == false);
    let randomHero = unselectedHeroPool[Math.floor(Math.random() * unselectedHeroPool.length)];
    randomHero.isSelected = true;
    return randomHero;
  }

  stopTimer(): void {
    if (this.isTimedDraftStarted)
      this.timeLeft = this.TIMER_LENGTH;

    clearInterval(this.interval);
  }

  onInputSearch($event: any): void {
    this.search = this.search.trim();

    if (this.search.toLowerCase().length == 0) {
      this.heroService.getHeroList();
      this.setIsSelectedPropertyOnHeroList();
      return;
    }

    let key = $event.keyCode;
    // Reset hero list every backspace
    if(key == 8 || key == 46 || this.search.length == 1){
      this.heroService.getHeroList();
      this.setIsSelectedPropertyOnHeroList();
    }
    

    let newHeroList = [];
    for (var i = 0; i < this.heroService.heroList.length; i++) {
      if (this.heroService.heroList[i].name.toLowerCase().indexOf(this.search.toLowerCase()) != -1) {
        newHeroList.push(this.heroService.heroList[i]);
      }
    }
    this.heroService.heroList = newHeroList;
  }

  setIsSelectedPropertyOnHeroList() {
    let selectedHeroes = this.blueBanList.concat(this.redBanList).concat(this.bluePickList).concat(this.redPickList);
     selectedHeroes.forEach(x => {
      let index = this.heroService.heroList.findIndex(y => y.heroid == x.heroid);
      this.heroService.heroList[index].isSelected = true;
     });

     setTimeout(() => {
     this.heroService.heroList.filter(x => x.isSelected).forEach(x => {
      this.onHeroClick.next(x);
     })
    }, 0)
  }

  getSelectedHeroes(): HeroDTO[] {
    return this.blueBanList.concat(this.redBanList).concat(this.bluePickList).concat(this.redPickList);
  }

  freeDraft(): void {
    this.applyEnableHeroContainerStyle();
    this.isDraftStarted = true;
    this.timeLeft = "--";
    this.setDivBorderOnDraft();
  }

  draft() {
    this.applyEnableHeroContainerStyle();
    this.isDraftStarted = true;
    this.setDivBorderOnDraft();
    this.startTimer();
  }

  applyDisableHeroContainerStyle() {
    (document.getElementsByClassName('hero-container')[0] as HTMLElement).style.opacity = "0.5";
  }

  applyEnableHeroContainerStyle() {
    (document.getElementsByClassName('hero-container')[0] as HTMLElement).style.opacity = "1";
  }

  reset() {
    this.applyDisableHeroContainerStyle();
    this.clearHeroListImage(this.blueBanList);
    this.clearHeroListImage(this.redBanList);
    this.clearHeroListImage(this.bluePickList);
    this.clearHeroListImage(this.redPickList);
    this.updateUIImageBanSelection();
    this.updateUIImagePickSelection();
    this.clearCurrentHeroPickBorder();
    this.blueBanList = [];
    this.redBanList = [];
    this.bluePickList = [];
    this.redPickList = [];
    this.stopTimer();
    this.timeLeft = this.TIMER_LENGTH;
    this.isDraftStarted = false;
    this.isTimedDraftStarted = false;
    this.isDraftEnded = false;
    this.search = "";
    this.heroService.getHeroList();
  }

  clearHeroListImage(heroList: HeroDTO[]) {
    heroList.forEach(x => x.key = '');
  }

  draftSequence(hero: HeroDTO, hero2?: HeroDTO): void {
    if (this.isBanningPhase()) {
      let selectedBanListLength = this.getArrayLength(this.blueBanList, this.redBanList);
      if (this.isEven(selectedBanListLength)) {
        this.blueBanList.push(hero);
        return;
      }
      else if (!this.isEven(selectedBanListLength)) {
        this.redBanList.push(hero);
        return;
      }
    }

    let selectedPickListLength = this.getArrayLength(this.bluePickList, this.redPickList);
    // Assign random hero when the timer expires
    let isRandom = false;
    if (this.isEmptyHero(hero)) {
      hero = this.randomizeSelectedHero();
      isRandom = true;
      hero2 = this!.randomizeSelectedHero();
    }

    if (selectedPickListLength == 0) {
      this.bluePickList.push(hero);
      return;
    }
    else if (selectedPickListLength <= 2) {
      if (isRandom && this.redPickList.length == 0) {
        this.redPickList.push(hero2!);
      }
      this.redPickList.push(hero);
      return;
    }
    else if (selectedPickListLength <= 4) {
      if (isRandom && this.bluePickList.length == 1) {
        this.bluePickList.push(hero2!);
      }
      this.bluePickList.push(hero);
      return;
    }
    else if (selectedPickListLength == 5) {
      this.redPickList.push(hero);
      return;
    }
    else if (selectedPickListLength == 6) {
      this.redPickList.push(hero);
      return;
    }
    else if (selectedPickListLength <= 8) {
      if (isRandom && this.bluePickList.length == 3) {
        this.bluePickList.push(hero2!);
      }
      this.bluePickList.push(hero);
      return;
    }
    else if (selectedPickListLength == 9) {
      this.redPickList.push(hero);

      this.isDraftEnded = true;
      this.applyDisableHeroContainerStyle();
      this.stopTimer();
      this.clearCurrentHeroPickBorder();
      return;
    }
  }

  private isBanningPhase(): boolean {
    return (this.getArrayLength(this.blueBanList, this.redBanList) < 6
      && this.getArrayLength(this.bluePickList, this.redPickList) == 0)
      || (this.getArrayLength(this.blueBanList, this.redBanList) < 10
        && this.getArrayLength(this.bluePickList, this.redPickList) == 6);
  }

  private getArrayLength(array1: any, array2: any) {
    return array1.length + array2.length;
  }

  isEmptyHero(hero: HeroDTO): boolean {
    return hero.name == '';
  }

  updateUIImageBanSelection(): void {
    this.commonSetBackgroundImage(new SetBackgroundImageDTO('#blue-ban-list', '#blue-ban', this.blueBanList, 'image'));
    this.commonSetBackgroundImage(new SetBackgroundImageDTO('#red-ban-list', '#red-ban', this.redBanList, 'image'));
  }

  updateUIImagePickSelection(): void {
    this.commonSetBackgroundImage(new SetBackgroundImageDTO('#blue-pick-list', '#blue-pick', this.bluePickList, 'pick-image'));
    this.commonSetBackgroundImage(new SetBackgroundImageDTO('#red-pick-list', '#red-pick', this.redPickList, 'pick-image'));
  }

  updateHeroUI(): void {
    this.updateUIImageBanSelection();
    this.updateUIImagePickSelection();
    this.setDivBorderOnDraft();
  }

  commonSetBackgroundImage(setBackgroundImageDTO: SetBackgroundImageDTO) {
    let children = this.getDivChildren(setBackgroundImageDTO.parentIdName, setBackgroundImageDTO.childrenIdName);

    setBackgroundImageDTO.heroList.forEach((x, i) => {
      let imageDOM = children[i].getElementsByClassName(setBackgroundImageDTO.imageClassName)[0];
      (imageDOM as HTMLElement).style.backgroundImage = `url(${x.key})`;
    });
  }

  setDivBorderOnDraft() {
    let borderStyle = '1px solid white'

    if (this.isBanningPhase()) {
      let blueBanChildren = this.getDivChildren('#blue-ban-list', '#blue-ban');
      let redBanChildren = this.getDivChildren('#red-ban-list', '#red-ban');
  
      let selectedBanListLength = this.getArrayLength(this.blueBanList, this.redBanList);
      
      this.clearCurrentHeroPickBorder();
      if (this.isEven(selectedBanListLength)) {
        this.getDivImage(blueBanChildren[this.blueBanList.length], this.BAN_IMAGE_CLASS_NAME).style.border = borderStyle;
        return;
      }
      else if (!this.isEven(selectedBanListLength)) {
        this.getDivImage(redBanChildren[this.redBanList.length], this.BAN_IMAGE_CLASS_NAME).style.border = borderStyle;
        return;
      }
    }

    let bluePickParent = document.querySelector('#blue-pick-list');
    let redPickParent = document.querySelector('#red-pick-list');
    let bluePickChildren = bluePickParent!.querySelectorAll('#blue-pick');
    let redPickChildren = redPickParent!.querySelectorAll('#red-pick');
    let selectedPickListLength = this.getArrayLength(this.bluePickList, this.redPickList);

    // PICK
    if (selectedPickListLength == 0) {
      this.clearCurrentHeroPickBorder();
      (bluePickChildren[0].querySelectorAll('.pick-image')[0] as HTMLElement).style.border = borderStyle;
      return;
    }
    else if (selectedPickListLength <= 2) {
      this.clearCurrentHeroPickBorder();
      (redPickChildren[0].querySelectorAll('.pick-image')[0] as HTMLElement).style.border = borderStyle;
      (redPickChildren[1].querySelectorAll('.pick-image')[0] as HTMLElement).style.border = borderStyle;
      return;
    }
    else if (selectedPickListLength <= 4) {
      this.clearCurrentHeroPickBorder();
      (bluePickChildren[1].querySelectorAll('.pick-image')[0] as HTMLElement).style.border = borderStyle;
      (bluePickChildren[2].querySelectorAll('.pick-image')[0] as HTMLElement).style.border = borderStyle;
      return;
    }
    else if (selectedPickListLength == 5) {
      this.clearCurrentHeroPickBorder();
      (redPickChildren[2].querySelectorAll('.pick-image')[0] as HTMLElement).style.border = borderStyle;
    }
    else if (selectedPickListLength == 6) {
      this.clearCurrentHeroPickBorder();
      (redPickChildren[3].querySelectorAll('.pick-image')[0] as HTMLElement).style.border = borderStyle;
    }
    else if (selectedPickListLength <= 8) {
      this.clearCurrentHeroPickBorder();
      (bluePickChildren[3].querySelectorAll('.pick-image')[0] as HTMLElement).style.border = borderStyle;
      (bluePickChildren[4].querySelectorAll('.pick-image')[0] as HTMLElement).style.border = borderStyle;
      return;
    }
    else if (selectedPickListLength == 9) {
      this.clearCurrentHeroPickBorder();
      (redPickChildren[4].querySelectorAll('.pick-image')[0] as HTMLElement).style.border = borderStyle;
      return;
    }
  }

  getDivImage(element: Element, className: string): HTMLElement {
    return element.querySelectorAll(className)[0] as HTMLElement;
  }

  clearCurrentHeroPickBorder() {
    this.clearBanDivImageBorder(this.getDivChildren('#blue-ban-list', '#blue-ban'));
    this.clearBanDivImageBorder(this.getDivChildren('#red-ban-list', '#red-ban'));
    this.clearDivBorder(this.getDivChildren('#blue-pick-list', '#blue-pick'));
    this.clearDivBorder(this.getDivChildren('#red-pick-list', '#red-pick'));
  }

  getDivChildren(parentId: string, childrenId: string) {
    let parent = document.querySelector(parentId);
    return parent!.querySelectorAll(childrenId);
  }


  clearBanDivImageBorder(array: NodeListOf<Element>) {
    array.forEach(x => {
      this.getDivImage(x, this.BAN_IMAGE_CLASS_NAME).style.border = 'none';
    });
  }

  clearDivBorder(array: NodeListOf<Element>) {
    array.forEach(x => {
      (x.querySelectorAll('.pick-image')[0] as HTMLElement).style.border = 'none';
    });
  }

}

