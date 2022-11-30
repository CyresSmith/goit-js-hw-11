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

  const response = await fetch(`${URL}?${searchParams}`);

  if (!response.ok) {
    throw new Error(response.status);
  }

  const responseObject = await response.json();

  return responseObject;
};
