import { getImages } from "./js/px-api.js";
import Notiflix from 'notiflix';
import "notiflix/src/notiflix.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import _ from 'lodash';

let page = 1;
let querry = "";
let maxPage = 0;

const refs = {
    form: document.querySelector('#search-form'),
    gallery: document.querySelector('.gallery'),
    btnLoadMore: document.querySelector('.load-more')
}
const gallerySLb = new SimpleLightbox('.gallery a', { captionsData: "alt", captionDelay: "250" });


refs.form.addEventListener("submit", onSubmit);
refs.btnLoadMore.addEventListener("click", fetchImages);
window.addEventListener("scroll", _.debounce(onScroll, 250))

function onSubmit(event) {
    event.preventDefault();
    const inputValue = refs.form.elements.searchQuery.value.trim();
    if (inputValue === "") return Notiflix.Notify.failure("Empty query!");
    querry = inputValue;
    clearImgList();
    page = 1;
    fetchImages().then((hits) => {
      if (hits) {
        Notiflix.Notify.success(`Hooray! We found ${hits} images.`)
        maxPage = Math.ceil(hits / 40);
      }
    })
    .catch(onError)
      .finally(() => refs.form.reset());
}

async function fetchImages() {
  try {
      const data = await getImages(querry, page);
      if (!data.hits.length) throw new Error("Sorry, there are no images matching your search query. Please try again.");
      page += 1;
      const markup = await generateGalleryItems(data.hits)
      if (markup === undefined) throw new Error("No data!");
      await renderGallery(markup);
      return data.totalHits;
  } catch (err) {
    onError(err);
  }
}

function generateGalleryItems(data) {
  return data.reduce((markup, currentEl) => markup + createGalleryItem(currentEl), "");
}

function renderGallery(markup) {
  refs.gallery.insertAdjacentHTML("beforeend", markup);
  gallerySLb.refresh();
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

function onScroll() {
  const scrollPosition = Math.ceil(window.scrollY);
  const bodyHeight = Math.ceil(document.body.getBoundingClientRect().height);
  const screenHeight = window.screen.height;
  if ((bodyHeight - scrollPosition) < screenHeight) {
    if (page <= maxPage) {
      fetchImages()
    } else {
       Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
    };
  }
}