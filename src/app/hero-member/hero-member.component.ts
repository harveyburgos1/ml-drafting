import { AfterViewInit, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-hero-member',
  templateUrl: './hero-member.component.html',
  styleUrls: ['./hero-member.component.css']
})
export class HeroMemberComponent implements AfterViewInit {
  @Input() image = ''; // decorate the property with @Input()
  @Input() name = '';
  @Input() index: number = -1;
  constructor() { }
  ngAfterViewInit(): void {
    try {
      // document.getElementById('image')?.style.backgroundImage = "";
      document.getElementById(this.index.toString())!.style.backgroundImage = `url(${this.image})`; // specify the image path here
    }
    catch (err) {
      console.log(err);
    }
  }

  // ngOnInit(): void {
  //   try {
  //     // document.getElementById('image')?.style.backgroundImage = "";
  //     // document.getElementById('image')!.style.backgroundImage = `url(${this.image})`; // specify the image path here
  //     document.getElementById(this.index.toString())!.style.backgroundImage = `url(http://akmweb.youngjoygame.com/web/madmin/image/7eb35b7780eaa94993aaada931b28adb.png?w=150-150-0d1318)`; // specify the image path here
  //   }
  //   catch (err) {
  //     console.log(err);
  //   }

  // }


}
