import React, { useState, useEffect } from "react";
import axios from "axios";
import { Cookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginAction, logoutAction, fetchUserInfo } from "../store/userSlice";
import "../style/index.css";
import "../style/login.css";
import kakaoLoginImage from "./image/kakao_login.png";
import { FaUser, FaLock } from "react-icons/fa";

const Login = () => {
  const [memberId, setMemberId] = useState("");
  const [memberPwd, setMemberPwd] = useState("");
  const cookies = new Cookies();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loginUser = useSelector((state) => state.user);
  console.log("🟢 [Login.js] Redux 로그인 상태 확인:", loginUser);

  const KAKAO_AUTH_URL =
    "https://kauth.kakao.com/oauth/authorize?client_id=6ee1731553a983102257108c54fe99bc&redirect_uri=http://43.201.136.44/login&response_type=code";

  const handleKakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };
  useEffect(() => {
    console.log("🟢 [Login.js] useEffect 실행됨");
    const params = new URLSearchParams(window.location.search);
    const kakaoCode = params.get("code");

    if (!kakaoCode) {
      console.log("🔴 [Login.js] 카카오 로그인 코드 없음. useEffect 종료");
      return;
    }

    console.log("🔹 [Login.js] 카카오 로그인 요청 중, 코드:", kakaoCode);
    const kakao_login = async () => {
      let result = await axios.get(`/api/member/kakaoLogin?code=${kakaoCode}`, {
        withCredentials: true,
      });
      if (result.data) {
        localStorage.setItem(
          "loginUser",
          JSON.stringify(result.data.loginUser)
        );
        // result= await axios.get('/api/member/loginLocal',)
        console.log("result.data", result.data);
        const kakaoLoginUser = result.data.loginUser;
        result = await axios.post("/api/member/loginLocal", null, {
          params: { username: kakaoLoginUser.memberId, password: "kakao" },
        });
        if (result.data) {
          console.log("✅ [Login.js] 로그인 성공:", result.data);
          dispatch(loginAction(result.data));

          // ✅ 로그인 성공 후 서버에서 정보 다시 불러오기
          setTimeout(() => {
            dispatch(fetchUserInfo());
          }, 500);
          navigate("/");
        }
      }
    };
    kakao_login();
    // .then(response => {
    //     console.log("✅ [Login.js] 로그인 성공:", response.data);
    //     // dispatch(loginAction(response.data.loginUser));

    //     // ✅ 로그인 성공 후 서버에서 정보 다시 불러오기
    //     setTimeout(() => {
    //         dispatch(fetchUserInfo());
    //     }, 500);

    //     navigate("/");  // ✅ 로그인 성공 후 메인 페이지 이동
    // })
    // .catch(error => {
    //     console.error("🚨 [Login.js] 로그인 실패:", error);
    //     if (error.response && error.response.status === 401) {
    //         console.log("🛑 [Login.js] 401 Unauthorized - 로그아웃 처리 및 재로그인 요청");
    //         dispatch(logoutAction());
    //         localStorage.removeItem("persist:user");
    //         alert("[Login.js] 카카오 로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
    //         navigate("/login");
    //     }
    // });
  }, [navigate, dispatch]);

  const onloginlocal = (e) => {
    e.preventDefault();

    axios
      .post("/api/member/loginLocal", null, {
        params: { username: memberId, password: memberPwd },
        withCredentials: true, // 쿠키 포함하여 요청
      })
      .then((response) => {
        if (response.data.error === "ERROR_LOGIN") {
          alert("아이디 또는 비밀번호가 일치하지 않습니다.");
        } else {
          alert("로그인 성공");
          console.log("response.data", response.data);
        }
        console.log("✅ [Login.js] 로그인 응답 데이터:", response.data);

        // 로그인 성공 시 응답 데이터에서 직접 사용자 정보 추출
        let loginUser = {
          memberId: response.data.memberId,
          memberName: response.data.memberName,
          memberEmail: response.data.memberEmail,
          memberPhone: response.data.memberPhone,
          memberAddress1: response.data.memberAddress1,
          memberAddress2: response.data.memberAddress2,
          memberAddress3: response.data.memberAddress3,
          roleNames: response.data.roleNames,
          // 추가적으로 필요한 값들
          accessToken: response.data.accessToken, // 응답에서 받은 accessToken
          refreshToken: response.data.refreshToken, // 응답에서 받은 refreshToken
        };

        // 🚨 loginUser가 문자열이면 Redux에 저장하지 않도록 차단
        if (typeof loginUser === "string") {
          console.error(
            "🚨 [Login.js] 예상치 못한 로그인 응답 데이터:",
            loginUser
          );
          alert("[Login.js] 세션 오류가 발생했습니다. 다시 로그인해주세요.");
          return;
        }

        console.log("✅ [Login.js] Redux 상태 업데이트 데이터:", loginUser);

        // ✅ Redux 상태에 로그인 정보와 accessToken 저장
        dispatch(loginAction(loginUser));

        // ✅ 쿠키에 로그인 정보 저장 (accessToken 포함)
        cookies.set(
          "loginUser",
          {
            ...loginUser,
            accessToken: response.data.accessToken, // 토큰을 쿠키에 저장
            refreshToken: response.data.refreshToken, // refreshToken도 저장
          },
          { path: "/" }
        );

        navigate("/"); // 로그인 후 홈 화면으로 이동
      })
      .catch((error) => {
        console.error("❌ [Login.js] 로그인 요청 실패:", error);

        if (error.response && error.response.status === 401) {
          console.log(
            "🛑 [Login.js] 401 Unauthorized - 로그아웃 처리 및 재로그인 요청"
          );
          dispatch(logoutAction()); // ✅ Redux 상태 초기화
          localStorage.removeItem("persist:user"); // ✅ Redux Persist 데이터 삭제
          alert(
            "[Login.js] 로그인 정보가 유효하지 않습니다. 다시 로그인해주세요."
          );
          navigate("/login"); // 로그인 페이지로 이동
        }
      });
  };

  return (
    <article className="login-page-container">
      <section className="login-page-form">
        <h1 className="login-page-title">로그인</h1>
        <form onSubmit={onloginlocal}>
          <div className="login-page-form-group">
            {/* <label htmlFor="memberId">아이디</label> */}
            <FaUser className="login-icon" />
            <input
              type="text"
              id="memberId"
              name="username"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="아이디 (이메일 형식 가능)"
            />
          </div>
          <div className="login-page-form-group">
            {/* <label htmlFor="member_pwd">비밀번호</label> */}
            <FaLock className="login-icon" />
            <input
              type="password"
              id="memberPwd"
              name="password"
              value={memberPwd}
              onChange={(e) => setMemberPwd(e.target.value)}
              placeholder="비밀번호 (영문, 숫자, 특수문자 포함 8자 이상)"
            />
          </div>
          <button type="submit" className="login-page-button">
            로그인
          </button>
        </form>
        <button
          className="login-page-signup-button"
          onClick={() => navigate("/memberTerms")}
        >
          회원가입
        </button>
        <p className="sns-login-text">카카오 계정으로 간편하게 로그인하세요</p>
        <div className="login-page-sns">
          <img
            src={kakaoLoginImage} // 기존 이미지 유지
            alt="카카오 로그인"
            className="kakao-button"
            onClick={handleKakaoLogin} // 변경된 로그인 요청 함수 적용
          />
        </div>
      </section>
    </article>
  );
};

export default Login;
