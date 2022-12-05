const _ = require('lodash');
import { smoothscroll } from './js/smoothscroll';
import { hideScrollUpBtn } from './js/hide-scroll-up-button';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';
import { fetchImages } from './js/fetchImages';
import SimpleLightbox from 'simplelightbox';

import '@/styles/index.scss';
import 'simplelightbox/dist/simple-lightbox.min.css';

smoothscroll();

const refs = {
  searchForm: document.querySelector('.search-form'),
  searchQueryInput: document.querySelector('input[name=searchQuery]'),
  searchBtn: document.querySelector('.search-form button'),
  gallery: document.querySelector('.gallery'),
};

let page = 1;
let pageLimit = 40;
const DEBOUNCE_DELAY = 300;
let searchQuery = '';
let gallery;
let lastCard;

const setSearchQuery = e => {
  searchQuery = e.target.value.trim();
  refs.searchQueryInput.value = searchQuery;

  if (searchQuery.length > 0) {
    refs.searchBtn.removeAttribute('disabled');
    refs.searchBtn.addEventListener('click', onSearchBtn);
    return;
  }

  refs.searchBtn.setAttribute('disabled', true);
  refs.searchBtn.removeEventListener('click', onSearchBtn);
};

const onSearchBtn = async () => {
  event.preventDefault();
  refs.searchBtn.setAttribute('disabled', true);
  page = 1;

  await fetchImages(`${searchQuery}`, page)
    .then(({ totalHits, hits }) => {
      refs.searchForm.reset();
      if (hits.length === 0) {
        Report.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        refs.gallery.innerHTML = '';
      } else {
        Loading.hourglass();
        Notify.info(`Hooray! We found ${totalHits} images.`);
        markupСreation(hits)
          .then(markup => renderMarkup(totalHits, searchQuery, markup))
          .then(simpleLightboxInit)
          .then(observeLastCard)
          .finally(Loading.remove());
      }
    })
    .catch(e => e);
};

const markupСreation = async hits => {
  const markup = await hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
          <a class="photo-card" href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
              <p class="info-item">
                <b>Likes:</b> ${likes}.
              </p>
              <p class="info-item">
                <b>Views:</b> ${views}.
              </p>
              <p class="info-item">
                <b>Comments:</b> ${comments}.
              </p>
              <p class="info-item">
                <b>Downloads:</b> ${downloads}.
              </p>
            </div>
          </a>
      `
    )
    .join('');

  return markup;
};

const renderMarkup = async (totalHits, searchQuery, markup) => {
  const gallaryMarkup =
    await `<h1 class="page-title">Pictures for the search query "${searchQuery}"</h1>
           <h2 class="page-sub-title">Total found ${totalHits} pcs</h2>${markup}`;
  refs.gallery.innerHTML = await gallaryMarkup;
};

const loadMorePics = async () => {
  page += 1;

  fetchImages(`${searchQuery}`, page)
    .then(({ totalHits, hits }) => {
      Loading.hourglass();
      markupСreation(hits)
        .then(markup => refs.gallery.insertAdjacentHTML('beforeend', markup))
        .then(simpleLightboxRefresh)
        .finally(Loading.remove());

      if (page * pageLimit >= totalHits) {
        Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }

      observeLastCard();
    })
    .catch(e => e);
};

const simpleLightboxInit = async () => {
  gallery = await new SimpleLightbox('.gallery a');
};

const simpleLightboxRefresh = async () => {
  await gallery.refresh();
};

window.addEventListener('scroll', hideScrollUpBtn);

refs.searchQueryInput.addEventListener(
  'input',
  _.debounce(setSearchQuery, DEBOUNCE_DELAY)
);

const options = {
  threshold: 0.5,
};

const observer = new IntersectionObserver(([entry], observer) => {
  if (entry.isIntersecting) {
    observer.unobserve(entry.target);
    loadMorePics();
  }
}, options);

const observeLastCard = async () => {
  lastCard = await document.querySelector('.photo-card:last-child');
  observer.observe(lastCard);
};
