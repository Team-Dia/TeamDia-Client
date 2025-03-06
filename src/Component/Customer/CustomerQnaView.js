import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";  // ✅ Redux에서 로그인 정보 가져오기
import "./CustomerService.css";

const CustomerQnaView = () => {
    const [qna, setQna] = useState(null);
    const { qnaSeq } = useParams();
    const navigate = useNavigate();
    
    // ✅ Redux에서 로그인된 사용자 정보 가져오기
    const loginUser = useSelector(state => state.user);
    
    useEffect(() => {
        if (!qnaSeq) {
            console.error("❌ 유효하지 않은 qnaSeq:", qnaSeq);
            return;
        }
    
        const requestParams = { qnaSeq };
        
        // ✅ 로그인한 사용자가 있으면 memberId 추가
        if (loginUser?.memberId) {
            requestParams.memberId = loginUser.memberId;
        }
    
        console.log("📌 QnA 조회 요청:", requestParams);
    
        axios.get(`/api/customer/getQna`, { params: requestParams })
            .then((result) => {
                console.log("✅ QnA API 응답:", result.data);
    
                if (result.data.error === "password_required") {
                    // ✅ 비밀글이면 비밀번호 입력 요청
                    let password = window.prompt("비밀글입니다. 비밀번호를 입력하세요.");
    
                    if (!password) {
                        alert("비밀번호를 입력해야 합니다.");
                        navigate('/customer/qnaList');  
                        return;
                    }
                    // ✅ 공백 제거 후 비밀번호 확인
                    password = password.trim();
    
                    // ✅ 비밀번호 확인 후 다시 요청
                    axios.post(`/api/customer/confirmPass`, { qnaSeq, pass: password }, { headers: { 'Content-Type': 'application/json' } })
                        .then((result) => {
                            if (result.data.msg === "ok") {
                                // ✅ 비밀번호가 올바르면 다시 getQna 요청
                                axios.get(`/api/customer/getQna`, { params: { qnaSeq, pass: password } })
                                    .then((finalRes) => {
                                        setQna(finalRes.data.qna);
                                    })
                                    .catch(() => {
                                        alert("QnA 데이터를 불러오는 중 오류가 발생했습니다.");
                                        navigate('/customer/qnaList');
                                    });
                            } else {
                                alert("비밀번호가 올바르지 않습니다.");
                                navigate('/customer/qnaList');
                            }
                        })
                        .catch(() => {
                            alert("비밀번호가 올바르지 않습니다.");
                            navigate('/customer/qnaList');
                        });
    
                } else if (result.data.qna) {
                    setQna(result.data.qna);
                } else {
                    alert("QnA 데이터를 찾을 수 없습니다.");
                    navigate('/customer/qnaList');
                }
            })
            .catch((err) => {
                console.error("❌ QnA 조회 오류:", err);
            });
    }, [qnaSeq, loginUser, navigate]);
    
    return (
        <div className="customer-service-container">
            <h2>1:1 문의 상세</h2>

            {qna ? (
                <div className="qna-view-card">
                    <div className="qna-field">
                        <label>제목</label>
                        <div className="qna-value">{qna.subject || "제목 없음"}</div>
                    </div>
                    <div className="qna-field">
                        <label>작성자</label>
                        <div className="qna-value">{qna.memberId || "익명"}</div>
                    </div>
                    <div className="qna-field">
                        <label>내용</label>
                        <div className="qna-content-box">
                            <pre>{qna.content || "내용 없음"}</pre>
                        </div>
                    </div>
                    <div className="qna-field">
                        <label>답변</label>
                        <div className={qna.reply ? "qna-reply-box" : "qna-content-box"}>
                            {qna.reply || "아직 답변이 없습니다."}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="qna-loading">불러오는 중...</div>
            )}

            <div className="qna-button-group">
                <button className="qna-button cancel" onClick={() => navigate('/customer/qnaList')}>
                    목록으로
                </button>
            </div>
        </div>
    );
};

export default CustomerQnaView;
