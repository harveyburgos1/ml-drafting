import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { HeroDTO } from '../DTO/heroDTO';
import { SetBackgroundImageDTO } from '../DTO/SetBackgroundImageDTO';
import { HeroService } from '../hero-service';

@Component({
  selector: 'app-draft',
  templateUrl: './draft.component.html',
  styleUrls: ['./draft.component.css']
})

export class DraftComponent implements OnInit {
  private readonly TIMER_LENGTH: number = 50;
  private readonly BAN_IMAGE_CLASS_NAME = ".image"
  private readonly PICK_IMAGE_CLASS_NAME = ".pick-image"

  onSelectHero = new Subject<HeroDTO>();
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
    this.setStyles();
    this.onSelectHero.next(hero);
  }

  addSelectedHero(hero: any): void {
    if (!this.isTimedDraftStarted) {
      this.draftSequence(hero);
      return
    }

    this.draftSequence(hero);
    if (this.isBanningPhase() || this.isPickingPhase()) {
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
    this.setStyles();
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
        this.onSelectHero.next(x);
      })
    }, 0)
  }

  getSelectedHeroes(): HeroDTO[] {
    return this.blueBanList.concat(this.redBanList).concat(this.bluePickList).concat(this.redPickList);
  }

  onClickFreeDraft(): void {
    this.applyEnableHeroContainerStyle();
    this.isDraftStarted = true;
    this.timeLeft = "--";
    this.setDivImageBorder();
  }

  onClickDraft() {
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

  onClickReset() {
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

  draftSequence(firstHero: HeroDTO, secondHero?: HeroDTO): void {
    if (this.isBanningPhase()) {
      this.draftBanSequence(firstHero);
      return;
    }

    this.draftPickSequence(firstHero, secondHero!);
    return;
  }

  draftBanSequence(hero: HeroDTO){
    if (this.isBlueTeamTurnToBan()) {
      this.blueBanList.push(hero);
      return;
    }
    else {
      this.redBanList.push(hero);
      return;
    }
  }

  draftPickSequence(firstHero: HeroDTO, secondHero: HeroDTO){
    let selectedPickListLength = this.addArrayLength(this.bluePickList, this.redPickList);

    // Assign random hero when the timer expires
    let isRandom = false;

    if (this.isEmptyHero(firstHero)) {
      isRandom = true;
      firstHero = this.getRandomHero();
      secondHero = this!.getRandomHero();
    }

    if (isRandom)
      this.onSelectHero.next(firstHero);

    if (selectedPickListLength == 0) {
      this.bluePickList.push(firstHero);
    }
    else if (selectedPickListLength <= 2) {
      if (isRandom && this.redPickList.length == 0) {
        this.redPickList.push(secondHero!);
        this.onSelectHero.next(secondHero!);
      }
      this.redPickList.push(firstHero);
    }
    else if (selectedPickListLength <= 4) {
      if (isRandom && this.bluePickList.length == 1) {
        this.bluePickList.push(secondHero!);
        this.onSelectHero.next(secondHero!);
      }
      this.bluePickList.push(firstHero);
    }
    else if (selectedPickListLength == 5) {
      this.redPickList.push(firstHero);
    }
    else if (selectedPickListLength == 6) {
      this.redPickList.push(firstHero);
    }
    else if (selectedPickListLength <= 8) {
      if (isRandom && this.bluePickList.length == 3) {
        this.bluePickList.push(secondHero!);
        this.onSelectHero.next(secondHero!);
      }
      this.bluePickList.push(firstHero);
    }
    else if (selectedPickListLength == 9) {
      this.redPickList.push(firstHero);
      this.isDraftEnded = true;
      this.setHeroContainerToDisabledStyle();
      this.stopTimer();
      this.clearCurrentHeroPickBorder();
    }
  }

  private isBanningPhase(): boolean {
    return (this.addArrayLength(this.blueBanList, this.redBanList) < 6
      && this.addArrayLength(this.bluePickList, this.redPickList) == 0)
      || (this.addArrayLength(this.blueBanList, this.redBanList) < 10
        && this.addArrayLength(this.bluePickList, this.redPickList) == 6);
  }

  private isPickingPhase(): boolean {
    return this.addArrayLength(this.bluePickList, this.redPickList) == 0
    || this.addArrayLength(this.bluePickList, this.redPickList) == 6
    || !this.isEven(this.bluePickList.length + this.redPickList.length)
  }

  private addArrayLength(array1: any, array2: any) {
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

  setStyles(): void {
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
    if (this.isBanningPhase()) {
      this.setDivBanImageBorder();
      return;
    }

    this.setDivPickImageBorder();
    return;
  }

  setDivBanImageBorder(){
    let borderStyle = '1px solid white'
    let blueBanChildren = this.getDivChildren('#blue-ban-list', '#blue-ban');
    let redBanChildren = this.getDivChildren('#red-ban-list', '#red-ban');

    this.clearCurrentHeroPickBorder();

    if (this.isBlueTeamTurnToBan()) {
      this.getDivImage(blueBanChildren[this.blueBanList.length], this.BAN_IMAGE_CLASS_NAME).style.border = borderStyle;
      return;
    }
    else {
      this.getDivImage(redBanChildren[this.redBanList.length], this.BAN_IMAGE_CLASS_NAME).style.border = borderStyle;
      return;
    }
  }

  setDivPickImageBorder() {
    let borderStyle = '1px solid white'
    let selectedPickListLength = this.addArrayLength(this.bluePickList, this.redPickList);
    let bluePickChildren = this.getDivChildren('#blue-pick-list', '#blue-pick');
    let redPickChildren = this.getDivChildren('#red-pick-list', '#red-pick');

    this.clearCurrentHeroPickBorder();

    if (selectedPickListLength == 0) {
      this.getDivImage(bluePickChildren[0], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;
      return;
    }
    else if (selectedPickListLength <= 2) {
      this.getDivImage(redPickChildren[0], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;
      this.getDivImage(redPickChildren[1], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;

      return;
    }
    else if (selectedPickListLength <= 4) {
      this.getDivImage(bluePickChildren[1], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;
      this.getDivImage(bluePickChildren[2], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;

      return;
    }
    else if (selectedPickListLength == 5) {
      this.getDivImage(redPickChildren[2], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;

    }
    else if (selectedPickListLength == 6) {
      this.getDivImage(redPickChildren[3], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;
    }
    else if (selectedPickListLength <= 8) {
      this.getDivImage(bluePickChildren[3], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;
      this.getDivImage(bluePickChildren[4], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;
      return;
    }
    else if (selectedPickListLength == 9) {
      this.getDivImage(redPickChildren[4], this.PICK_IMAGE_CLASS_NAME).style.border = borderStyle;
      return;
    }
  }

  private isBlueTeamTurnToBan(): boolean {
    let selectedPickListLength = this.addArrayLength(this.bluePickList, this.redPickList);
    let selectedBanListLength = this.addArrayLength(this.blueBanList, this.redBanList);

    return (this.isEven(selectedBanListLength) && selectedPickListLength == 0) || (!this.isEven(selectedBanListLength) && selectedPickListLength == 6)
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

