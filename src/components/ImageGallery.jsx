import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Loader from "./Loader";

const PIXABAY_API_KEY = "11263184-2511e204268bc5cc29e1c41a8";
const PIXABAY_BASE_URL = "https://pixabay.com/api/";

const ImageGallery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const [currentQuery, setCurrentQuery] = useState("");
  const [showLoadMore, setShowLoadMore] = useState(false);

  const galleryRef = useRef(null);
  const lightboxRef = useRef(null);

  useEffect(() => {
    const initLightbox = () => {
      try {
        if (lightboxRef.current) {
          lightboxRef.current.destroy();
          lightboxRef.current = null;
        }

        const galleryElements = document.querySelectorAll(".gallery a");
        if (galleryElements.length === 0) {
          return;
        }

        const lightbox = new SimpleLightbox(".gallery a", {
          captionsData: "data-caption",
          captionDelay: 250,
          showCounter: true,
          enableKeyboard: true,
          docClose: true,
          animationSpeed: 250,
          preloading: true,
          widthRatio: 0.8,
          heightRatio: 0.8,
          scaleImageToRatio: true,
          disableRightClick: true,
          closeOnOverlayClick: true,
          loop: true,
        });

        lightboxRef.current = lightbox;
      } catch (error) {
        console.error("SimpleLightbox initialization error:", error);
      }
    };

    if (images.length > 0) {
      const timer = setTimeout(initLightbox, 300);
      return () => clearTimeout(timer);
    }

    return () => {
      try {
        if (lightboxRef.current) {
          lightboxRef.current.destroy();
          lightboxRef.current = null;
        }
      } catch (error) {
        console.error("SimpleLightbox cleanup error:", error);
      }
    };
  }, [images]);

  const handleImageClick = (e) => {
    e.preventDefault();
  };

  const scrollToNextPage = () => {
    const { height: cardHeight } = document
      .querySelector(".gallery")
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: "smooth",
    });
  };

  const loadImages = async (query, pageNum) => {
    setLoading(true);

    try {
      const response = await axios.get(PIXABAY_BASE_URL, {
        params: {
          key: PIXABAY_API_KEY,
          q: query,
          image_type: "photo",
          orientation: "horizontal",
          safesearch: true,
          per_page: 40,
          page: pageNum,
        },
      });

      const { hits, totalHits: total } = response.data;

      if (pageNum === 1) {
        setImages(hits);
        setTotalHits(total);
      } else {
        setImages((prevImages) => {
          const existingIds = new Set(prevImages.map((img) => img.id));
          const newImages = hits.filter((img) => !existingIds.has(img.id));
          return [...prevImages, ...newImages];
        });
      }

      const totalLoadedImages =
        pageNum === 1 ? hits.length : images.length + hits.length;
      setShowLoadMore(totalLoadedImages < total);

      if (
        lightboxRef.current &&
        document.querySelectorAll(".gallery a").length > 0
      ) {
        const timer = setTimeout(() => {
          try {
            lightboxRef.current.refresh();
          } catch (error) {
            console.error("SimpleLightbox refresh error:", error);
          }
        }, 300);
        return () => clearTimeout(timer);
      }

      if (pageNum > 1 && hits.length > 0) {
        const timer = setTimeout(scrollToNextPage, 300);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      iziToast.error({
        title: "Error",
        message: "An error occurred while fetching images. Please try again.",
        position: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim();

    if (!query) {
      iziToast.warning({
        title: "Warning",
        message: "Please enter a search term",
        position: "topRight",
      });
      return;
    }

    setPage(1);
    setCurrentQuery(query);
    await loadImages(query, 1);
    setSearchQuery("");
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await loadImages(currentQuery, nextPage);
  };

  return (
    <div className="w-full px-4">
      <form onSubmit={handleSubmit} className="mb-8 pt-8">
        <div className="flex gap-2 justify-center">
          <input
            type="text"
            name="searchQuery"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images..."
            className="p-2 border border-gray-300 rounded"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded"
          >
            Search
          </button>
        </div>
      </form>

      <div
        ref={galleryRef}
        className="gallery grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        {images.map((image) => (
          <div
            key={image.id}
            className="border-2 border-black rounded-lg bg-white overflow-hidden flex flex-col"
          >
            <a
              href={image.largeImageURL}
              data-caption={image.tags}
              className="block flex-grow gallery-item"
              onClick={handleImageClick}
            >
              <img
                src={image.webformatURL}
                alt={image.tags}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </a>
            <div className="grid grid-cols-4 text-center text-xs py-3 mt-auto">
              <div>
                <div className="font-bold">Likes</div>
                <div>{image.likes}</div>
              </div>
              <div>
                <div className="font-bold">Views</div>
                <div>{image.views}</div>
              </div>
              <div>
                <div className="font-bold">Comments</div>
                <div>{image.comments}</div>
              </div>
              <div>
                <div className="font-bold">Downloads</div>
                <div>{image.downloads}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showLoadMore && !loading && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Load more
          </button>
        </div>
      )}

      {!showLoadMore && images.length > 0 && (
        <p className="text-center mt-8 text-gray-600">
          We're sorry, but you've reached the end of results
        </p>
      )}

      {loading && (
        <div className="mt-8">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
