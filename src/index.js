import '@/styles/index.scss';
import { fetchImages } from './js/fetchImages';

const refs = {
  searchQueryInput: document.querySelector('.search-form'),
};

fetchImages().then();

const renderCard = response => {
  return;
};
