import React , {useState, useEffect} from 'react'
import SubMenu from './SubMenu'
import axios from 'axios'
import './QnaPage.css'
import Sidebar from "../MyPage/Sidebar";
import ProfileCard from "../MyPage/ProfileCard";
import { useSelector } from 'react-redux';  // useSelector은 리덕스에서 사용하는 함수
import { useNavigate, useSearchParams  } from "react-router-dom";
import jaxios from '../../util/jwtUtil';


const QnaList = () => {

    const [qnaList, setQnaList] = useState([]);
    const [paging, setPaging] = useState({})
    const navigate = useNavigate();
    const [beginEnd , setBeginEnd]=useState([])
    const loginUser = useSelector(state=>state.user)
    const [searchParams] = useSearchParams();
    const initialPage = searchParams.get("page") ? parseInt(searchParams.get("page")) : 1;
    
    console.log(`📌 초기 페이지 값: ${initialPage}`); // 🔥 NaN 값이 오는지 확인
    
    useEffect(() => {
        console.log("Redux 로그인 상태:", loginUser);
        if (!loginUser.memberId) {
            alert('로그인이 필요한 서비스입니다');
            navigate('/');
        }
    
        jaxios.get('/api/customer/qnaList', { params: { page: initialPage, memberId: loginUser.memberId } })
            .then((result) => {
                console.log("📌 API 응답 데이터:", result.data);  // 🔥 전체 응답 확인
                console.log("📌 페이징 데이터:", result.data.paging);  // 🔥 페이징 데이터 확인
    
                setQnaList(result.data.qnaList);
                setPaging(result.data.paging || { currentPage: 1, totalPages: 1 });
    
                let arr = [];
                for (let i = result.data.paging.beginPage; i <= result.data.paging.endPage; i++) {
                    arr.push(i);
                }
                console.log("📌 페이지 목록:", arr);
                setBeginEnd([...arr]);
            })
            .catch((err) => {
                console.error("🚨 API 요청 실패:", err);
            });
    }, [initialPage]);
    

    function onPageMove(page) {
        if (isNaN(page) || page < 1) {
            console.error(`🚨 잘못된 페이지 값: ${page}`); // 🔥 NaN 값 확인
            return;
        }
    
        console.log(`📌 페이지 이동 요청: ${page}`);  // 🔥 페이지 이동 요청 로그
    
        navigate(`?page=${page}`);
    
        jaxios.get(`/api/customer/qnaList`, { params: { page, memberId: loginUser.memberId } })
            .then((result) => {
                console.log("📌 API 응답 데이터:", result.data);
                setQnaList([...result.data.qnaList]);
                setPaging(result.data.paging || { currentPage: 1, totalPages: 1 });
    
                const pageArr = [];
                for (let i = result.data.paging.beginPage; i <= result.data.paging.endPage; i++) {
                    pageArr.push(i);
                }
                console.log("📌 페이지 목록:", pageArr);
                setBeginEnd([...pageArr]);
            })
            .catch((err) => {
                console.error("🚨 페이지 이동 중 오류 발생:", err);
            });
    }
    

    function onQnaView(qnaSeq, security) {
        if (security === 'Y') {
            let pass = window.prompt('비밀글입니다. 비밀번호를 입력하세요.');
    
            if (!pass) {
                alert("비밀번호를 입력해야 합니다.");
                return;
            }
    
            console.log(`📌 /confirmPass 요청: qnaSeq = ${qnaSeq}, memberId = ${loginUser.memberId}, pass = ${pass}`);
    
            jaxios.post('/api/customer/confirmPass', { qnaSeq: Number(qnaSeq), memberId: loginUser.memberId, pass }, { headers: { 'Content-Type': 'application/json' } })
                .then((result) => {
                    console.log("✅ /confirmPass 응답:", result.data);
                    
                    if (result.data.msg === 'ok') {
                        // ✅ 비밀번호 확인 성공 후 다시 getQna 요청 (pass 포함)
                        jaxios.get(`/api/customer/getQna`, { params: { qnaSeq, pass } })
                            .then((res) => {
                                if (res.data.qna) {
                                    navigate(`/qnaView/${qnaSeq}`, { state: { pass: pass } }); // ✅ pass를 상태로 전달
                                } else {
                                    alert("QnA 데이터를 찾을 수 없습니다.");
                                }
                            })
                            .catch(() => {
                                alert("QnA 데이터를 불러오는 중 오류가 발생했습니다.");
                            });
                    } else {
                        alert("비밀번호가 올바르지 않습니다.");
                    }
                })
                .catch((err) => {
                    console.error("🚨 /confirmPass 요청 실패:", err);
                    alert("비밀번호 확인 중 오류가 발생했습니다.");
                });
        } else {
            navigate(`/qnaView/${qnaSeq}`);
        }
    }

    return (
       <div className="mypage-container">
            <div className="mypage-box">
                <Sidebar />
                <div className="mypage-content">
                    <ProfileCard />  {/* ✅ 프로필 카드 유지 */}
            
                    <div className="points-section">
                        <div className="qna-header">
                            <h2>문의 내역</h2>
                            <button className="qna-button" onClick={() => navigate('/writeQna')}>
                        1:1 문의 작성
                            </button>
                        </div>
                        <table className="order-table">
                            <thead>
                                <tr>
                                    <th>번호</th>
                                    <th>제목</th>
                                    <th>작성자</th>
                                    <th>등록일</th>
                                    <th>답변여부</th>
                                </tr>
                            </thead>
                            <tbody>
                                {qnaList.length > 0 ? (
                                    qnaList.map((qna, idx) => (
                                        <tr key={idx} onClick={() => onQnaView(qna.qnaSeq, qna.security)}>
                                            <td>{qna.qnaSeq}</td>
                                            <td className="qna-title">
                                                {qna.subject}
                                                {qna.security === 'Y' && <span className="qna-lock">🔒</span>}
                                            </td>
                                            <td>{qna.memberId}</td>
                                            <td>{qna.inDate ? qna.inDate.substring(0, 10) : 'N/A'}</td>
                                            <td className={qna.reply ? 'qna-answered' : 'qna-not-answered'}>
                                                {qna.reply ? '답변 완료' : '미완료'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="no-order">문의 내역이 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>                
                        <div className="custom-pagination">
                            <button 
                                disabled={!paging.currentPage || paging.currentPage === 1} 
                                onClick={() => onPageMove((paging.currentPage || 1) - 1)}
                            >
                                ◀ 이전
                            </button>
                            <span>{paging.currentPage || 1} / {paging.totalPages || 1}</span>
                            <button 
                                disabled={!paging.currentPage || paging.currentPage >= paging.totalPages} 
                                onClick={() => onPageMove((paging.currentPage || 1) + 1)}
                            >
                                다음 ▶
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QnaList
