import { HeroDTO } from "./heroDTO";

export class SetBackgroundImageDTO {
    parentIdName: string;
    childrenIdName: string;
    heroList: HeroDTO[];
    imageClassName: string;

    constructor(parentIdName: string, childrenIdName: string, heroList: HeroDTO[], imageClassName: string){
        this.parentIdName = parentIdName;
        this.childrenIdName = childrenIdName;
        this.heroList = heroList;
        this.imageClassName = imageClassName;
    }
}