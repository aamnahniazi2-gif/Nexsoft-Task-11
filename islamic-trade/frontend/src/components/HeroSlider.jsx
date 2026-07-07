import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const slides = [
  {
    title: 'Authentic Islamic Products',
    subtitle: 'Shop with Islamic Values',
    description: 'Discover our curated collection of authentic Islamic products',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    bgColor: 'from-emerald-700 to-emerald-900',
    arabicText: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم'
  },
  {
    title: 'Premium Prayer Essentials',
    subtitle: 'Enhance Your Worship',
    description: 'High-quality prayer mats, tasbih, and prayer clothing',
    buttonText: 'Explore',
    buttonLink: '/products?category=Prayer+Essentials',
    bgColor: 'from-blue-700 to-blue-900',
    arabicText: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا'
  },
  {
    title: 'Modest Fashion Collection',
    subtitle: 'Elegance in Modesty',
    description: 'Beautiful hijabs, abayas, and modest clothing for the modern Muslim',
    buttonText: 'View Collection',
    buttonLink: '/products?category=Modest+Fashion',
    bgColor: 'from-purple-700 to-purple-900',
    arabicText: 'وَقُل لِّلْمُؤْمِنَاتِ يَغْضُضْنَ مِنْ أَبْصَارِهِنَّ'
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[600px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor}`} />
          <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center">
            <div className="text-white max-w-2xl">
              <p className="arabic-text text-3xl mb-4 opacity-90">{slide.arabicText}</p>
              <h2 className="text-2xl font-semibold mb-2 opacity-90">{slide.subtitle}</h2>
              <h1 className="text-5xl font-bold mb-6">{slide.title}</h1>
              <p className="text-xl mb-8 opacity-90">{slide.description}</p>
              <Link
                to={slide.buttonLink}
                className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                {slide.buttonText}
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;