import React from 'react'
import { useNavigate,Link } from 'react-router-dom'
import axios from 'axios'
import { useSelector } from 'react-redux'
import './Footing.css'


const Footing = () => {
    const navigate = useNavigate()
  return (
    <div className='footer'>
        
        <div className='footer-menu'>
                <div className='footer-box'>
                    <h3>CUSTOMER CENTER</h3>
                    <div className='line'></div>&nbsp;
                    <h1>1644-3662</h1>&nbsp;
                    <p>Fax : 02-1212-8989</p>
                    <p>MONDAY-FRIDAY 10:00 - 17:00</p>
                    <p>LUNCH 12:00 - 13:00</p>
                    <p>WEEKEND HOLIDAY OFF</p>
                </div>

                <div className='footer-box'>
                    <h3>DELIVERY</h3>
                    <div className='line'></div>&nbsp;
                    <p>롯데택배 고객센터 1588 - 2121</p>&nbsp;
                    <p>반품주소 : 경기도 남양주시 진건읍 진관로 303번길&nbsp;9-1 면목 한신대리점 저스트원</p>&nbsp;
                    <p>타택배 반품주소 : 서울특별시 노원구 노원로15&nbsp;길 10 하계테크노타운 B동 404호 저스트원</p>
                    
                </div>

                <div className='footer-box'>
                    <h3>ABOUT US</h3>
                    <div className='line'></div>&nbsp;
                
                <div className='footer-adimin'>
                    <p>주식회사 DIA 쇼핑몰</p>
                    <a href="http://localhost:3001/admin"> {/* admin 로그인 페이지로 이동 */}
                        <i className="ri-admin-line"></i> Admin
                    </a>
                </div>
                
                &nbsp;

                    <p>대표이사 : 이후용</p>
                    <p>사업자 등록번호 : 204-86-00983</p>
                    <p>주소 : 서울특별시 성동구 성수동1가 656-591번지 서울숲에이타워 1301B호 </p>
                    <p>메일 : scott@naver.com</p>
                </div>
            </div>

            <div className='footer-sub'>
                <p>(주) DIA 쇼핑몰 상호와 이미지 / 사용문구 / 디자인은 저작권법 7233호에 의해 보호받고 있습니다.
                    모든 자료 도용 시 고발조치 후 법적책임을 물을 수 있습니다.</p>
                {/* <p>Copyright(c) himedia.co.kr all right reserved.</p> */}
            </div>
    </div>
  )
}

export default Footing


