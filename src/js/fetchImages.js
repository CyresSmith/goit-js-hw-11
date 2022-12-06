/* eslint-disable camelcase */
import axios from 'axios';
export { fetchImages };

const URL = 'https://pixabay.com/api/';

const fetchImages = async (searchQuery, page) => {
  let searchParams = new URLSearchParams({
    key: '24184422-7ac6228a100fdcdf4ac5fc803',
    q: `${searchQuery}`,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: `${page}`,
    per_page: 40,
  });

  try {
    const { data } = await axios.get(`${URL}/?${searchParams}`);
    return data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
  }
};
