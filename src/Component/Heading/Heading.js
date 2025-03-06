import React from 'react'
import { useNavigate,Link } from 'react-router-dom'
import axios from 'axios'
import { useSelector } from 'react-redux'
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import './Heading.css'




const Heading = () => {
    
  return (
    <div className='header'>
        <div className='header-content'>
            <img src="/imgs/main.jpg" alt="fashion" className='header-img'/>
            
            <div className='header-text'>
                <h1>ALWAYS BE ORIGINAL</h1>
                <h2>SIMPLICITY IS THE ULTIMATE SOPHISTICATION</h2>
            </div>

            <div className='header-menu'>
                <Link to='/ring' id='header-link'>Shop Now</Link>
            </div>
        </div>
            
    </div>
  )
}

export default Heading
