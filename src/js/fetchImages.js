export { fetchImages };

const URL = 'https://pixabay.com/api/';

const searchParams = new URLSearchParams({
  key: '24184422-7ac6228a100fdcdf4ac5fc803',
  q: `cat`,
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
});

const fetchImages = inputValue =>
  fetch(`${URL}?${searchParams}`).then(response => {
    if (!response.ok) {
      throw new Error(response.status);
    }
    return response.json();
  });
