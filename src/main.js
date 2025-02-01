import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import axios from 'axios';


const gallery = document.querySelector('.container');
const inputValue = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const loadmorebtn = document.querySelector(".load-more-btn");


const loadingDiv = document.createElement('span');
loadingDiv.className = 'loader';
//loadingDiv.textContent = 'Loading images, please wait...';

let sayfa = 1;
let perPage = 40;
let totalImages = 0;

loadmorebtn.style.display = "none";

searchButton.addEventListener("click", async (e) => {
    loadmorebtn.style.display = "block";

    gallery.parentNode.insertBefore(loadingDiv, gallery); // Loading div'ini resultsDiv'in önüne ekle

    delay(90000);

    e.preventDefault();

    
    gallery.innerHTML = '';
    totalImages = 0;
  
    await fetch().then((data) => {
        totalImages += data.hits.length;

        if (data.hits.length === 0) {
            iziToast.error({
            message: "Sorry, there are no images matching your search query. Please try again!",
            position: 'topRight',
            })

            loadmorebtn.style.display = 'none';
        } else if (totalImages >= data.totalHits) {
            iziToast.info({
              message: `We're sorry, but you've reached the end of search results.`,
              position: 'topRight',
            });

            loadmorebtn.style.display = 'none';
          } 
          else {
            loadmorebtn.style.display = 'block';
          }
        
        const pixabay = data.hits.map(({webformatURL, largeImageURL, tags, likes, views, comments, downloads}) => 
            `<div class="item">
            <a href="${largeImageURL}">
            <img
            class="gallery-image"
            src="${webformatURL}"
            alt="${tags}"
            />
            <div class="info">
            <p class="info-item">
                <b>Likes <br/> ${likes}</b>
            </p>
            <p class="info-item">
                <b>Views <br/> ${views}</b>
            </p>
            <p class="info-item">
                <b>Comments <br/> ${comments}</b>
            </p>
            <p class="info-item">
                <b>Downloads <br/> ${downloads}</b>
            </p>
            </div>
            </a>
            </div>`
        ).join('');
        
        gallery.insertAdjacentHTML('beforeend', pixabay);
        delay(90000);
        loadingDiv.style.display = 'none';
        box.refresh();

        }).catch(error => {
            console.error('Hata oluştu:', error);
        })
    });
  


  let box = new SimpleLightbox('.container a', {
    captionsData: 'alt',
    captionDelay: 250,
    captionPosition: 'bottom',
  })

  async function fetch() {
    try {
      const response = await axios.get("https://pixabay.com/api/", {
        params: {
            key: "26694191-13f704d2e0e711d67f08fd2b2",
            q: inputValue.value,
            per_page: perPage,
            page: sayfa,
            image_type: 'photo',
            orientation: 'horizontal',
        }
      });
      
      return response.data;
      
    } catch (error) {
      console.error('Hata oluştu:', error);
    }
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

loadmorebtn.addEventListener("click", async () => {
    sayfa++;

    await fetch().then((data) => {
        totalImages += data.hits.length;

        if (data.hits.length === 0) {
            iziToast.error({
            message: "Sorry, there are no images matching your search query. Please try again!",
            position: 'topRight',
            })

            loadmorebtn.style.display = 'none';
        }
        else if (totalImages >= data.totalHits) {
            console.log("CSS",noResults.style.display)
            iziToast.info({
              message: `We're sorry, but you've reached the end of search results.`,
              position: 'topRight',
            });

            loadmorebtn.style.display = 'none';
          } 
          else {
            loadmorebtn.style.display = 'block';
          }
        
        const pixabay = data.hits.map(({webformatURL, largeImageURL, tags, likes, views, comments, downloads}) => 
            `<div class="item">
            <a href="${largeImageURL}">
            <img
            class="gallery-image"
            src="${webformatURL}"
            alt="${tags}"
            />
            <div class="info">
            <p class="info-item">
                <b>Likes <br/> ${likes}</b>
            </p>
            <p class="info-item">
                <b>Views <br/> ${views}</b>
            </p>
            <p class="info-item">
                <b>Comments <br/> ${comments}</b>
            </p>
            <p class="info-item">
                <b>Downloads <br/> ${downloads}</b>
            </p>
            </div>
            </a>
            </div>`
        ).join('');
        
        gallery.insertAdjacentHTML('beforeend', pixabay);
        delay(90000);
        loadingDiv.style.display = 'none';
        box.refresh();

        }).catch(error => {
            console.error('Hata oluştu:', error);
        
    });
})

