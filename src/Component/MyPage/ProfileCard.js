import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateBirthdate } from "../../store/userSlice";
import { logoutAction, loginAction } from "../../store/userSlice";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faCoins,
  faBirthdayCake,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import profilePlaceholder from "../image/profile-placeholder.png";
import "./ProfileCard.css";
import jaxios from "../../util/jwtUtil";

const ProfileCard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loginUser = useSelector((state) => state.user);

  if (loginUser) {
    console.log("🟢 Redux 상태 확인:", loginUser);
    console.log(
      "🟡 생년월일 포함 여부:",
      loginUser.memberBirthdate !== undefined
    );
  }

  const [points, setPoints] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [birthdate, setBirthdate] = useState("");

  // 생일 입력 여부 확인 (Redux 상태 기반)
  const needsBirthdate =
    !loginUser?.memberBirthdate || loginUser.memberBirthdate.trim() === "";

  // ✅ 총 보유 포인트 가져오기
  const fetchTotalPoints = async (userId) => {
    try {
      if (!userId) return;
      const response = await jaxios.get(`/api/member/${userId}/points`);
      return response.data?.points || 0;
    } catch (error) {
      console.error("🚨 총 보유 포인트 불러오기 실패:", error);
      return 0;
    }
  };

  // ✅ 최신 포인트 변동 내역 가져오기
  const fetchPointHistory = async (userId) => {
    try {
      if (!userId) return;
      const response = await jaxios.get(
        `/api/points/history/${userId}?page=0&size=1`
      );
      return response.data.content?.[0]?.remainingPoints || 0;
    } catch (error) {
      console.error("🚨 포인트 변동 내역 불러오기 실패:", error);
      return 0;
    }
  };

  // ✅ 최신 포인트 가져오기 (총 보유 포인트와 변동 내역 비교)
  const fetchPoints = async (userId) => {
    const totalPoints = await fetchTotalPoints(userId);
    const latestRemainingPoints = await fetchPointHistory(userId);

    const finalPoints = Math.max(totalPoints, latestRemainingPoints); // ✅ 최신 값 선택
    setPoints(finalPoints);
    dispatch(loginAction({ ...loginUser, points: finalPoints })); // ✅ Redux 상태 업데이트
  };

  // // ✅ 포인트 가져오는 함수 (useEffect 바깥에서 정의)
  // const fetchPoints = async (userId) => {
  //     try {
  //         if (!userId) return; // 🔥 로그인 ID 없을 때 실행 방지
  //         const response = await axios.get(`http://localhost:8070/member/${userId}/points`);
  //         if (response.data?.points !== undefined) {
  //             setPoints(response.data.points);
  //             dispatch(loginAction({ ...loginUser, points: response.data.points })); // Redux 상태 업데이트
  //         }
  //     } catch (error) {
  //         console.error("🚨 포인트 불러오기 실패:", error);
  //     }
  // };

  const fetchReviewCount = async (userId) => {
    try {
      const response = await jaxios.get(`/api/member/${userId}/reviews/count`);
      if (response.data && typeof response.data.count === "number") {
        setReviewCount(response.data.count);
      }
    } catch (error) {
      console.error("🚨 리뷰 개수 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    if (!loginUser?.memberId) return;

    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/member/userinfo", {
          withCredentials: true,
        });
        if (isMounted && response.data?.memberId) {
          dispatch(loginAction(response.data)); // Redux 상태 업데이트
        }
      } catch (error) {
        if (isMounted && error.response?.status === 401) {
          dispatch(logoutAction());
          localStorage.removeItem("persist:user");
          alert(
            "[ProfileCard] 로그인 세션이 만료되었습니다. 다시 로그인해주세요."
          );
          window.location.href = "/login";
        }
      }
    };

    fetchUserData();
    fetchPoints(loginUser?.memberId);
    fetchReviewCount(loginUser?.memberId);

    return () => {
      isMounted = false;
    };
  }, [dispatch, loginUser?.memberId]); // ✅ loginUser 변경 시 실행

  useEffect(() => {
    if (loginUser && loginUser.points !== undefined) {
      setPoints(loginUser.points || 0);
    }
  }, [loginUser.points]); // ✅ Redux 상태 변경 시 자동 반영

  const handleSaveBirthdate = async () => {
    if (!birthdate) {
      alert("생년월일을 입력해주세요.");
      return;
    }

    try {
      const response = await jaxios.post(`/api/member/update-birthdate`, {
        memberId: loginUser.memberId,
        birthdate: birthdate,
      });

      if (response.data.success) {
        alert(response.data.message);

        // Redux 상태 업데이트
        dispatch(updateBirthdate(birthdate));

        // 📌 최신 포인트 값을 다시 가져와서 업데이트
        fetchPoints(loginUser.memberId);

        setShowModal(false);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("🚨 생일 저장 실패:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <>
      <div className="mypage-profile-card">
        <div className="profile-info">
          <img
            src={profilePlaceholder}
            alt="프로필 사진"
            className="profile-img"
          />
          <div className="profile-text">
            <h2>
              {typeof loginUser?.memberName === "string"
                ? `${loginUser.memberName} 님, 오늘도 반짝이는 하루 되세요! ✨`
                : "사용자"}
            </h2>
          </div>
        </div>

        <div className="profile-stats">
          <div
            className="profile-stat"
            onClick={() => navigate("/mypage/reviews")}
          >
            <FontAwesomeIcon
              icon={faPenToSquare}
              className="fa-icon review-icon"
            />
            <span>후기 {reviewCount}개</span>
          </div>

          <div className="profile-stat">
            <FontAwesomeIcon icon={faCoins} className="fa-icon point-icon" />
            <span>포인트 {points}P</span>
          </div>
        </div>
      </div>

      {needsBirthdate && (
        <div className="birthdate-banner">
          <div className="birthdate-banner-text">
            <FontAwesomeIcon icon={faBirthdayCake} className="birthday-icon" />
            <strong>
              {loginUser?.memberName} 님, 생일을 입력하고 특별한 혜택을
              받아보세요!
            </strong>
            <span className="sub-text">
              🎁 회원님을 위한 <strong>생일 축하 포인트와 특별한 선물</strong>이
              준비되어 있어요!
            </span>
          </div>
          <button onClick={() => setShowModal(true)}>
            지금 입력하고 혜택 받기
          </button>
        </div>
      )}

      {showModal && (
        <div className="birthday-modal-overlay">
          <div className="birthday-modal-content">
            <button
              className="birthday-close-button"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h3 className="birthday-title">🎂 생일 입력</h3>
            <p className="birthday-description">
              특별한 혜택을 받기 위해 생일을 입력해주세요!
            </p>

            <input
              type="date"
              className="birthday-input"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />

            <button
              className="birthday-save-button"
              onClick={handleSaveBirthdate}
            >
              저장하기
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileCard;
