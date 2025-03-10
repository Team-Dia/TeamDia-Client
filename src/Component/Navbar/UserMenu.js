import React, { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutAction } from "../../store/userSlice";
import jaxios from "../../util/jwtUtil";

const UserMenu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const handleLogout = useCallback(() => {
    dispatch(logoutAction());
    localStorage.removeItem("loginUser");

    setTimeout(() => {
      jaxios
        .post("/api/member/logout", {}, { withCredentials: true })
        .then(() => alert("로그아웃이 완료되었습니다."))
        .catch(() => alert("로그아웃 처리 중 오류가 발생했습니다."))
        .finally(() => (window.location.href = "/"));
    }, 100);
  }, [dispatch]);

  const handleMyPageClick = useCallback(
    (event) => {
      if (!user?.memberId) {
        event.preventDefault();
        alert("로그인 후 사용할 수 있습니다.");
        navigate("/login");
      }
    },
    [user?.memberId, navigate]
  );

  return (
    <div className="nav-icons">
      {user?.memberId ? (
        <>
          <div className="nav-nickname">
            {user.memberName || user.memberId} 님
          </div>
          <div className="nav-item" onClick={handleLogout}>
            <i className="ri-logout-box-line"></i>
            <span className="nav-text">Logout</span>
          </div>
        </>
      ) : (
        <Link to="/login" className="nav-item">
          <i className="ri-login-box-line"></i>
          <span className="nav-text">Login</span>
        </Link>
      )}
      <Link
        to="/myPage"
        className="nav-item"
        id="mypage-link"
        onClick={handleMyPageClick}
      >
        <i className="ri-user-fill"></i>
        <span className="nav-text">Mypage</span>
      </Link>
      <Link to="/cartlist" className="nav-item" id="cart-link">
        <i className="ri-shopping-bag-fill"></i>
        <span className="nav-text">Cart</span>
      </Link>
    </div>
  );
};

export default UserMenu;
