import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { WishlistPageComponent } from './pages/wishlist-page/wishlist-page.component';
import { BookDetailsPageComponent } from './pages/book-details-page/book-details-page.component';
import { AuthorDetailsPageComponent } from './pages/author-details-page/author-details-page.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'book/:id', component: BookDetailsPageComponent },
  { path: 'author/:id', component: AuthorDetailsPageComponent },
  { path: 'search', component: SearchPageComponent },
  { path: 'wishlist', component: WishlistPageComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
