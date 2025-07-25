import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { ImageWithFallback } from "../figma/image-with-fallback/image-with-fallback";
import { useLanguage } from "../../../contexts/LanguageContext";
// Using actual Toyosu location images
const toyosuImage1 = '/images/locations/toyosu/toyosu-photo-1.png';
const toyosuImage2 = '/images/locations/toyosu/toyosu-photo-2.png';
const toyosuImage3 = '/images/locations/toyosu/toyosu-photo-3.png';

export function HeroSection() {
  const { t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    {
      src: toyosuImage1,
      alt: "Toyosu area - Photo 1"
    },
    {
      src: toyosuImage2,
      alt: "Toyosu area - Photo 2"
    },
    {
      src: toyosuImage3,
      alt: "Toyosu area - Photo 3"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Images with Slideshow */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ImageWithFallback
              src={(image.src as any).src || (image.src as unknown as string)}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-6">
        {/* Logo and Location Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-6 relative">
            <div className="absolute inset-0 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
              <MapPin className="h-12 w-12 text-white" />
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-4xl font-bold mb-4 text-center">
            {t('app.title')}
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg text-white/90 mb-8 text-center max-w-md leading-relaxed">
            {t('app.subtitle')}
          </p>
        </div>
        
        {/* Slide Indicators */}
        <div className="flex space-x-2 mb-8">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center text-white/70">
            <div className="w-px h-8 bg-white/30 mb-2"></div>
            <div className="animate-bounce">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}