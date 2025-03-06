import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import DaumPostcode from "react-daum-postcode";
import axios from "axios";
import { useDispatch } from "react-redux"; // ✅ Redux dispatch 추가
import { updateBirthdate } from "../../store/userSlice"; // ✅ updateBirthdate 액션 추가
import Sidebar from "./Sidebar";
import ProfileCard from "./ProfileCard";
import PasswordConfirmModal from "./PasswordConfirmModal";
import WithdrawalModal from "./WithdrawalModal";
import "./MyPage.css";
import "./EditProfile.css";
import "../../style/ModalStyle.css"; 
import { div } from "@tensorflow/tfjs";
import jaxios from "../../util/jwtUtil";

const EditProfile = () => {
    const [formData, setFormData] = useState({
        memberId: "",
        memberName: "",
        memberPhone: "",
        memberEmail: "",
        memberAddress1: "",
        memberAddress2: "",
        zipNum: "",
        memberBirthdate: "",
        currentPwd: "",
        newPwd: "",
        confirmPwd: ""
    });

    const [nickname, setNickname] = useState(localStorage.getItem("nickname") || "");
    const [reviewCount, setReviewCount] = useState();
    const [couponCount, setCouponCount] = useState();
    const [points, setPoints] = useState();

    const [isVerified, setIsVerified] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(true);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isVerificationSent, setIsVerificationSent] = useState(false);
    const [emailVerificationCode, setEmailVerificationCode] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [emailId, setEmailId] = useState("");
    const [emailDomain, setEmailDomain] = useState("");
    const [isCustomDomain, setIsCustomDomain] = useState(false);
    const [customDomain, setCustomDomain] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const memberBirthdate = useSelector(state => state.user.memberBirthdate);

    const [initialFormData, setInitialFormData] = useState({});
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
    
    const user = useSelector((state) => state.user);

    const memberId = useSelector((state) => state.user.memberId);
    console.log("Redux에서 가져온 memberId:", memberId); // ✅ 콘솔에서 memberId 확인

    useEffect(() => {
        setFormData((prevState) => ({
            ...prevState,
            memberBirthdate: memberBirthdate || "" // Redux 값 반영
        }));
    }, [memberBirthdate]);

    // 생일 삭제 함수
    const handleDeleteBirthdate = async () => {
        try {
            const response = await jaxios.post("/api/member/update-birthdate", {
                memberId: user.memberId,
                birthdate: null // 🔥 생일을 NULL로 설정
            });

            if (response.data.success) {
                alert("생일이 삭제되었습니다!");
                setFormData((prevState) => ({
                    ...prevState,
                    memberBirthdate: "" // ✅ 입력 필드 비우기
                }));

                // Redux 상태 업데이트
                dispatch(updateBirthdate(null));
            } else {
                alert("생일 삭제에 실패했습니다.");
            }
        } catch (error) {
            console.error("🚨 생일 삭제 실패:", error);
            alert("오류가 발생했습니다. 다시 시도해주세요.");
        }
    };
    

    useEffect(() => {
        if (!isVerified) {
            setIsPasswordModalOpen(true);
        }
    
        if (!memberId) {
            console.error("❌ memberId가 없음!");
            return;
        }
    
        axios.get("/api/member/userinfo", {
            headers: { "Authorization": memberId },
            withCredentials: true
        })
        .then((response) => {
            console.log("✅ 서버에서 받아온 데이터:", response.data);
    
            // 🔹 응답 데이터 구조 확인
            const userData = response.data.loginUser ? response.data.loginUser : response.data;
    
            if (!userData || !userData.memberId) {
                console.error("❌ 유효한 사용자 데이터가 없음", response.data);
                return;
            }
    
            console.log("🔹 회원 정보 설정됨:", userData);
    
            setFormData({
                memberId: userData.memberId || "",
                memberName: userData.memberName || "",
                memberPhone: userData.memberPhone || "",
                memberEmail: userData.memberEmail || "",
                memberAddress1: userData.memberAddress1 || "",
                memberAddress2: userData.memberAddress2 || "",
                zipNum: userData.zipNum || "",
                memberBirthdate: userData.memberBirthdate ? userData.memberBirthdate.split("T")[0] : "" // ✅ 날짜 형식 변환
            });
            
            
    
            setInitialFormData(userData);
        })
        .catch((error) => {
            console.error("❌ 유저 정보 가져오기 실패:", error);
        });
    }, [isVerified, memberId]);

    useEffect(() => {
        console.log("🛠️ 현재 formData:", formData);
    }, [formData]); // 🔹 formData 변경될 때마다 실행
    
    
    const handlePasswordVerified = () => {
        setIsVerified(true); // 비밀번호 확인 성공
        setIsPasswordModalOpen(false); // 비밀번호 모달 닫기
    };

    const handleModalClose = () => {
        navigate("/mypage"); // 비밀번호 확인 없이 닫으면 마이페이지로 이동
    };

    const openAddressModal = () => {
        if (isVerified) {
            setIsAddressModalOpen(true);
        } else {
            alert("비밀번호를 먼저 확인해주세요.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };
    

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 허용
    
        // 자동으로 하이픈(-) 추가
        if (value.length > 3 && value.length <= 7) {
            value = value.replace(/(\d{3})(\d{1,4})/, "$1-$2");
        } else if (value.length > 7) {
            value = value.replace(/(\d{3})(\d{4})(\d{1,4})/, "$1-$2-$3");
        }
    
        setFormData((prevState) => ({
            ...prevState,
            memberPhone: value
        }));
    };
    
    const handleAddressSelect = (data) => {
        let fullAddress = data.roadAddress;
        let extraAddress = '';

        if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
            extraAddress += data.bname;
        }
        if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? ', ' : '') + data.buildingName;
        }
        if (extraAddress !== '') {
            fullAddress += ` (${extraAddress})`;
        }

        setFormData({
            ...formData,
            zipNum: data.zonecode,
            memberAddress1: fullAddress
        });

        setIsAddressModalOpen(false);
    };

    const handleEmailChange = (e) => {
        const { name, value } = e.target;
    
        if (name === "emailId") {
            setEmailId(value);
        } else if (name === "emailDomain") {
            setIsCustomDomain(value === "custom");
            setEmailDomain(value === "custom" ? "" : value);
        } else if (name === "customDomain") {
            setCustomDomain(value);
            setEmailDomain(value);
        }
    
        // 이메일 도메인이 설정되지 않은 경우 오류 방지
        if (value !== "custom" && value.trim() === "") {
            alert("올바른 이메일 도메인을 선택해주세요.");
            return;
        }
    
        setIsEmailVerified(false);
        setIsVerificationSent(false);
        setEmailVerificationCode("");
    };
    
    const requestEmailVerification = () => {
        const fullEmail = `${emailId}@${emailDomain}`;
    
        // 이메일 형식 확인
        if (!emailId || !emailDomain) {
            alert("이메일을 올바르게 입력해주세요.");
            return;
        }
    
        axios.post("/api/member/auth/send-email", { email: fullEmail })
            .then(() => {
                setIsVerificationSent(true);
                alert("인증 코드가 이메일로 전송되었습니다.");
            })
            .catch(() => alert("이메일 전송 실패"));
    };
    

    const verifyEmailCode = () => {
        const fullEmail = `${emailId}@${emailDomain}`;
    
        if (!emailVerificationCode.trim()) {
            alert("인증 코드를 입력하세요.");
            return;
        }
    
        axios.post("/api/member/auth/verify-email", {
            email: fullEmail,
            code: emailVerificationCode
        })
        .then((response) => {
            if (response.data.success) {
                setIsEmailVerified(true);
                alert("이메일 인증 완료!");
            } else {
                alert("인증 코드가 일치하지 않습니다.");
            }
        })
        .catch(() => alert("이메일 인증 오류"));
    };
    
    const [passwordError, setPasswordError] = useState("");

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
    
        setFormData((prevState) => ({
            ...prevState,
            [name]: value
        }));
    
        if (name === "newPwd") {
            if (!validatePassword(value)) {
                setPasswordError("비밀번호는 8자 이상 영문, 숫자, 특수문자를 포함해야 합니다.");
            } else {
                setPasswordError("");
            }
        }
    
        if (name === "confirmPwd" && formData.newPwd !== value) {
            setPasswordError("비밀번호가 일치하지 않습니다.");
        } else if (name === "confirmPwd" && validatePassword(formData.newPwd)) {
            setPasswordError("");
        }
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleSubmit = async () => {
        if (!isEmailVerified && (emailId || emailDomain)) {
            alert("이메일을 변경하셨습니다. 인증을 완료해주세요.");
            return;
        }
    
        if (formData.newPwd && formData.newPwd !== formData.confirmPwd) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }
    
        // 🔥 생일 값이 빈 문자열이면 null로 변환하여 전송
        const formattedBirthdate = formData.memberBirthdate && formData.memberBirthdate.trim() !== "" 
            ? formData.memberBirthdate 
            : null;
    
        const requestData = {
            memberId: formData.memberId,
            memberName: formData.memberName || null,
            memberPhone: formData.memberPhone || null,
            memberAddress1: formData.memberAddress1 || null,
            memberAddress2: formData.memberAddress2 || null,
            zipNum: formData.zipNum || null,
            memberBirthdate: formattedBirthdate, // ✅ 빈 문자열이 아닌 null로 전송
            newPwd: formData.newPwd || null,
            confirmPwd: formData.confirmPwd || null,
            newEmail: emailId && emailDomain ? `${emailId}@${emailDomain}` : null
        };
    
        try {
            const response = await jaxios.post("/api/member/update", requestData, {
                withCredentials: true, // ✅ 쿠키 기반 인증 유지
                headers: {
                    "Authorization": formData.memberId // ✅ 로그인된 사용자 ID 전달
                }
            });
    
            if (response.data.msg === "회원정보 수정 완료") {
                alert("회원정보 수정 완료!");
                navigate("/mypage");
            } else {
                alert(response.data.msg || "회원정보 수정 실패");
            }
        } catch (error) {
            console.error("🚨 회원정보 수정 요청 실패:", error);
            alert(error.response?.data?.msg || "서버 오류 발생");
        }
    };
    

    const handleCancel = () => {
        navigate("/mypage"); // ✅ 마이페이지로 이동
    };
    

    return (
        <div className="mypage-container">
            <div className="mypage-box">
            <Sidebar />
            <div className="mypage-content">
                <ProfileCard  nickname={nickname} couponCount={couponCount} points={points}P />

                {/* ✅ 비밀번호 확인 모달 */}
                <PasswordConfirmModal 
                    isOpen={isPasswordModalOpen} 
                    onClose={handleModalClose} 
                    onSuccess={handlePasswordVerified} 
                />

                {isVerified && (
                    <div className="points-section">
                        <h2>회원정보 수정</h2>
                        <div className="edit-profile-section">
                            <form className="edit-profile-form">
                                <div className="form-group">
                                    <label>아이디</label>
                                    <input type="text" name="memberId" value={formData.memberId} className="form-input" disabled />
                                </div>

                                <div className="form-group">
                                    <label>이름</label>
                                    <input 
                                        type="text" 
                                        name="memberName" 
                                        className="form-input" 
                                        placeholder="이름을 입력하세요" 
                                        value={formData.memberName}
                                        onChange={handleChange} 
                                    />
                                </div>

                                <div className="form-group">
                                    <label>전화번호</label>
                                    <input
                                        type="text"
                                        name="memberPhone"
                                        className="form-input"
                                        placeholder="전화번호를 입력하세요"
                                        value={formData.memberPhone}
                                        onChange={handlePhoneChange}
                                    />
                                </div>


                                {user?.provider !== "kakao" && (
                                    <>
                                        <div className="form-group">
                                            <label>새 비밀번호</label>
                                            <input 
                                                type="password" 
                                                name="newPwd" 
                                                className="form-input" 
                                                placeholder="새 비밀번호 입력 (8자 이상, 영문, 숫자, 특수문자 포함)" 
                                                value={formData.newPwd} 
                                                onChange={handlePasswordChange} 
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>새 비밀번호 확인</label>
                                            <input 
                                                type="password" 
                                                name="confirmPwd" 
                                                className="form-input" 
                                                placeholder="새 비밀번호 확인" 
                                                value={formData.confirmPwd} 
                                                onChange={handlePasswordChange} 
                                            />
                                            {passwordError && <p className="error-text">{passwordError}</p>}
                                        </div>
                                    </>
                                )}

                                <div className="form-group">
                                    <label>생년월일</label>
                                    <div className="birthdate-container">
                                        <input
                                            type="date"
                                            name="memberBirthdate"
                                            className="form-input"
                                            value={formData.memberBirthdate || ""}
                                            onChange={handleChange}
                                        />
                                        {formData.memberBirthdate && (
                                            <button type="button" className="delete-birthdate-btn" onClick={handleDeleteBirthdate}>
                                                삭제
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>이메일</label>
                                    <input type="text" name="memberEmail" value={formData.memberEmail} className="form-input" disabled />
                                </div>

                                <div className="form-group">
                                    <label>새 이메일 입력</label>
                                    <div className="email-input-container">
                                    <input 
                                        type="text" 
                                        name="emailId" 
                                        className="form-input email-id"
                                        placeholder="이메일 아이디" 
                                        value={emailId} 
                                        onChange={handleEmailChange} 
                                    />
                                        <span>@</span>
                                        {!isCustomDomain ? (
                                            <select 
                                            name="emailDomain" 
                                            className="form-input email-select"
                                            onChange={handleEmailChange}
                                        >
                                                <option value="">도메인 선택</option>
                                                <option value="gmail.com">gmail.com</option>
                                                <option value="naver.com">naver.com</option>
                                                <option value="daum.net">daum.net</option>
                                                <option value="yahoo.com">yahoo.com</option>
                                                <option value="custom">직접 입력</option>
                                            </select>
                                        ) : (
                                            <input 
                                                type="text" 
                                                name="customDomain" 
                                                className="form-input email-custom"
                                                placeholder="도메인 입력" 
                                                value={customDomain} 
                                                onChange={handleEmailChange} 
                                            />
                                        )}
                                        <button 
                                            type="button" 
                                            className="verification-btn"
                                            onClick={requestEmailVerification} 
                                            disabled={isVerificationSent}
                                        >
                                            {isVerificationSent ? "전송 완료" : "인증 요청"}
                                        </button>
                                    </div>

                                    {/* 이메일 인증 코드 입력 UI */}
                                    {isVerificationSent && (
                                        <div className="email-verification-container">
                                            <input 
                                                type="text" 
                                                className="form-input email-code"
                                                placeholder="인증 코드 입력" 
                                                value={emailVerificationCode} 
                                                onChange={(e) => setEmailVerificationCode(e.target.value)}
                                            />
                                            <button 
                                                type="button" 
                                                className={`confirm-verification-btn ${isEmailVerified ? "verified" : ""}`}
                                                onClick={verifyEmailCode} 
                                                disabled={isEmailVerified}
                                            >
                                                {isEmailVerified ? "인증 완료" : "인증 확인"}
                                            </button>
                                        </div>
                                    )}

                                    {/* 인증 완료 메시지 */}
                                    {isEmailVerified && <p className="register-success-message">이메일 인증이 완료되었습니다.</p>}
                                </div>

                                {/* ✅ 주소 입력 */}
                                <div className="form-group">
                                    <label>주소</label>
                                    <div className="zip-container">
                                        <input type="text" name="zipNum" value={formData.zipNum} className="form-input zip-input" readOnly />
                                        <button type="button" onClick={openAddressModal} className="search-btn" disabled={!isVerified}>
                                            우편번호 찾기
                                        </button>
                                    </div>
                                    <input type="text" name="memberAddress1" value={formData.memberAddress1} className="form-input address-input" readOnly />
                                    <input 
                                        type="text" 
                                        name="memberAddress2" 
                                        className="form-input" 
                                        placeholder="상세 주소 (예: 101동 202호)" 
                                        value={formData.memberAddress2} 
                                        onChange={handleChange} 
                                    />
                                </div>

                                {/* ✅ 주소 검색 모달 */}
                                {isAddressModalOpen && (
                                    <>
                                        <div className="zip-modal-overlay" onClick={() => setIsAddressModalOpen(false)}></div>
                                        <div className="zip-modal-content">
                                            <DaumPostcode onComplete={handleAddressSelect} />
                                            <button onClick={() => setIsAddressModalOpen(false)} className="zip-modal-close-btn">닫기</button>
                                        </div>
                                    </>
                                )}

                                <div className="button-container">
                                    <button type="button" className="mypage-button" onClick={handleSubmit}>
                                        수정하기
                                    </button>
                                    <button type="button" className="cancel-button" onClick={handleCancel}>
                                        취소하기
                                    </button>
                                </div>
                            </form>
                            <button className="withdraw-button" onClick={() => setIsWithdrawalModalOpen(true)}>
                                회원 탈퇴
                            </button>

                            <WithdrawalModal
                                isOpen={isWithdrawalModalOpen}
                                onClose={() => setIsWithdrawalModalOpen(false)}
                                memberId={formData.memberId}  // ✅ memberId 전달
                            />

                        </div>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};

export default EditProfile;
