import '@/styles/index.scss';
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

let page = 1;

let searchQuery = '';

const setSearchQuery = e => {
  searchQuery = e.target.value.trim();
};

refs.searchQueryInput.addEventListener('input', setSearchQuery);

const onSearchBtn = async () => {
  event.preventDefault();

  page = 1;

  fetchImages(`${searchQuery}`, page)
    .then(({ totalHits, hits }) => {
      if (totalHits) {
        Notify.info(`Hooray! We found ${totalHits} images.`);
      }

      switch (true) {
        case hits.length === 0:
          Report.failure(
            'Sorry, there are no images matching your search query. Please try again.'
          );
          refs.searchForm.reset();
          break;

        case hits.length > 0 && hits.length < 40:
          Loading.hourglass();
          renderMarkup(hits).finally(Loading.remove());
          refs.loadMoreBtn.classList.add('visually-hidden');
          refs.searchForm.reset();
          break;

        case hits.length === 40:
          Loading.hourglass();
          renderMarkup(hits)
            .then(() => {
              setTimeout(() => {
                refs.loadMoreBtn.classList.remove('visually-hidden');
              }, 1000);
            })
            .finally(Loading.remove());
          refs.searchForm.reset();
          break;

        default:
          break;
      }
    })
    .catch(e => e);
};

refs.searchBtn.addEventListener('click', onSearchBtn);

const renderMarkup = async hits => {
  const markup = hits
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

  refs.gallery.innerHTML = markup;
};

const onLoadMore = async () => {
  page += 1;

  fetchImages(`${searchQuery}`, page)
    .then(({ totalHits, hits }) => {
      switch (true) {
        case hits.length === 40:
          Loading.hourglass();
          renderMarkup(hits).finally(Loading.remove());
          break;

        case hits.length < 40:
          Loading.hourglass();
          renderMarkup(hits).finally(Loading.remove());
          refs.loadMoreBtn.classList.add('visually-hidden');
          Notify.info(
            "We're sorry, but you've reached the end of search results."
          );
          break;

        default:
          break;
      }
    })
    .catch(e => e);
};

refs.loadMoreBtn.addEventListener('click', onLoadMore);
