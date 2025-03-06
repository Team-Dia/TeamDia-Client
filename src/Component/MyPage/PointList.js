import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import ProfileCard from "./ProfileCard";
import { useSelector } from "react-redux"; // Redux 사용 시 추가
import "./PointList.css";
import jaxios from "../../util/jwtUtil";

const PointList = () => {
    const memberId = useSelector(state => state.user.memberId) || localStorage.getItem("memberId"); // Redux 또는 localStorage 사용
    const [points, setPoints] = useState(0); // 현재 보유 포인트
    const [pointHistory, setPointHistory] = useState([]);

    const [page, setPage] = useState(0);
    const [size] = useState(10);  // 한 페이지에 10개씩 표시
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (memberId) {
            jaxios.get(`/api/points/history/${memberId}?page=${page}&size=${size}`)
                .then(response => {
                    console.log("📌 받은 포인트 내역 데이터:", response.data);
                    setPointHistory(response.data.content);  // 🔥 페이징된 데이터, 최신 내역이 첫 번째가 되도록 순서 변경
                    setTotalPages(response.data.totalPages); // 🔥 전체 페이지 수
                    setPoints(response.data.currentPoints || 0); // 🔥 현재 보유 포인트 저장
                })
                .catch(error => console.error("🚨 포인트 내역을 불러오지 못했습니다.", error));
        }
    }, [memberId, page]);  // 🔥 `page`가 바뀔 때마다 재요청
    

    return (
        <div className="mypage-container">
            <div className="mypage-box">
                <Sidebar />
                <div className="mypage-content">
                    <ProfileCard points={points} />

                    {/* 포인트 내역 표시 */}
                    <div className="points-section">
                        <h2>포인트 내역</h2>
                        <table className="points-table">
                            <thead>
                                <tr>
                                    <th>날짜</th>
                                    <th>내용</th>
                                    <th>기존 포인트</th>
                                    <th>변동 포인트</th>
                                    <th>적립/사용</th>
                                    <th>잔여 포인트</th> {/* ✅ 추가된 부분 */}
                                </tr>
                            </thead>
                            <tbody>
                            {pointHistory.length > 0 ? (
                                    pointHistory.reduceRight((acc, history, index, arr) => {
                                        let previousPoints;
                                        
                                        // ✅ 첫 번째 내역 (회원가입 생일 입력 보너스): 기존 포인트 0P
                                        if (index === arr.length - 1) {
                                            previousPoints = 0;
                                        } else {
                                            // ✅ 두 번째 내역부터는 이전 잔여 포인트를 기존 포인트로 설정
                                            previousPoints = acc.length > 0 ? acc[0].remainingPoints : 0;
                                        }

                                        // ✅ 잔여 포인트 계산 (기존 포인트 + 변동 포인트)
                                        const remainingPoints = previousPoints + history.points;

                                        acc.unshift({ // ✅ 최신 내역이 위로 정렬되도록 `unshift` 사용
                                            ...history,
                                            previousPoints,
                                            remainingPoints,
                                        });

                                        return acc;
                                    }, []).map((history, index) => (
                                        <tr key={index}>
                                            <td>{new Date(history.date).toLocaleDateString()}</td>
                                            <td>{history.description}</td>
                                            <td className="previous-points">{new Intl.NumberFormat('ko-KR').format(history.previousPoints)} P</td> {/* ✅ 기존 포인트 */}
                                            <td className={history.isEarn ? "earn" : "use"}>
                                                {new Intl.NumberFormat('ko-KR').format(history.points)} P
                                            </td>
                                            <td className={history.isEarn ? "earn" : "use"}>
                                                {history.isEarn ? "적립" : "사용"}
                                            </td>
                                            <td className="remaining-points">{new Intl.NumberFormat('ko-KR').format(history.remainingPoints)} P</td> {/* ✅ 추가된 부분 */}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6">포인트 내역이 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="custom-pagination">
                            <button 
                                disabled={page === 0} 
                                onClick={() => setPage(page - 1)}
                            >
                                ◀ 이전
                            </button>
                            <span>{page + 1} / {totalPages}</span>
                            <button 
                                disabled={page + 1 >= totalPages} 
                                onClick={() => setPage(page + 1)}
                            >
                                다음 ▶
                            </button>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
};

export default PointList;
