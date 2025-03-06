import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import Sidebar from "../MyPage/Sidebar";
import ProfileCard from "../MyPage/ProfileCard";
import "./QnaPage.css"; 

const WriteQna = () => {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const loginUser = useSelector(state => state.user);
    const [pass, setPass] = useState('');
    const [security, setSecurity] = useState(false);  // ✅ Boolean 값으로 변경
    const navigate = useNavigate();

    function onSubmit() {
        if (!loginUser.memberId) {
            alert('로그인이 필요한 서비스입니다');
            navigate('/login');
            return;
        }
        if (!subject.trim()) return alert('제목을 입력하세요');
        if (!content.trim()) return alert('내용을 입력하세요');
        if (security && !pass.trim()) return alert('비밀번호를 입력하세요');

        const qnaData = {
            subject,
            content,
            memberId: loginUser.memberId,
            security: security ? 'Y' : 'N',  // ✅ Boolean 값을 'Y' 또는 'N'으로 변환
            pass: security ? pass : '',  // ✅ 비밀글이 아니면 빈 값 처리
        };

        axios.post('/api/customer/writeQna', qnaData)
            .then(() => { 
                alert('문의가 등록되었습니다.');
                navigate('/qnaList');
            })
            .catch(err => console.error(err));
    }

    function changeSecurity(e) {
        setSecurity(e.target.checked);
        if (!e.target.checked) {
            setPass('');  // ✅ 비밀글 해제 시 비밀번호 초기화
        }
    }

    return (
        <div className="mypage-container">
            <div className="mypage-box">
                <Sidebar />
                <div className="mypage-content">
                    <ProfileCard />  
                        
                    <div className="points-section">
                        <h2>1:1 문의 작성</h2>
                            <label className="qna-label">제목</label>
                            <input type="text" className="qna-input" value={subject} onChange={(e) => setSubject(e.target.value)} />

                            <div className="qna-security">
                                <input 
                                    type="checkbox" 
                                    id="security-check" 
                                    checked={security}  // ✅ 체크 상태 유지
                                    onChange={changeSecurity} 
                                />
                                <label htmlFor="security-check">비밀글로 설정</label>
                                <input 
                                    type="password" 
                                    className="qna-pass-input" 
                                    value={pass} 
                                    onChange={(e) => setPass(e.target.value)} 
                                    placeholder="비밀번호 입력" 
                                    disabled={!security}  // ✅ 체크 해제 시 비활성화
                                />
                            </div>

                            <label className="qna-label">내용</label>
                            <textarea className="qna-textarea" rows="7" value={content} onChange={(e) => setContent(e.target.value)}></textarea>

                            <div className="qna-button-group">
                                <button className="qna-button cancel" onClick={() => navigate('/qnaList')}>취소</button>
                                <button className="qna-button submit" onClick={onSubmit}>등록</button>
                            </div>
                        </div>
                    
                </div>
            </div>
        </div>
    );
};

export default WriteQna;
