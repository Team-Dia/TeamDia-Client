import { Routes, Route } from "react-router-dom";
import React, { useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { Cookies } from 'react-cookie';
import './style/index.css';
import ScrollToTop from "./Component/ScrollToTop";
// 메인
import Index from './Component/Index'
import Navbar from "./Component/Navbar/Navbar";
import Heading from "./Component/Heading/Heading";
import Footing from "./Component/Footing/Footing";
import MySlider from "./Component/MySlider/Slider";

// 로그인
import Login from "./Component/Login";

// 회원가입
import MemberTerms from './Component/Member/MemberTerms';
import MemberRegister from './Component/Member/MemberRegister';

// 마이페이지
import Sidebar from "./Component/MyPage/Sidebar";
import MyPage from "./Component/MyPage/MyPage";
import Points from "./Component/MyPage/PointList";
import WishlistPage from "./Component/MyPage/WishlistPage";
import OrderHistoryPage from "./Component/MyPage/OrderHistoryPage";
import MyReview from "./Component/MyPage/MyReview";
import MyReviewDetail from "./Component/MyPage/MyReviewDetail";
import ReviewPage from "./Component/MyPage/ReviewPage";
import EditProfile from "./Component/MyPage/EditProfile";
import RecentlyViewedPage from "./Component/MyPage/RecentlyViewedPage";
import QnaList from './Component/Customer/QnaList'
import QnaView from './Component/Customer/QnaView'
import WriteQna from './Component/Customer/WriteQna'

// 제품
import RingPage from "./Component/Category/RingPage";
import EarRingPage from "./Component/Category/EarRingPage";
import NecklacePage from "./Component/Category/NecklacePage";
import BraceletPage from "./Component/Category/BraceletPage";
import SearchResults from "./Component/Search/SearchResults";

// 제품 상세
import ProducDetail from "./Component/product/ProducDetail";
import ReviewDetail from "./Component/review/ReviewDetail";

// 주문 관련
import Cartlist from './Component/Cart/Cartlist'
import OrderList from "./Component/Order/OrderList";
import OrderDetail from "./Component/Order/OrderDetail";
// 고객 센터
import CustomerServicePage from "./Component/Customer/CustomerServicePage";
import CustomerWriteQna from "./Component/Customer/CustomerWriteQna";
import CustomerQnaView from "./Component/Customer/CustomerQnaView";
// 로그인 운영
import { loginAction, logoutAction } from "./store/userSlice";
import jaxios from "./util/jwtUtil";



function App() {
    const dispatch = useDispatch();
    const loginUser = useSelector((state) => state.user);
    useEffect(() => {
        console.log("🟢 [App.js] 애플리케이션 실행 시 로그인 정보 확인");
    
        const storedUser = JSON.parse(localStorage.getItem("loginUser"));
    
        if (!storedUser) return;  // ✅ 로그인 정보 없으면 API 요청 안 함
    
        axios.get("/api/member/userinfo", { withCredentials: true })
            .then(response => {
                if (!response.data.memberId) {
                    dispatch(logoutAction());
                } else {
                    dispatch(loginAction(response.data));
                }
            })
            .catch(error => {
                if (error.response?.status === 401) {
                    dispatch(logoutAction());
                }
            });
    }, [dispatch]);
    
    
    

    return (
        <div className="App">
            {/* 새로운 페이지 열면 스크롤 상단 고정 */}
            <ScrollToTop />
            <Routes>

                {/* 메인 */}
                <Route path="/" element={<><Navbar/><Heading /><MySlider /><Index /><Footing/></>} />

                {/* 로그인 및 회원가입 */}
                <Route path="/login" element={<><Navbar/> <Login/><Footing/></>} />
                <Route path="/memberTerms" element={<><Navbar/> <MemberTerms /><Footing/></>} /> 
                <Route path="/memberRegister" element={<><Navbar/> <MemberRegister /><Footing/></>} /> 

                {/* 마이페이지 */}
                <Route path="/myPage" element={<><Navbar/> <MyPage /><Footing/></>} />
                <Route path="/mypage/points" element={<><Navbar/> <Points /><Footing/></>} />
                <Route path="/mypage/wishlistPage" element={<><Navbar/> <WishlistPage /><Footing/></>} />
                <Route path="/mypage/orders" element={<><Navbar/><OrderHistoryPage /><Footing/></>} />
                <Route path="/mypage/reviews" element={<><Navbar/><MyReview /><Footing/></>} />
                <Route path="/mypage/reviewDetail/:reviewSeq" element={<><Navbar/><MyReviewDetail  /><Footing/></>} />
                <Route path="/review/:orderSeq/:productSeq" element={<><Navbar/><ReviewPage /></>} />
                <Route path="/mypage/edit-profile" element={<><Navbar/> <EditProfile /><Footing/></>} />
                <Route path="/mypage/recentlyViewedPage" element={<><Navbar/><RecentlyViewedPage /><Footing/></>} />

                {/* 제품 및 카테고리 */}

                {/* 반지 제품 카테고리 페이지*/}
                <Route path="/ring" element={<><Navbar/><RingPage /><Footing/></>} />
                {/* 목걸이 제품 카테고리 페이지*/}
                <Route path="/necklace" element={<><Navbar/><NecklacePage /><Footing/></>} />
                {/* 귀걸이 제품 카테고리 페이지*/}
                <Route path="/earRing" element={<><Navbar/><EarRingPage /><Footing/></>} /> 
                {/* 팔찌 제품 카테고리 페이지*/}
                <Route path="/bracelet" element={<><Navbar/><BraceletPage /><Footing/></>} />
                {/* 검색 결과 페이지 */}
                <Route path="/search" element={<><Navbar/><SearchResults /><Footing/></>} /> 

                {/* 제품 상세 */}
                <Route path="/producDetail/:productSeq" element={<><Navbar/><ProducDetail /></>} />
                <Route path="/reviewDetail" element={<><Navbar/> <ReviewDetail /><Footing/></>} />

                {/* 주문 */}
                <Route path='/cartlist' element={<><Navbar/><Cartlist /><Footing/></>} />
                <Route path="/orderList" element={<><Navbar/><OrderList /><Footing/></>} />
                <Route path="/orderDetail" element={<><Navbar/><OrderDetail /><Footing/></>} />


                {/* 고객센터 */}

                <Route path="/Customer/*" element={<><Navbar/><CustomerServicePage /><Footing/></>} />
                {/*고객센터 qna작성 */}
                <Route path="/customerWriteQna/*" element={<><Navbar/><CustomerWriteQna /><Footing/></>} />
                {/* 고객센터 qna조회 */}
                <Route path="/customerQnaView/:qnaSeq" element={<><Navbar/><CustomerQnaView /><Footing/></>} /> 
                {/* 자주 묻는 질문 페이지*/}
                <Route path="/qnaList" element={<><Navbar/><QnaList /><Footing/></>} /> 
                {/* Qna 상세보기 페이지*/}
                <Route path='/qnaView/:qnaSeq' element={<><Navbar/> <QnaView /> <Footing/></>} />
                {/* Qna 작성 페이지*/}
                <Route path="/writeQna" element={<><Navbar/><WriteQna /><Footing/></>} /> 
            </Routes>
        </div>
    );

}

export default App;
