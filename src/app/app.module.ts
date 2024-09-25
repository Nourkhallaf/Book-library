import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { WishlistItemComponent } from './components/wishlist-item/wishlist-item.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { BookDetailsPageComponent } from './pages/book-details-page/book-details-page.component';
import { AuthorDetailsPageComponent } from './pages/author-details-page/author-details-page.component';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { WishlistPageComponent } from './pages/wishlist-page/wishlist-page.component';
import { BookItemComponent } from './components/book-item/book-item.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    WishlistPageComponent,
    HeaderComponent,
    WishlistItemComponent,
    BookDetailsPageComponent,
    AuthorDetailsPageComponent,
    SearchPageComponent,
    BookItemComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(
     { timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true,
      progressAnimation: 'increasing', 
      closeButton: true,
      })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
