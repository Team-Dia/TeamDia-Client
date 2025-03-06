import React, { useState } from "react";
import { useSelector } from "react-redux"; // ✅ Redux에서 로그인 상태 가져오기
import "../../style/ModalStyle.css";

const PasswordConfirmModal = ({ isOpen, onClose, onSuccess }) => {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isShaking, setIsShaking] = useState(false);

    const memberId = useSelector((state) => state.user.memberId); // ✅ Redux에서 `memberId` 가져오기

    const provider = useSelector((state) => state.user.provider); // ✅ Redux에서 `provider` 값 가져오기
const isKakaoUser = provider === "kakao"; // ✅ 카카오 로그인 사용자 여부 확인


// const handlePasswordCheck = async () => {
//     try {
//         const response = await fetch("http://localhost:8070/member/verify-password", {
//             method: "POST",
//             credentials: "include",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": memberId, // ✅ `Authorization`에 `memberId` 포함
//             },
//             body: JSON.stringify({ password }),
//         });

//         if (response.ok) {
//             onSuccess();
//         } else {
//             setError("비밀번호가 일치하지 않습니다.");
//             setIsShaking(true);
//             setTimeout(() => setIsShaking(false), 300);
//         }
//     } catch (error) {
//         console.error("비밀번호 검증 오류:", error);
//         setError("서버 오류가 발생했습니다. 다시 시도해주세요.");
//     }
// };

const handlePasswordCheck = async () => {
    if (isKakaoUser) {
        console.log("✅ 카카오 로그인 사용자 - 비밀번호 확인 없이 진행");
        onSuccess(); // ✅ 비밀번호 입력 없이 바로 성공 처리
        return;
    }

    try {
        const response = await fetch("/api/member/verify-password", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": memberId,
            },
            body: JSON.stringify({ password }),
        });

        if (response.ok) {
            onSuccess();
        } else {
            setError("비밀번호가 일치하지 않습니다.");
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 300);
        }
    } catch (error) {
        console.error("비밀번호 검증 오류:", error);
        setError("서버 오류가 발생했습니다. 다시 시도해주세요.");
    }
};


return (
    isOpen && (
        <div className="confirm-modal-overlay">
            <div className={`confirm-modal-content ${isShaking ? "shake" : ""}`}>
                <h2>🔒 비밀번호 확인</h2>
                <p className="confirm-description-text">
                    {isKakaoUser 
                        ? "카카오 로그인 사용자는 비밀번호 확인 없이 진행됩니다."
                        : "회원정보를 수정하려면 비밀번호를 입력하세요."
                    }
                </p>

                {/* ✅ 카카오 로그인 사용자는 비밀번호 입력란 숨김 */}
                {!isKakaoUser && (
                    <input
                        type="password"
                        className="confirm-password-input"
                        placeholder="비밀번호 입력"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                )}

                {error && <p className="confirm-password-error-text">{error}</p>}

                <div className="confirm-modal-buttons">
                    <button className="confirm-confirm-btn" onClick={handlePasswordCheck}>
                        확인
                    </button>
                    <button className="confirm-cancel-btn" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    )
);

};

export default PasswordConfirmModal;
