import '@/styles/index.scss';
import { smoothscroll } from './js/smoothscroll';
import { hideScrollUpBtn } from './js/hide-scroll-up-button';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import { Report } from 'notiflix/build/notiflix-report-aio';
import { fetchImages } from './js/fetchImages';

const refs = {
  searchForm: document.querySelector('.search-form'),
  searchQueryInput: document.querySelector('input[name=searchQuery]'),
  searchBtn: document.querySelector('.search-form button'),
  loadMoreBtn: document.querySelector('.load-more'),
  gallery: document.querySelector('.gallery'),
};

smoothscroll();

window.addEventListener('scroll', hideScrollUpBtn);

let page = 1;

let searchQuery = '';

const setSearchQuery = e => {
  searchQuery = e.target.value.trim();
  if (searchQuery.length > 0) {
    refs.searchBtn.removeAttribute('disabled');
  }
};

refs.searchQueryInput.addEventListener('input', setSearchQuery);

const onSearchBtn = async () => {
  event.preventDefault();
  refs.searchBtn.setAttribute('disabled', true);
  page = 1;

  await fetchImages(`${searchQuery}`, page)
    .then(({ totalHits, hits }) => {
      if (hits.length === 0) {
        Report.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        refs.gallery.innerHTML = '';
        refs.loadMoreBtn.removeEventListener('click', onLoadMore);
        refs.loadMoreBtn.classList.add('visually-hidden');
        refs.searchForm.reset();
      } else {
        Loading.hourglass();
        Notify.info(`Hooray! We found ${totalHits} images.`);
        renderMarkup(hits)
          .then(markup => (refs.gallery.innerHTML = markup))
          .finally(Loading.remove());

        if (hits.length === 40) {
          setTimeout(() => {
            refs.loadMoreBtn.addEventListener('click', onLoadMore);
            refs.loadMoreBtn.classList.remove('visually-hidden');
          }, 1000);
        }
      }
    })
    .catch(e => e)
    .finally(refs.searchForm.reset());
};

refs.searchBtn.addEventListener('click', onSearchBtn);

const renderMarkup = async hits => {
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
          <div class="photo-card">
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
          </div>
      `
    )
    .join('');

  return markup;
};

const onLoadMore = async () => {
  page += 1;

  fetchImages(`${searchQuery}`, page)
    .then(({ totalHits, hits }) => {
      Loading.hourglass();
      renderMarkup(hits)
        .then(markup => refs.gallery.insertAdjacentHTML('beforeend', markup))
        .finally(Loading.remove());

      if (page * 40 >= totalHits) {
        refs.loadMoreBtn.removeEventListener('click', onLoadMore);
        refs.loadMoreBtn.classList.add('visually-hidden');
        Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(e => e);
};
