import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  name: string;
  path: string;
}

@Component({
  selector: 'nav-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss',
})
export class NavBarComponent implements OnInit {
  navItems: NavItem[] = [
    { name: 'Home', path: '/#home' },
    { name: 'About', path: '/#about' },
    { name: 'Services', path: '/#services' },
    { name: 'Contact', path: '/#contact' },
  ];
  isMenuOpen = false;
  selectedNavItem = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.selectedNavItem = this.route.snapshot.fragment
      ? this.route.snapshot.fragment.toString()
      : 'home';
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
