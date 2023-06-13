import { getImages } from "./js/px-api.js";
import Notiflix from 'notiflix';
import "notiflix/src/notiflix.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

let page = 1;
let querry = "";
let cardHeight = 288;
const refs = {
    form: document.querySelector('#search-form'),
    gallery: document.querySelector('.gallery'),
    btnLoadMore: document.querySelector('.load-more')
}
const gallerySLb = new SimpleLightbox('.gallery a', { captionsData: "alt", captionDelay: "250" });

window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth"
    });
refs.form.addEventListener("submit", onSubmit);
refs.btnLoadMore.addEventListener("click", fetchImages);

function onSubmit(event) {
  event.preventDefault();
  const inputValue = refs.form.elements.searchQuery.value.trim();

    if (inputValue === "") return Notiflix.Notify.failure("Empty query!");
    querry = inputValue;
    clearImgList();
    refs.btnLoadMore.classList.remove("invisible");
  page = 1;
  
  fetchImages()
    .catch(onError)
    .finally(() => refs.form.reset());
}
    

async function fetchImages() {

    refs.btnLoadMore.disable = true;
  try {
     const data = await getImages(querry, page);
      if (!data.hits.length) throw new Error("Data not found");
      page += 1;
      const maxPage = Math.ceil(data.totalHits / 40);
      if (page > maxPage) refs.btnLoadMore.classList.add("invisible");
     const markup = await data.hits.reduce(
            (markup, currentEl) => markup + createGalleryItem(currentEl), "");
        if (markup === undefined) throw new Error("No data!");
      refs.gallery.insertAdjacentHTML("beforeend", markup);
      gallerySLb.refresh();
    //   const { height: cardHeight } = refs.gallery.firstElementChild.getBoundingClientRect();
     
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
    Notiflix.Notify.failure(error.message);
}