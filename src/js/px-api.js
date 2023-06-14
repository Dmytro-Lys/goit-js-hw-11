import axios from 'axios';
const API_KEY = "37222786-e1189125a0a4c6cf1c45ceab1"

async function getImages(querry, page) {
  const url = `https://pixabay.com/api/?key=${API_KEY}&q=${querry}&image_type=photo&per_page=40&page=${page}
  &orientation=horizontal&safesearch=true`;
  const res = await axios.get(url);
  return res.data;
}
export { getImages };