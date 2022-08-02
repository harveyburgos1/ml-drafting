import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { HeroDTO } from '../DTO/heroDTO';

@Component({
  selector: 'app-hero-member',
  templateUrl: './hero-member.component.html',
  styleUrls: ['./hero-member.component.css']
})
export class HeroMemberComponent implements OnInit, AfterViewInit {
  @Input() image = '';
  @Input() name: string = '';
  @Input() heroid: string = '';
  @Input() onSelectHero = new Subject<HeroDTO>();

  constructor() { }

  ngOnInit(): void {
    this.onSelectHero.subscribe(data => {
      if (data.heroid != this.heroid)
        return;
        
      let selectedHeroDOM = document.querySelector(`#hero-id-${this.heroid}`);
      this.applyDisabledStyle(selectedHeroDOM);
    });
  }

  private applyDisabledStyle(selectedHeroDOM: Element | null) {
    (selectedHeroDOM as HTMLElement).style.pointerEvents = 'none';
    (selectedHeroDOM as HTMLElement).style.opacity = '0.5';
    (selectedHeroDOM as HTMLElement).style.background = '#CCC';
  }

  ngAfterViewInit(): void {
    document.getElementById(this.name.toString())!.style.backgroundImage = `url(${this.image})`;
  }




}
