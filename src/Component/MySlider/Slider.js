import React from 'react'
import Slider from 'react-slick';
import { useEffect } from 'react';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import './Slider.css'

const MainSlider = () => {
    
        const settings = {
          slidesToShow: 3,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 3000,
          infinite: true,
        };

    
  return (
    <div className="autoplay">
      <Slider {...settings}>
        
          <div className="slider-item">
            <img src="/imgs/main1.jpg" alt="Image 1" />
          </div>
          <div className="slider-item">
            <img src="/imgs/main2.jpg" alt="Image 2" />
          </div>
          <div className="slider-item">
            <img src="/imgs/main3.jpg" alt="Image 3" />
          </div>
          <div className="slider-item">
            <img src="/imgs/main4.jpg" alt="Image 4" />
          </div>
          <div className="slider-item">
            <img src="/imgs/main5.jpg" alt="Image 5" />
          </div>
        
      </Slider>
    </div>
  );
}

export default MainSlider
