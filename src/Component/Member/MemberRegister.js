import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DaumPostcode from "react-daum-postcode";
import Modal from "react-modal";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // FontAwesome 아이콘 추가
import "../../style/MemberRegister.css";
import "../../style/ModalStyle.css";
import kakaoLoginImage from '../image/kakao_login.png';
import { useSelector } from "react-redux";



const MemberRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        memberId: "",
        memberPwd: "",
        confirmPwd: "",
        memberName: "",
        memberPhone: "",
        memberBirthdate :"",
        memberEmail: "",
        memberAddress1: "",
        memberAddress2: "",
        memberAddress3: "",
        zipNum: "",
        birthdate: "",
    });

    const KAKAO_AUTH_URL = "https://kauth.kakao.com/oauth/authorize?client_id=6ee1731553a983102257108c54fe99bc&redirect_uri=http://localhost:8070/member/kakaoLogin&response_type=code";

    const handleKakaoLogin = () => {
        window.location.href = KAKAO_AUTH_URL;
    };

    const [errors, setErrors] = useState({});
    const [isIdAvailable, setIsIdAvailable] = useState(null); // 아이디 중복 확인 상태
    const [isVerificationSent, setIsVerificationSent] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리

    const [emailId, setEmailId] = useState(""); // 이메일 아이디 입력
    const [emailDomain, setEmailDomain] = useState(""); // 이메일 도메인 선택
    const [customDomain, setCustomDomain] = useState(""); // 직접 입력 도메인
    const [isCustomDomain, setIsCustomDomain] = useState(false); // 직접 입력 여부

    const [emailVerificationCode, setEmailVerificationCode] = useState(""); // 사용자가 입력한 인증 코드
    const [isEmailVerified, setIsEmailVerified] = useState(false); // 이메일 인증 완료 여부
    const jwtToken = useSelector(state => state.user.accessToken);  // Redux에서 accessToken을 가져옴



    // 입력 필드 값 변경 핸들러
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    

    // 회원가입 유효성 검사
    const validateForm = () => {
        let newErrors = {};

        if (!formData.memberId) newErrors.memberId = "아이디를 입력하세요.";
        if (!formData.memberPwd) newErrors.memberPwd = "비밀번호를 입력하세요.";
        if (formData.memberPwd !== formData.confirmPwd) newErrors.confirmPwd = "비밀번호가 일치하지 않습니다.";
        if (!formData.memberName) newErrors.memberName = "이름을 입력하세요.";
        if (!formData.memberPhone) newErrors.memberPhone = "전화번호를 입력하세요.";
        if (!formData.memberEmail) newErrors.memberEmail = "이메일을 입력하세요.";
        // if (!formData.memberAddress1) newErrors.memberAddress1 = "기본 주소를 입력하세요.";
        // if (!formData.zipNum) newErrors.zipNum = "우편번호를 입력하세요.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };



    // 아이디 입력 시 기존 결과 초기화
    const handleIdChange = (e) => {
        setFormData({ ...formData, memberId: e.target.value });
        setIsIdAvailable(null); // 새로운 아이디 입력 시 상태 초기화
    };

    const checkIdAvailability = async () => {
        if (!formData.memberId) {
            setErrors({ ...errors, memberId: "아이디를 입력하세요." });
            return;
        }
    
        try {
            const response = await axios.post("/api/member/idCheck", {
                userid: formData.memberId, // ShoesShop 방식
            });
    
            if (response.data === "usable") {
                setIsIdAvailable(true);
                setErrors({ ...errors, memberId: "" }); // 에러 메시지 제거
            } else {
                setIsIdAvailable(false);
                setErrors({ ...errors, memberId: "이미 사용 중인 아이디입니다." });
            }
        } catch (error) {
            console.error("아이디 중복 확인 오류:", error);
            setErrors({ ...errors, memberId: "서버 오류가 발생했습니다." });
        }
    };
    

    // 비밀번호 유효성 검사 함수
    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    // 비밀번호 입력 핸들러
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setFormData({ ...formData, memberPwd: newPassword });

        let passwordErrors = [];

        if (!newPassword) {
            passwordErrors.push("비밀번호를 입력해 주세요.");
        } else if (!validatePassword(newPassword)) {
            passwordErrors.push("비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.");
        }

        if (formData.confirmPwd && newPassword !== formData.confirmPwd) {
            passwordErrors.push("비밀번호가 일치하지 않습니다.");
        }

        setErrors({ ...errors, confirmPwd: passwordErrors });
    };

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // 비밀번호 보기/숨기기 토글 함수
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };


    // 비밀번호 확인 입력 핸들러
    const handleConfirmPasswordChange = (e) => {
        const confirmPwd = e.target.value;
        setFormData({ ...formData, confirmPwd: confirmPwd });

        let passwordErrors = [];

        if (!formData.memberPwd) {
            passwordErrors.push("비밀번호를 입력해 주세요.");
        } else if (!validatePassword(formData.memberPwd)) {
            passwordErrors.push("비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.");
        }

        if (confirmPwd !== formData.memberPwd) {
            passwordErrors.push("비밀번호가 일치하지 않습니다.");
        }

        setErrors({ ...errors, confirmPwd: passwordErrors });
    };

    const handlePhoneChange = (e) => {
        // 입력값에서 숫자만 남기고 모든 문자 제거
        const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
        setFormData({ ...formData, memberPhone: onlyNumbers });
    };

    // 생년월일 유효성 검사 함수
    const validateBirthdate = (birthdate) => {
        const birthDateObj = new Date(birthdate);
        const currentDate = new Date();
    
        // 만 나이 계산
        let age = currentDate.getFullYear() - birthDateObj.getFullYear();
        const monthDiff = currentDate.getMonth() - birthDateObj.getMonth();
        const dayDiff = currentDate.getDate() - birthDateObj.getDate();
    
        // 생일이 지나지 않았다면, 나이 -1
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }
    
        if (birthDateObj >= currentDate) {
            return "올바른 생년월일을 입력하세요."; // 오늘 이후 날짜 선택 불가
        }
        if (age < 14) {
            return "만 14세 이상만 가입할 수 있습니다."; // 14세 미만 거부
        }
        if (birthDateObj.getFullYear() < 1920) {
            return "너무 오래된 연도를 입력하셨습니다."; // 1920년 이전 거부
        }
        return "";
    };
    
    

    // 생년월일 입력 핸들러
    const handleBirthdateChange = (e) => {
        const birthdate = e.target.value;
        const today = new Date().toISOString().split("T")[0]; // 현재 날짜 (YYYY-MM-DD)
    
        if (birthdate > today) {
            setErrors({ ...errors, birthdate: "생년월일은 미래 날짜를 선택할 수 없습니다." });
        } else {
            setErrors({ ...errors, birthdate: "" });
            setFormData({ ...formData, birthdate });
        }
    };
    
    // 이메일 아이디 변경 핸들러
    const handleEmailIdChange = (e) => {
        setEmailId(e.target.value);
        resetEmailVerification(); // 이메일 변경 시 인증 상태 초기화
    };

    // 도메인 선택 핸들러
    const handleDomainChange = (e) => {
        const selectedDomain = e.target.value;
        setIsCustomDomain(selectedDomain === "custom");
        setEmailDomain(selectedDomain === "custom" ? "" : selectedDomain);
        resetEmailVerification(); // 도메인 변경 시 인증 상태 초기화
    };

    // 도메인 직접 입력 핸들러
    const handleCustomDomainChange = (e) => {
        setEmailDomain(e.target.value);
        resetEmailVerification(); // 직접 입력 도메인 변경 시 인증 상태 초기화
    };

    // 이메일 변경 시 인증 상태 초기화 함수
    const resetEmailVerification = () => {
        setIsEmailVerified(false); // 이메일 인증 상태 초기화
        setIsVerificationSent(false); // 인증 요청 상태 초기화
        setEmailVerificationCode(""); // 인증 코드 초기화
    };

    
    // 이메일 값 합쳐서 memberEmail 저장
    useEffect(() => {
        setFormData({ ...formData, memberEmail: `${emailId}@${emailDomain}` });
    }, [emailId, emailDomain]);
    
    
    // 이메일 인증 요청

    const BASE_URL = process.env.NODE_ENV === "production" 
    ? "http://43.201.136.44:8070"  // ✅ AWS 배포 환경에서 백엔드 API 주소
    : "http://localhost:8070"; // ✅ 로컬 개발 환경
   

    const requestEmailVerification = async () => {
        // Redux 상태에서 JWT 토큰을 가져옴 (여기서는 예시로 'jwtToken'을 사용)
        const jwtToken = localStorage.getItem('jwtToken'); // 또는 Redux 상태에서 가져오기
    
        // 이메일 입력 체크
        if (!emailId || !emailDomain) {
            alert("이메일을 입력하세요.");
            return;
        }
    
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
    
            // 로그인된 상태일 경우 JWT 토큰을 Authorization 헤더에 추가
            if (jwtToken) {
                headers['Authorization'] = 'Bearer ' + jwtToken;
            }
    
            const response = await fetch("/api/member/auth/send-email", {
                method: "POST",
                //headers: headers,
                headers: { 'Content-Type': 'application/json' },  // ❌ JWT 토큰 제거
                body: JSON.stringify({ email: `${emailId}@${emailDomain}` }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error: ${errorData.error || 'Unknown error occurred'}`);
            }
    
            const data = await response.json();
            if (data.success) {
                setIsVerificationSent(true);
                alert("인증 코드가 이메일로 전송되었습니다.");
            } else {
                alert("이메일 전송에 실패했습니다.");
            }
        } catch (error) {
            console.error("이메일 전송 오류:", error);
            alert("오류가 발생했습니다: " + error.message);
        }
    };
    
    const verifyEmailCode = async () => {
        // Redux 상태 또는 localStorage에서 JWT 토큰을 가져옴
        const jwtToken = localStorage.getItem('jwtToken'); // 또는 Redux 상태에서 가져오기
    
        try {
            const response = await fetch("/api/member/auth/verify-email", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    // 로그인된 상태일 경우 JWT 토큰을 Authorization 헤더에 추가
                    ...(jwtToken && { 'Authorization': 'Bearer ' + jwtToken }) // JWT 토큰이 있을 경우 Authorization 헤더 추가
                },
                body: JSON.stringify({ email: `${emailId}@${emailDomain}`, code: emailVerificationCode }),
            });
    
            const data = await response.json();
            console.log("서버 응답:", data);
    
            if (data.success) {
                setIsEmailVerified(true);
                setErrors(prevErrors => ({ ...prevErrors, memberEmail: "" })); // 오류 메시지 제거
                alert("이메일 인증이 완료되었습니다.");
            } else {
                alert("인증 코드가 일치하지 않습니다.");
            }
        } catch (error) {
            console.error("이메일 인증 오류:", error);
            alert("오류가 발생했습니다: " + error.message);
        }
    };
    
    


    // 우편번호 검색 창 열기
    const openPostcodeModal = () => {
        setIsModalOpen(true);
    };

    // 우편번호 검색 창 닫기
    const closePostcodeModal = () => {
        setIsModalOpen(false);
    };

    // 우편번호 검색 결과 처리
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
            fullAddress += `(${extraAddress})`;
        }

        setFormData({
            ...formData,
            zipNum: data.zonecode, // 우편번호
            memberAddress1: fullAddress, // 기본 주소
        });

        closePostcodeModal(); // 모달 닫기
    };


    // 회원가입 요청
const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("✅ handleSubmit 실행됨"); // 디버깅 로그
    console.log("현재 formData 값:", formData); // formData 값 확인

    let newErrors = {};

    // 필수 입력 필드 검사
    if (!formData.memberId) newErrors.memberId = "아이디를 입력해 주세요!";
    if (!formData.memberPwd) newErrors.memberPwd = "비밀번호를 입력해 주세요!";
    if (!formData.memberName) newErrors.memberName = "이름을 입력해 주세요!";
    if (!formData.memberEmail) newErrors.memberEmail = "이메일을 입력해 주세요!";

    // 아이디 중복 확인 여부 체크
    if (isIdAvailable === null) {
        newErrors.memberId = "아이디 중복 확인을 해주세요!";
    } else if (isIdAvailable === false) {
        newErrors.memberId = "이미 사용 중인 아이디입니다!";
    }

    // 이메일 인증 여부 체크
    if (!isEmailVerified) {
        newErrors.memberEmail = "이메일 인증을 완료해야 합니다!";
    }

    // 오류가 있으면 화면에 표시하고 요청 중단
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
        console.log("⚠️ 필수 입력 항목 미입력 또는 오류 발생", newErrors);
        return;
    }

    // 회원가입 데이터 준비
    const registrationData = {
        memberId: formData.memberId,
        memberPwd: formData.memberPwd,
        memberName: formData.memberName,
        memberPhone: formData.memberPhone,
        memberEmail: formData.memberEmail,
        memberBirthdate: formData.birthdate ? formData.birthdate : null, // 🔥 선택 사항
        memberAddress1: formData.memberAddress1,
        memberAddress2: formData.memberAddress2,
        memberAddress3: formData.memberAddress3,
        zipNum: formData.zipNum,
        isVerified: isEmailVerified, // 이메일 인증 여부 추가
    };

    console.log("회원가입 요청 데이터:", registrationData); // 디버깅 로그

    try {
        const response = await fetch("/api/member/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registrationData),
        });

        const data = await response.json();
        console.log("서버 응답:", data); // 서버 응답 확인

        if (response.ok) {
            alert("회원가입이 완료되었습니다! 🎉");

            // ✅ 5000P 지급 여부 확인 후 알림 표시
            if (data.birthdateRewarded) {
                alert("🎂 생일 입력으로 5000P가 지급되었습니다! 🎁");
            }

            navigate("/login"); // ✅ 로그인 페이지로 이동
        } else {
            alert(data.msg);
        }
    } catch (error) {
        console.error("회원가입 오류: ", error);
        alert("회원가입 중 오류가 발생했습니다.");
    }
};

    
    

    return (
        <main id="register-container">
            <article id="register-article">
                <h2 id="register-title">회원가입</h2>
                <form id="register-form" onSubmit={handleSubmit}>
                    <div className="id-container">
                        <label htmlFor="memberId" className="member-register-label">아이디</label>
                        <div className="id-input-container">
                            <input 
                                type="text" 
                                name="memberId" 
                                placeholder="아이디 (이메일 형식 가능)" 
                                value={formData.memberId} 
                                onChange={handleIdChange} 
                                className="register-input id-input"
                            />
                            <button 
                                type="button" 
                                onClick={checkIdAvailability} 
                                className="check-btn"
                            >
                                중복 확인
                            </button>
                        </div>

                        {/* 오류 메시지 또는 중복 확인 결과를 입력란 아래에 표시 */}
                        <div className="message-container">
                            {errors.memberId && <p className="error-message">{errors.memberId}</p>}
                            {isIdAvailable !== null && !errors.memberId && (
                                <p className={`register-message ${isIdAvailable ? "success" : "error"}`}>
                                    {isIdAvailable ? "사용 가능한 아이디입니다." : "이미 사용 중인 아이디입니다."}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="memberPwd" className="member-register-label">비밀번호</label>
                        <div className="password-container">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="memberPwd" 
                                placeholder="비밀번호 (8자 이상 영문+숫자+특수문자 포함)" 
                                value={formData.memberPwd} 
                                onChange={handlePasswordChange} 
                                className="register-input" 
                            />
                            <button type="button" className="toggle-password-btn" onClick={togglePasswordVisibility}>
                                {showPassword ? <FaEyeSlash className="toggle-password-icon" /> : <FaEye className="toggle-password-icon" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPwd" className="member-register-label">비밀번호 확인</label>
                        <div className="password-container">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                name="confirmPwd" 
                                placeholder="비밀번호 확인" 
                                value={formData.confirmPwd} 
                                onChange={handleConfirmPasswordChange} 
                                className="register-input" 
                            />
                        </div>
                    </div>

                    {/* 오류 메시지 표시 */}
                    {errors.confirmPwd && errors.confirmPwd.length > 0 && (
                        <div className="register-error">
                            {errors.confirmPwd.map((error, index) => (
                                <p key={index} className="register-error-message">{error}</p>
                            ))}
                        </div>
                    )}

                    <div>
                        <label htmlFor="memberName" className="member-register-label">이름</label>
                        <input type="text" name="memberName" placeholder="이름" value={formData.memberName} onChange={handleChange}className="register-input" />
                    </div>
                    {errors.memberName && <p className="register-error">{errors.memberName}</p>}
                    
                    <div>
                        <label htmlFor="memberPhone" className="member-register-label">전화번호</label>
                        <input 
                            type="text" 
                            name="memberPhone" 
                            placeholder="전화번호 (숫자만 입력)" 
                            value={formData.memberPhone} 
                            onChange={handlePhoneChange} 
                            className="register-input"
                        />
                    </div>
                    {errors.memberPhone && <p className="register-error">{errors.memberPhone}</p>}

                    <div>
                        <label htmlFor="memberBirthdate" className="member-register-label">생년월일</label>
                        <input 
                        type="date" 
                        name="birthdate" 
                        value={formData.birthdate} 
                        onChange={handleBirthdateChange} 
                        min="1920-01-01" max={new Date().toISOString().split("T")[0]} className="register-input" 
                        />
                        <p className="birthdate-info">생년월일 입력 시 최초 1회 5000P가 지급됩니다.</p>
                    </div>
                    {errors.birthdate && <p className="register-error">{errors.birthdate}</p>}

                    <div>
                        <label htmlFor="memberEmail" className="member-register-label">이메일</label>
                        <div className="email-container">
                            {/* ✅ 이메일 인증 요청 버튼 */}
                            <div className="email-container">
                            <input 
                                type="text" 
                                placeholder="이메일 아이디" 
                                value={emailId} 
                                onChange={handleEmailIdChange} 
                                className="register-input email-id"
                            />
                            <span className="email-at">@</span>
                            {!isCustomDomain ? (
                                <select className="email-select" onChange={handleDomainChange}>
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
                                placeholder="도메인 입력 (예: example.com)" 
                                value={emailDomain} 
                                onChange={handleCustomDomainChange} 
                                className="register-input email-custom"
                                />
                            )}
                            <button 
                                type="button" 
                                onClick={requestEmailVerification} 
                                disabled={isVerificationSent || !emailId || !emailDomain} 
                                className="verification-btn"
                            >
                                {isVerificationSent ? "전송 완료" : "인증 요청"}
                            </button>
                            </div>

                        </div>
                    </div>
                    {/* 이메일 인증 코드 입력 */}
                    {isVerificationSent && (
                        <div className="email-verification-container">
                            <input 
                                type="text" 
                                placeholder="인증 코드 입력" 
                                value={emailVerificationCode} 
                                onChange={(e) => setEmailVerificationCode(e.target.value)}
                                className="register-input email-code-input"
                            />
                            <button 
                            type="button" 
                            onClick={verifyEmailCode} 
                            disabled={isEmailVerified} 
                            className={`verification-btn ${isEmailVerified ? "verified" : ""}`}
                            >

                                {isEmailVerified ? "인증 완료" : "인증 확인"}
                            </button>
                        </div>
                    )}
                    {isEmailVerified && (
                        <p className="register-success-message">이메일 인증이 완료되었습니다.</p>
                    )}
                    {errors.memberEmail && <p className="register-error">{errors.memberEmail}</p>}
                    <div>
                        <label htmlFor="" className="member-register-label">주소</label>
                        <div className="zip-container">
                            <input 
                                type="text" 
                                name="zipNum" 
                                placeholder="우편번호" 
                                value={formData.zipNum} 
                                readOnly
                                className="register-input zip-input"
                            />
                            <button 
                                type="button" 
                                onClick={openPostcodeModal} 
                                className="search-btn check-btn"
                            >
                                우편번호 찾기
                            </button>
                        </div>

                        <input 
                            type="text" 
                            name="memberAddress1" 
                            placeholder="기본 주소" 
                            value={formData.memberAddress1} 
                            readOnly
                            className="register-input"
                        />

                        <input 
                            type="text" 
                            name="memberAddress2" 
                            placeholder="상세 주소 (예: 101동 202호)" 
                            value={formData.memberAddress2} 
                            onChange={(e) => setFormData({ ...formData, memberAddress2: e.target.value })}
                            className="register-input"
                        />
                    </div>
                    {isModalOpen && (
                        <>
                            <div className="zip-modal-overlay" onClick={closePostcodeModal}></div>
                            <div className="zip-modal-content">
                                <DaumPostcode onComplete={handleAddressSelect} />
                                <button onClick={closePostcodeModal} className="zip-modal-close-btn">닫기</button>
                            </div>
                        </>
                    )}
                    {errors.zipNum && <p className="register-error">{errors.zipNum}</p>}

                    <button type="submit" id="register-button">
                        회원가입
                    </button>
                    <p className="sns-login-text">카카오 계정으로 간편하게 회원가입하세요</p>
                    <div className="login-page-sns">
                        <img
                            src={kakaoLoginImage}  // 기존 이미지 유지
                            alt="카카오 로그인"
                            className="kakao-button"
                            onClick={handleKakaoLogin} // 변경된 로그인 요청 함수 적용
                        />
                    </div>
                </form>
            </article>
        </main>
    );
};

export default MemberRegister;