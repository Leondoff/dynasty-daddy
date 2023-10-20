import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { TradeCenterComponent } from './components/trade-center/trade-center.component';
import { StandardPageComponent } from './components/standard-page/standard-page.component';
import { PowerRankingsComponent } from './components/power-rankings/power-rankings.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'players/trade',
        component: TradeCenterComponent
      },
      {
        path: 'league/rankings',
        component: PowerRankingsComponent
      },
      {
        path: 'players',
        loadChildren: () =>
          import('./modules/player-tools/player-tools.module').then(
            (m) => m.PlayerToolsModule
          ),
      },
      {
        path: 'league',
        loadChildren: () =>
          import('./modules/league-tools/league-tools.module').then(
            (m) => m.LeagueToolsModule
          ),
      },
      {
        path: 'gridiron',
        loadChildren: () =>
          import('./modules/grid/grid.module').then(
            (m) => m.GridModule
          ),
      },
      {
        path: 'user',
        loadChildren: () =>
          import('./modules/user/user.module').then(
            (m) => m.UserModule
          ),
      },
      {
        path: 'home',
        redirectTo: ''
      },
      {
        path: '',
        component: HomeComponent
      },
      {
        path: 'about',
        component: AboutComponent
      },
      {
        path: 'login',
        redirectTo: ''
      }],
    component: StandardPageComponent
  },
  {
    path: 'wrapped',
    loadChildren: () =>
      import('./modules/wrapped/wrapped.module').then(
        (m) => m.WrappedModule
      ),
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes,
      { onSameUrlNavigation: 'reload', enableTracing: true, scrollPositionRestoration: 'enabled' }
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
