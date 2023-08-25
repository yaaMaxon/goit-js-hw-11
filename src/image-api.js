import axios from "axios";

const BASE_URL = "https://pixabay.com/api/";
const API_KEY = "39017406-8a2bd96a6988b9cda18c74697";

export async function getImage( searchQuery, page, limit) {
    const resp =  await axios(`${BASE_URL}?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${limit}`);
    return resp.data;
}
