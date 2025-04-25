import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import './GameCarousel.css';

const GameCarousel = ({ games }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'center',
    slidesToScroll: 1
  });
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState(1);
  
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);
  
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);
  
  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    
    // Set initial index
    setSelectedIndex(emblaApi.selectedScrollSnap());
    
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);
  
  const handleGameSelect = (game) => {
    navigate(`/game/${game._id || game.id}`);
  };
  
  // Check if games is an array and has items
  if (!Array.isArray(games) || games.length === 0) {
    return <div className="carousel-placeholder">No featured games available</div>;
  }
  
  return (
    <div className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {games.map((game, index) => (
            <div 
              key={game._id || game.id || index} 
              className={`embla__slide ${index === selectedIndex ? 'embla__slide--active' : ''}`}
              onClick={() => handleGameSelect(game)}
            >
              <div className="embla__slide__content">
                <img 
                  src={game.imageUrl} 
                  alt={game.title}
                  className="embla__slide__image"
                />
                {index === selectedIndex && (
                  <div className="embla__slide__title">{game.title}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button className="embla__button embla__button--prev" onClick={scrollPrev}>
        <span className="embla__button__icon">&lt;</span>
      </button>
      <button className="embla__button embla__button--next" onClick={scrollNext}>
        <span className="embla__button__icon">&gt;</span>
      </button>
      
      <div className="embla__dots">
        {games.map((_, index) => (
          <button
            key={index}
            className={`embla__dot ${index === selectedIndex ? 'embla__dot--active' : ''}`}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default GameCarousel;