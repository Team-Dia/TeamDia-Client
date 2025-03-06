import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import Sidebar from "../MyPage/Sidebar";
import ProfileCard from "../MyPage/ProfileCard";
import "./QnaPage.css";

const QnaView = () => {
    const [qna, setQna] = useState(null);
    const { qnaSeq } = useParams();
    const navigate = useNavigate();
    const loginUser = useSelector(state => state.user);
    const location = useLocation();
    const [pass, setPass] = useState(location.state?.pass || null);

    useEffect(() => {
        if (!qnaSeq) {
            console.error("❌ 유효하지 않은 qnaSeq:", qnaSeq);
            return;
        }

        console.log("📌 QnA 조회 요청:", { qnaSeq, memberId: loginUser?.memberId, pass });

        const requestParams = { qnaSeq };

        // ✅ 로그인한 사용자가 있으면 memberId 추가
        if (loginUser?.memberId) {
            requestParams.memberId = loginUser.memberId;
        }

        // ✅ 비밀번호가 있으면 함께 요청
        if (pass) {
            requestParams.pass = pass;
        }

        axios.get(`/api/customer/getQna`, { params: requestParams })
            .then((result) => {
                console.log("✅ QnA API 응답:", result.data);

                if (result.data.error === "password_required") {
                    // 🔹 비밀번호 입력 요청
                    const password = window.prompt("비밀글입니다. 비밀번호를 입력하세요.");
                    
                    if (!password) {
                        alert("비밀번호를 입력해야 합니다.");
                        navigate('/qnaList');
                        return;
                    }

                    // ✅ 비밀번호 확인 후 다시 요청
                    axios.post(`/api/customer/confirmPass`, { qnaSeq, pass: password }, { headers: { 'Content-Type': 'application/json' } })
                        .then((res) => {
                            if (res.data.msg === "ok") {
                                setPass(password);  // ✅ 비밀번호 저장 후 getQna 다시 실행
                            } else {
                                alert("비밀번호가 올바르지 않습니다.");
                                navigate('/qnaList');
                            }
                        })
                        .catch(() => {
                            alert("비밀번호가 올바르지 않습니다.");
                            navigate('/qnaList');
                        });

                } else if (result.data.qna) {
                    setQna(result.data.qna);
                } else {
                    alert("QnA 데이터를 찾을 수 없습니다.");
                    navigate('/qnaList');
                }
            })
            .catch((err) => {
                console.error("❌ QnA 조회 오류:", err);
            });
    }, [qnaSeq, loginUser, navigate, pass]); // 🔹 pass가 변경될 때마다 getQna 다시 실행

    return (
        <div className="mypage-container">
            <div className="mypage-box">
                <Sidebar />
                <div className="mypage-content">
                    <ProfileCard />
                    <div className="points-section">
                        <h2>1:1 문의 상세</h2>
                        {qna ? (
                            <div className="qna-view-card">
                                <div className="qna-field">
                                    <label>제목</label>
                                    <div className="qna-value">{qna.subject}</div>
                                </div>
                                <div className="qna-field">
                                    <label>작성자</label>
                                    <div className="qna-value">{qna.memberId || qna.guestName || "익명"}</div>
                                </div>
                                <div className="qna-field">
                                    <label>내용</label>
                                    <div className="qna-content-box">
                                        <pre>{qna.content}</pre>
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
                            <button className="qna-button cancel" onClick={() => navigate('/qnaList')}>
                                목록으로
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QnaView;