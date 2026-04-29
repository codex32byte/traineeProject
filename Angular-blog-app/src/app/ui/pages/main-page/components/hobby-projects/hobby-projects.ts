import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-hobby-projects',
  templateUrl: './hobby-projects.html',
  styleUrls: ['./hobby-projects.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HobbyProjects {
  hobbyProjects = [
    {
      id: 1,
      link: "https://nstu.ru/news/news_more?idnews=170745",
      image: "assets/images/hobby-1.webp",
      title: "Creative portrait project",
      description: "AVTF student showed his developments at the World Youth Festival",
      featured: true
    },
    {
      id: 2,
      link: "#",
      image: "assets/images/blockchainIcon.webp",
      title: "Blockchain Architecture",
      description: "Blockchain Architecture",
      featured: false
    },
    {
      id: 3,
      link: "#",
      image: "assets/images/blockchainIcon2.webp",
      title: "Smart Contracts As Middle man role",
      description: "Smart Contracts As Middle man role",
      featured: false

    },
    {
      id: 4,
      link: "#",
      image: "assets/images/blockchainIcon3.webp",
      title: "Web3 Applications integration with Blockchain",
      description: "Web3 Applications integration with Blockchain",
      featured: false

    }
  ];
}