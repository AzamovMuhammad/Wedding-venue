import React, { useState, useEffect, useCallback } from 'react';

// Agar rasmlarni prop orqali uzatmasangiz, ularni import qiling
import coruselVenue1_default from "../assets/coruselImg/corusel_venue1.jpg";
import coruselVenue2_default from "../assets/coruselImg/corusel_venue2.jpg";
import coruselVenue3_default from "../assets/coruselImg/corusel_venue3.jpg";
import coruselVenue4_default from "../assets/coruselImg/corusel_venue4.jpg";
import coruselVenue5_default from "../assets/coruselImg/corusel_venue5.jpg";

const defaultItems = [
  { src: coruselVenue1_default, alt: "Manzara 1" },
  { src: coruselVenue2_default, alt: "Manzara 2" },
  { src: coruselVenue3_default, alt: "Manzara 3" },
  { src: coruselVenue4_default, alt: "Manzara 4" },
  { src: coruselVenue5_default, alt: "Manzara 5" },
];

function Corusel({ items = defaultItems, autoPlay = true, autoPlayInterval = 5000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = useCallback(() => {
    if (items.length === 0) return;
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? items.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, items.length]);

  const goToNext = useCallback(() => {
    if (items.length === 0) return;
    const isLastSlide = currentIndex === items.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, items.length]);

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    const intervalId = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(intervalId); 
  }, [autoPlay, autoPlayInterval, goToNext, items.length]);


  if (!items || items.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 rounded-lg md:h-96 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
        Rasmlar mavjud emas.
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen group" role="region" aria-roledescription="carousel">
      <div className="relative rounded-lg">
        {items.map((item, index) => (
          <div
            key={index}
            className={`absolute w-full h-screen transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            role="group"
            aria-roledescription="slide"
            aria-hidden={index !== currentIndex} // Joriy bo'lmagan slaydlarni yashirin deb belgilash
          >
            <img
              src={item.src}
              className="block w-full h-screen object-cover"
              alt={item.alt || `Slayd ${index + 1}`}
            />
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          {/* Oldingi tugma */}
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
            aria-label="Oldingi slayd"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
              <svg
                className="w-4 h-4 text-white dark:text-gray-200 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 1 1 5l4 4"
                />
              </svg>
              <span className="sr-only">Oldingi</span>
            </span>
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
            aria-label="Keyingi slayd"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
              <svg
                className="w-4 h-4 text-white dark:text-gray-200"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <span className="sr-only">Keyingi</span>
            </span>
          </button>

          <div className="absolute z-30 flex space-x-3 -translate-x-1/2 bottom-5 left-1/2">
            {items.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`w-3 h-3 rounded-full transition-colors ${
                  currentIndex === index ? 'bg-white dark:bg-gray-900' : 'bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900'
                }`}
                aria-current={currentIndex === index ? "true" : "false"}
                aria-label={`Slayd ${index + 1} ga o'tish`}
                onClick={() => setCurrentIndex(index)}
              ></button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Corusel;