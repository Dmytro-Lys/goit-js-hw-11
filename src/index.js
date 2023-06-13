import { getImages } from "./js/px-api.js";
import Notiflix from 'notiflix';
import "notiflix/src/notiflix.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

let page = 1;
let querry = "";
const refs = {
    form: document.querySelector('#search-form'),
    gallery: document.querySelector('.gallery'),
    btnLoadMore: document.querySelector('.load-more')
}
const gallerySLb = new SimpleLightbox('.gallery a', { captionsData: "alt", captionDelay: "250" });

refs.form.addEventListener("submit", onSubmit);
refs.btnLoadMore.addEventListener("click", fetchImages);

function onSubmit(event) {
    event.preventDefault();
     refs.btnLoadMore.classList.add("invisible"); 
  const inputValue = refs.form.elements.searchQuery.value.trim();

    if (inputValue === "") return Notiflix.Notify.failure("Empty query!");
    querry = inputValue;
    clearImgList();
   
  page = 1;
  
    fetchImages().then((hits) => { if (hits) Notiflix.Notify.success(`Hooray! We found ${hits} images.`) })
    .catch(onError)
      .finally(() => {
          refs.form.reset();
      });
     
}
    

async function fetchImages() {

    refs.btnLoadMore.disable = true;
  try {
      const data = await getImages(querry, page);
       refs.btnLoadMore.classList.remove("invisible");
      if (!data.hits.length) throw new Error("Sorry, there are no images matching your search query. Please try again.");
      page += 1;
      const markup = await data.hits.reduce(
            (markup, currentEl) => markup + createGalleryItem(currentEl), "");
        if (markup === undefined) throw new Error("No data!");
      refs.gallery.insertAdjacentHTML("beforeend", markup);
      gallerySLb.refresh();
      const maxPage = Math.ceil(data.totalHits / 40);
      if (page > maxPage) {
          refs.btnLoadMore.classList.add("invisible");
          Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
      }
      return data.totalHits;
     
  } catch (err) {
    onError(err);
  }

refs.btnLoadMore.disable = false ;

}



function createGalleryItem({ largeImageURL, webformatURL, tags, likes, views, comments, downloads }) {
    return `<div class="photo-card">
  <a class="gallery__link" href="${largeImageURL}">
    <img
      class="gallery__image"
      src="${webformatURL}"
      alt="${tags}"
    />
    <div class="info">
    <p class="info-item">
      <b>Likes</b> ${likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${downloads}
    </p>
    </div>
  </a>
</div>`;
};

function clearImgList() {
  refs.gallery.innerHTML = "";
}

function onError(error) {
    refs.btnLoadMore.classList.add("invisible"); 
    Notiflix.Notify.failure(error.message);
}