import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { getImage } from './image-api';
import { throttle } from 'lodash';

const refs = {
    searchForm: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    loadMore: document.querySelector('#button'),
    
};

const param = {
  page: 1,
  totalPages: 0,
  LIMIT: 40,
  SCROLL_THROTTLE_INTERVAL: 300
};

let endOfPageNotified = false;
const lightbox = new SimpleLightbox('.gallery a');

refs.searchForm.addEventListener('submit', onSubmit);
refs.loadMore.addEventListener('click', onClick);

async function onSubmit(e) {
  e.preventDefault(); 

    param.page = 1;
    param.totalPages = 0;
    endOfPageNotified = false; 

    refs.gallery.textContent = '';

  let query = refs.searchForm.searchQuery.value.trim();


  if (query === '') {
    return Notiflix.Notify.failure("The field can't be empty! Please type at least 1 character");
  }

  try {
    const result = await getImage(query, param.page, param.LIMIT);
     
    if (result.hits.length === 0) {
      return Notiflix.Notify.warning('Sorry, there are no images matching your search query. Please try again.');
    }

    param.totalPages = Math.ceil(result.totalHits / param.LIMIT);

    renderMarkup(result.hits);

    let newLightbox = new SimpleLightbox('.gallery a'); 
    newLightbox.refresh();
    Notiflix.Notify.info(`Hooray! We found ${result.totalHits} images.`);
  } catch (error) {

    Notiflix.Notify.failure('Something went wrong, please try again later');
  }
}

function renderMarkup(arr) {

  const markup = arr.map(
    ({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
      return (
        ` 
         <div class="photo-card">
         <a class="gallery__link" href="${largeImageURL}">
         <img src="${webformatURL}" alt="${tags}" width="300px" loading="lazy" />
         </a>
         <div class="info">
           <div class="info-item">
             <p>Likes</p>
             <p>${likes}</p>
           </div>
           <div class="info-item">
             <p>Views</p>
             <p>${views}</p>
           </div>
           <div class="info-item">
             <p>Comments</p>
             <p>${comments}</p>
           </div>
           <div class="info-item">
             <p>Downloads</p>
             <p>${downloads}</p>
           </div>
         </div>
       </div>
       `)
    }).join("");

  refs.gallery.insertAdjacentHTML('beforeend', markup);

  lightbox.refresh();
}

const scrollHandler = throttle((e) => {


  handleButtonVisibility(); 
  loadMoreHandler(e);

},param.SCROLL_THROTTLE_INTERVAL);

window.addEventListener('scroll',scrollHandler);

function limitNotify() {
  

  let distanceToBottom = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);

   if(!endOfPageNotified && distanceToBottom < 200) {
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    endOfPageNotified = true;
   }

}

function loadMoreHandler () {
    const distanceToBottom = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);
    if (distanceToBottom < 200) {
     
      if (param.page < param.totalPages) {
        param.page += 1;

        fetchAndRenderImages();
      } else {
        if (!endOfPageNotified) {
          limitNotify();
        }
      }
    }
  }

async function fetchAndRenderImages() {
  try {
    const result = await getImage(
      refs.searchForm.searchQuery.value,
      param.page,
      param.LIMIT
    );
    renderMarkup(result.hits);
  } catch (error) {
    Notiflix.Notify.failure('Something went wrong, please try again later');
  }
}

function handleButtonVisibility() {

  refs.loadMore.classList.toggle('show', window.scrollY > 300);
}

function onClick(e) {

  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}