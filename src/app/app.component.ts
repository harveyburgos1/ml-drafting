import { Component, OnInit } from '@angular/core';
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
  private readonly TIMER_LENGTH: number = 5;
  private readonly BAN_IMAGE_CLASS_NAME = ".image"
  private readonly PICK_IMAGE_CLASS_NAME = ".pick-image"

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
    this.setHeroContainerToDisabledStyle();
  }

  onClickHero(hero: HeroDTO) {
    if (this.isDraftStarted == false || this.isDraftEnded == true || this.heroService.heroList.find(x => x.heroid == hero.heroid)?.isSelected)
      return;

    hero.isSelected = true;
    this.addSelectedHero(hero);
    this.updateHeroUI();
    this.onHeroClick.next(hero);
  }

  addSelectedHero(hero: any): void {
    if (!this.isTimedDraftStarted) {
      this.draftSequence(hero);
      return
    }

    this.draftSequence(hero);
    if (this.isBanningPhase()
      || this.getArrayLength(this.bluePickList, this.redPickList) == 0
      || this.getArrayLength(this.bluePickList, this.redPickList) == 6
      || !this.isEven(this.bluePickList.length + this.redPickList.length)) {
      this.timeLeft = this.TIMER_LENGTH;
      this.stopTimer();
      this.startTimer();
    }
  }

  isEven(number: any): boolean {
    return number % 2 == 0;
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

  stopTimer(): void {
    if (this.isTimedDraftStarted)
      this.timeLeft = this.TIMER_LENGTH;

    clearInterval(this.interval);
  }

  selectEmptyHero(): void {
    this.draftSequence(this.emptyHero, this.emptyHero);
    this.updateHeroUI();
  }

  getRandomHero(): HeroDTO {
    let unselectedHeroPool = this.heroService.heroList.filter(x => x.isSelected == false);
    let randomHero = unselectedHeroPool[Math.floor(Math.random() * unselectedHeroPool.length)];
    randomHero.isSelected = true;
    return randomHero;
  }

  onInputSearch($event: any): void {
    this.search = this.search.trim();

    if (this.search.toLowerCase().length == 0) {
      this.heroService.getHeroList();
      this.setSelectedHeroesDisabledStyleOnSearch();
      return;
    }

    let key = $event.keyCode;
    // Reset hero list every backspace
    if (key == 8 || key == 46 || this.search.length == 1) {
      this.heroService.getHeroList();
      this.setSelectedHeroesDisabledStyleOnSearch();
    }

    let newHeroList = [];
    for (var i = 0; i < this.heroService.heroList.length; i++) {
      if (this.heroService.heroList[i].name.toLowerCase().indexOf(this.search.toLowerCase()) != -1) {
        newHeroList.push(this.heroService.heroList[i]);
      }
    }
    this.heroService.heroList = newHeroList;
  }

  setSelectedHeroesDisabledStyleOnSearch() {
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
    this.setDivImageBorder();
  }

  draft() {
    this.applyEnableHeroContainerStyle();
    this.isDraftStarted = true;
    this.setDivImageBorder();
    this.startTimer();
  }

  setHeroContainerToDisabledStyle() {
    (document.getElementsByClassName('hero-container')[0] as HTMLElement).style.opacity = "0.5";
  }

  applyEnableHeroContainerStyle() {
    (document.getElementsByClassName('hero-container')[0] as HTMLElement).style.opacity = "1";
  }

  reset() {
    this.setHeroContainerToDisabledStyle();
    this.clearSelectedHeroesImage();
    this.setDivBanBackgroundImage();
    this.setDivPickBackgroundImage();
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

  clearSelectedHeroesImage() {
    this.getSelectedHeroes().forEach(x => x.key = '');
  }

  draftSequence(hero: HeroDTO, hero2?: HeroDTO): void {
    let selectedPickListLength = this.getArrayLength(this.bluePickList, this.redPickList);

    if (this.isBanningPhase()) {
      let selectedBanListLength = this.getArrayLength(this.blueBanList, this.redBanList);
      if ((this.isEven(selectedBanListLength) && selectedPickListLength == 0)
        || (!this.isEven(selectedBanListLength) && selectedPickListLength == 6)) {
        this.blueBanList.push(hero);
        return;
      }
      else {
        this.redBanList.push(hero);
        return;
      }
    }

    // Assign random hero when the timer expires
    let isRandom = false;
    if (this.isEmptyHero(hero)) {
      hero = this.getRandomHero();
      isRandom = true;
      hero2 = this!.getRandomHero();
      if (isRandom) this.onHeroClick.next(hero);
    }

    if (selectedPickListLength == 0) {
      this.bluePickList.push(hero);
    }
    else if (selectedPickListLength <= 2) {
      if (isRandom && this.redPickList.length == 0) {
        this.redPickList.push(hero2!);
        this.onHeroClick.next(hero2!);
      }
      this.redPickList.push(hero);
    }
    else if (selectedPickListLength <= 4) {
      if (isRandom && this.bluePickList.length == 1) {
        this.bluePickList.push(hero2!);
        this.onHeroClick.next(hero2!);
      }
      this.bluePickList.push(hero);
    }
    else if (selectedPickListLength == 5) {
      this.redPickList.push(hero);
    }
    else if (selectedPickListLength == 6) {
      this.redPickList.push(hero);
    }
    else if (selectedPickListLength <= 8) {
      if (isRandom && this.bluePickList.length == 3) {
        this.bluePickList.push(hero2!);
        this.onHeroClick.next(hero2!);
      }
      this.bluePickList.push(hero);
    }
    else if (selectedPickListLength == 9) {
      this.redPickList.push(hero);
      this.isDraftEnded = true;
      this.setHeroContainerToDisabledStyle();
      this.stopTimer();
      this.clearCurrentHeroPickBorder();
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

  setDivBanBackgroundImage(): void {
    this.commonSetBackgroundImage(new SetBackgroundImageDTO('#blue-ban-list', '#blue-ban', this.blueBanList, 'image'));
    this.commonSetBackgroundImage(new SetBackgroundImageDTO('#red-ban-list', '#red-ban', this.redBanList, 'image'));
  }

  setDivPickBackgroundImage(): void {
    this.commonSetBackgroundImage(new SetBackgroundImageDTO('#blue-pick-list', '#blue-pick', this.bluePickList, 'pick-image'));
    this.commonSetBackgroundImage(new SetBackgroundImageDTO('#red-pick-list', '#red-pick', this.redPickList, 'pick-image'));
  }

  updateHeroUI(): void {
    this.setDivBanBackgroundImage();
    this.setDivPickBackgroundImage();
    this.setDivImageBorder();
  }

  commonSetBackgroundImage(setBackgroundImageDTO: SetBackgroundImageDTO) {
    let children = this.getDivChildren(setBackgroundImageDTO.parentIdName, setBackgroundImageDTO.childrenIdName);

    setBackgroundImageDTO.heroList.forEach((x, i) => {
      let imageDOM = children[i].getElementsByClassName(setBackgroundImageDTO.imageClassName)[0];
      (imageDOM as HTMLElement).style.backgroundImage = `url(${x.key})`;
    });
  }

  setDivImageBorder() {
    let borderStyle = '1px solid white'
    let selectedPickListLength = this.getArrayLength(this.bluePickList, this.redPickList);

    if (this.isBanningPhase()) {
      let blueBanChildren = this.getDivChildren('#blue-ban-list', '#blue-ban');
      let redBanChildren = this.getDivChildren('#red-ban-list', '#red-ban');

      let selectedBanListLength = this.getArrayLength(this.blueBanList, this.redBanList);

      this.clearCurrentHeroPickBorder();

      if ((this.isEven(selectedBanListLength) && selectedPickListLength == 0)
        || (!this.isEven(selectedBanListLength) && selectedPickListLength == 6)) {
        this.getDivImage(blueBanChildren[this.blueBanList.length], this.BAN_IMAGE_CLASS_NAME).style.border = borderStyle;
        return;
      }
      else {
        this.getDivImage(redBanChildren[this.redBanList.length], this.BAN_IMAGE_CLASS_NAME).style.border = borderStyle;
        return;
      }
    }

    let bluePickParent = document.querySelector('#blue-pick-list');
    let redPickParent = document.querySelector('#red-pick-list');
    let bluePickChildren = bluePickParent!.querySelectorAll('#blue-pick');
    let redPickChildren = redPickParent!.querySelectorAll('#red-pick');

    // PICK
    if (selectedPickListLength == 0) {
      this.clearCurrentHeroPickBorder();
      this.getDivImage(bluePickChildren[0], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;
      return;
    }
    else if (selectedPickListLength <= 2) {
      this.clearCurrentHeroPickBorder();
      this.getDivImage(redPickChildren[0], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;
      this.getDivImage(redPickChildren[1], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;

      return;
    }
    else if (selectedPickListLength <= 4) {
      this.clearCurrentHeroPickBorder();
      this.getDivImage(bluePickChildren[1], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;
      this.getDivImage(bluePickChildren[2], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;

      return;
    }
    else if (selectedPickListLength == 5) {
      this.clearCurrentHeroPickBorder();
      this.getDivImage(redPickChildren[2], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;

    }
    else if (selectedPickListLength == 6) {
      this.clearCurrentHeroPickBorder();
      this.getDivImage(redPickChildren[3], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;
    }
    else if (selectedPickListLength <= 8) {
      this.clearCurrentHeroPickBorder();
      this.getDivImage(bluePickChildren[3], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;
      this.getDivImage(bluePickChildren[4], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;
      return;
    }
    else if (selectedPickListLength == 9) {
      this.clearCurrentHeroPickBorder();
      this.getDivImage(redPickChildren[4], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;
      return;
    }
  }

  getDivImage(element: Element, className: string): HTMLElement {
    return element.querySelectorAll(className)[0] as HTMLElement;
  }

  clearCurrentHeroPickBorder() {
    this.clearDivBanBorderStyle(this.getDivChildren('#blue-ban-list', '#blue-ban'));
    this.clearDivBanBorderStyle(this.getDivChildren('#red-ban-list', '#red-ban'));
    this.clearDivPickBorderStyle(this.getDivChildren('#blue-pick-list', '#blue-pick'));
    this.clearDivPickBorderStyle(this.getDivChildren('#red-pick-list', '#red-pick'));
  }

  getDivChildren(parentId: string, childrenId: string) {
    let parent = document.querySelector(parentId);
    return parent!.querySelectorAll(childrenId);
  }


  clearDivBanBorderStyle(array: NodeListOf<Element>) {
    array.forEach(x => {
      this.getDivImage(x, this.BAN_IMAGE_CLASS_NAME).style.border = 'none';
    });
  }

  clearDivPickBorderStyle(array: NodeListOf<Element>) {
    array.forEach(x => {
      (x.querySelectorAll('.pick-image')[0] as HTMLElement).style.border = 'none';
    });
  }

}

