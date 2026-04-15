import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeroSection } from './components/hero-section/hero-section';
import { RecentArticles } from './components/recent-articles/recent-articles';
import { SkillsSection } from './components/skills-section/skills-section';
import { WorkSection } from './components/work-section/work-section';
import { HobbyProjects } from './components/hobby-projects/hobby-projects';

@Component({
  selector: 'app-main-page',
  imports: [HeroSection, RecentArticles, SkillsSection, WorkSection, HobbyProjects],
  templateUrl: './main-page.html',
  styleUrl: './main-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainPage { }