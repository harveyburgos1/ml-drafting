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
  ngOnInit(): void {
  }

}

