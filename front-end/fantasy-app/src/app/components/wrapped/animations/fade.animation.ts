import {
    trigger,
    style,
    state,
    animate,
    query,
    stagger,
    transition,
  } from '@angular/animations';

  
const ExitStyle = { opacity: 0, transform: 'translateY(10px)' };
const EnterStyle = { opacity: 1, transform: 'translateY(0)' };
  
export const FadeSlideInOut = [
  trigger('fadeSlideInOut', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(10px)' }),
      animate('1000ms', style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
    transition(':leave', [
      animate('500ms', style({ opacity: 0, transform: 'translateY(10px)' })),
    ]),
  ])
];

  export const FadeGrowStagger = [
    trigger('fadeGrowStagger', [
      transition(':enter', [
        query(':enter', [
          style(ExitStyle),
          stagger('1000ms', [animate('500ms', style(EnterStyle))]),
        ]),
      ]),
      transition(':leave', [
        query(':leave', [
          stagger('-100ms', [animate('500ms', style(ExitStyle))]),
        ]),
      ]),
    ]),
  ];
