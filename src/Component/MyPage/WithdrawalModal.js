import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutAction } from "../../store/userSlice";
import axios from "axios";
import "../../style/ModalStyle.css";
import jaxios from "../../util/jwtUtil";

const WithdrawalModal = ({ isOpen, onClose }) => {
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const memberId = useSelector((state) => state.user.memberId);
    const provider = useSelector((state) => state.user.provider);
    const isKakaoUser = provider === "kakao"; // ✅ 카카오 로그인 사용자 여부 확인

    const handleWithdrawal = async () => {
        console.log("🔹 회원 탈퇴 요청: memberId =", memberId);
    
        if (!memberId) {
            alert("회원 정보가 없습니다. 다시 로그인해주세요.");
            return;
        }
    
        try {
            // ✅ 카카오 로그인 사용자는 password 없이 요청
            const requestData = provider === "kakao" ? { memberId } : { memberId, password };
    
            await jaxios.delete("/api/member/withdraw", {
                params: requestData,
                withCredentials: true
            });
    
            alert("회원 탈퇴가 완료되었습니다.");
            dispatch(logoutAction());
            navigate("/");
        } catch (error) {
            console.error("❌ 회원 탈퇴 오류:", error.response?.data);
            alert(error.response?.data || "회원 탈퇴 실패");
        }
    };
    
    

    return isOpen ? (
        <div className="withdrawal-modal-overlay">
            <div className="withdrawal-modal-content">
                <h2>⚠️ 회원 탈퇴</h2>
                <p>정말 탈퇴하시겠습니까?</p>

                {/* ✅ 카카오 로그인 사용자는 비밀번호 입력란을 숨김 */}
                {!isKakaoUser && (
                    <input
                        type="password"
                        placeholder="비밀번호 입력"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="withdrawal-password-input"
                    />
                )}

                <div className="withdrawal-modal-buttons">
                    <button className="withdrawal-confirm-btn" onClick={handleWithdrawal}>탈퇴하기</button>
                    <button className="withdrawal-cancel-btn" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    ) : null;
};

export default WithdrawalModal;
