import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';  // ✅ Redux에서 로그인 정보 가져오기
import "./CustomerService.css";  // ✅ 새로운 고객센터 스타일 사용
import jaxios from '../../util/jwtUtil';

const CustomerWriteQna = () => {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [memberId, setMemberId] = useState('');  // ✅ 비회원도 작성 가능하도록 ID 입력 가능하게 설정
    const [writer, setWriter] = useState('');  // ✅ 회원 ID 또는 비회원 이름
    const [pass, setPass] = useState('');
    const [security, setSecurity] = useState(false);  // ✅ Boolean 값으로 변경
    const navigate = useNavigate();

    // ✅ Redux에서 로그인된 사용자 정보 가져오기
    const loginUser = useSelector(state => state.user);

    // ✅ 로그인 상태라면 memberId 자동 설정
    useEffect(() => {
        if (loginUser?.memberId) {
            setMemberId(loginUser.memberId);
        }
    }, [loginUser]);

    function onSubmit() {
        if (!subject.trim()) return alert('제목을 입력하세요');
        if (!content.trim()) return alert('내용을 입력하세요');
        if (security && !pass.trim()) return alert('비밀번호를 입력하세요');

        const qnaData = {
            subject,
            content,
            memberId: loginUser?.memberId || null, // ✅ 회원이면 memberId 사용
            guestName: loginUser?.memberId ? null : writer, // ✅ 비회원이면 guestName 저장
            security: security ? 'Y' : 'N',  // ✅ Boolean 값을 'Y' 또는 'N'으로 변환
            pass: security ? pass : '',  // ✅ 비밀글이 아니면 비밀번호 빈 값 처리
        };

        jaxios.post('/api/customer/writeQna', qnaData)
            .then(() => { 
                alert('문의가 등록되었습니다.');
                navigate('/customer');  // ✅ 고객센터 메인으로 이동
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
        <div className="customer-service-container">
            <h2 className="qna-title">1:1 문의 작성</h2>

            <div className="qna-input-group">
                <label className="qna-label">제목</label>
                <input 
                    type="text" 
                    className="qna-input" 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)} 
                    placeholder="제목을 입력하세요"
                />
            </div>

            <div className="qna-input-group">
                <label className="qna-label">작성자 ID (회원 ID 또는 비회원 이름)</label>
                <input 
                    type="text" 
                    className="qna-input" 
                    value={(!!loginUser?.memberId)? loginUser.memberId : writer} 
                    onChange={(e) => setWriter(e.target.value)} 
                    placeholder="회원 ID 또는 비회원 이름 입력"
                    disabled={!!loginUser?.memberId} 
                />
            </div>

            <div className="qna-input-group qna-security">
                <input 
                    type="checkbox" 
                    id="security-check" 
                    checked={security} 
                    onChange={(e) => setSecurity(e.target.checked)} 
                />
                <label htmlFor="security-check">비밀글로 설정</label>
            </div>

            {security && (
                <div className="qna-input-group">
                    <label className="qna-label">비밀번호</label>
                    <input 
                        type="password" 
                        className="qna-input" 
                        value={pass} 
                        onChange={(e) => setPass(e.target.value)} 
                        placeholder="비밀번호 입력" 
                    />
                </div>
            )}

            <div className="qna-input-group">
                <label className="qna-label">내용</label>
                <textarea 
                    className="qna-textarea" 
                    rows="7" 
                    value={content} 
                    onChange={(e) => setContent(e.target.value)} 
                    placeholder="문의 내용을 입력하세요"
                />
            </div>

            <div className="qna-button-group">
                <button className="qna-button cancel" onClick={() => navigate('/customer')}>취소</button>
                <button className="qna-button submit" onClick={onSubmit}>등록</button>
            </div>
        </div>
    );
};

export default CustomerWriteQna;
