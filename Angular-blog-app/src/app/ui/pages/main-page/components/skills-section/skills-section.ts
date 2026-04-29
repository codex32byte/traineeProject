import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-skills-section',
  templateUrl: './skills-section.html',
  styleUrls: ['./skills-section.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillsSection {
  skills = [
    "PHP", "SQL", "Solidity", "JavaScript", "React", "Next.js",
    "Ethers.js", "Tailwind CSS", "Laravel", "MySQL", "PostgreSQL", "Blockchain"
  ];
}