import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-work-section',
  templateUrl: './work-section.html',
  styleUrls: ['./work-section.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkSection {
  works = [
    {
      id: 1,
      date: "2025 - Present",
      title: "WebWave3.io",
      description: "A startup focused on blockchain-powered digital products and Web3 fintech services.",
      icon: "assets/images/icon-webwave3.webp"
    },
    {
      id: 2,
      date: "2024 - Present",
      title: "Education Payment Platform",
      description: "A blockchain-based concept for education payments using smart contracts and digital transactions.",
      icon: "assets/images/icon-Neti-Cryptogate.webp"
    },
    {
      id: 3,
      date: "2024 - Present",
      title: "NETI-Link Student Qualification Profile Service",
      description: "A secure blockchain-oriented service for presenting and verifying student achievements, helping students find job opportunities based on their activity and achievements.",
      icon: "assets/images/icon-NetiLink.webp"
    }
  ];
}