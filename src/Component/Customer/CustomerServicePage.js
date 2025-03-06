import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CustomerService.css";

const CustomerServicePage = () => {
    const [qnaList, setQnaList] = useState([]);
    const [paging, setPaging] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchQnaList(1);
    }, []);

    const fetchQnaList = (page) => {
        axios.get("/api/customer/allQnaList", { params: { page } })
            .then((result) => {
                setQnaList(result.data.qnaList);
                setPaging(result.data.paging || { currentPage: 1, totalPages: 1 });
            })
            .catch((err) => console.error("🚨 API 요청 실패:", err));
    };

    function onPageMove(page) {
        if (isNaN(page) || page < 1) return;
        fetchQnaList(page);
    }

    function onQnaView(qnaSeq, security) {
        navigate(`/customerQnaView/${qnaSeq}`);
    }

    return (
        <div className="customer-service-container">
            <h1>고객센터 - 1:1 문의 내역</h1>

            <table className="qna-table">
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
                                <td>{qna.memberId || qna.guestName || "익명"}</td> {/* 🔹 비회원이면 guestName 표시 */}
                                <td>{qna.inDate ? qna.inDate.substring(0, 10) : 'N/A'}</td>
                                <td className={qna.reply ? 'qna-answered' : 'qna-not-answered'}>
                                    {qna.reply ? '답변 완료' : '미완료'}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="no-qna">문의 내역이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="pagination">
                <button disabled={paging.currentPage === 1} onClick={() => onPageMove(paging.currentPage - 1)}>
                    ◀ 이전
                </button>
                <span>{paging.currentPage} / {paging.totalPages}</span>
                <button disabled={paging.currentPage >= paging.totalPages} onClick={() => onPageMove(paging.currentPage + 1)}>
                    다음 ▶
                </button>
            </div>

            <button className="qna-button" onClick={() => navigate("/customerWriteQna")}>
                1:1 문의 작성
            </button>
        </div>
    );
};

export default CustomerServicePage;
