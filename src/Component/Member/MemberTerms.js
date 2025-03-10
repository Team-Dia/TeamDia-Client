import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/MemberTerms.css";

const MemberTerms = () => {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState({
    all: false,
    termsOfService: false,
    privacyPolicy: false,
    marketing: false,
  });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
  
    if (name === "all") {
      setAgreements({
        all: checked,
        termsOfService: checked,
        privacyPolicy: checked,
        marketing: checked,
      });
    } else {
      const updatedAgreements = { ...agreements, [name]: checked };
  
      // ✅ 모든 개별 체크박스가 체크되었는지 확인
      const allChecked =
        updatedAgreements.termsOfService &&
        updatedAgreements.privacyPolicy &&
        updatedAgreements.marketing;
  
      updatedAgreements.all = allChecked; // ✅ 모든 항목이 체크되면 전체 동의도 체크
  
      setAgreements(updatedAgreements);
    }
  };
  

  // 회원가입 페이지로 이동 (필수 항목 확인)
  const handleNext = () => {
    if (!agreements.termsOfService || !agreements.privacyPolicy) {
      alert("필수 약관에 동의해야 합니다.");
    } else {
      navigate("/memberRegister");
    }
  };

  return (
    <main id="member-terms-container">
      <article id="member-terms-article">
        <h2 id="member-terms-title">회원 가입 약관 동의</h2>
        <p id="member-terms-description">서비스 이용을 위해 약관에 동의해 주세요.</p>

        <ul id="member-terms-list">
          {/* ✅ 이용약관 동의 */}
          <li className="member-terms-item">
            <span className="terms-title">[필수] 이용약관 동의</span>
            <div className="member-terms-checkbox">
              <input
                type="checkbox"
                name="termsOfService"
                id="termsOfService"
                checked={agreements.termsOfService}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="termsOfService" className="custom-checkbox"></label>
            </div>
          </li>
          <div className="terms-box">
            <p>본 이용약관은 회원가입 및 서비스 이용에 관한 내용을 담고 있으며,
              회원은 본 약관에 따라 서비스를 이용해야 합니다. 서비스 이용과
              관련하여 회사의 정책을 준수해야 하며, 위반 시 서비스 이용이 제한될
              수 있습니다. 본 이용약관은 회원가입 및 서비스 이용에 관한 내용을
              담고 있으며, 회원은 본 약관에 따라 서비스를 이용해야 합니다.
              서비스 이용과 관련하여 회사의 정책을 준수해야 하며, 위반 시 서비스
              이용이 제한될 수 있습니다.본 이용약관은 회원가입 및 서비스 이용에 관한 내용을 담고 있으며,
              회원은 본 약관에 따라 서비스를 이용해야 합니다. 서비스 이용과
              관련하여 회사의 정책을 준수해야 하며, 위반 시 서비스 이용이 제한될
              수 있습니다. 본 이용약관은 회원가입 및 서비스 이용에 관한 내용을
              담고 있으며, 회원은 본 약관에 따라 서비스를 이용해야 합니다.
              서비스 이용과 관련하여 회사의 정책을 준수해야 하며, 위반 시 서비스
              이용이 제한될 수 있습니다.</p>
          </div>

          {/* ✅ 개인정보 처리방침 동의 */}
          <li className="member-terms-item">
            <span className="terms-title">[필수] 개인정보 처리방침 동의</span>
            <div className="member-terms-checkbox">
              <input
                type="checkbox"
                name="privacyPolicy"
                id="privacyPolicy"
                checked={agreements.privacyPolicy}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="privacyPolicy" className="custom-checkbox"></label>
            </div>
          </li>
          <div className="terms-box">
            <p>본 개인정보 처리방침은 사용자의 개인정보 보호 및 활용 방안에 대해
              설명합니다. 사용자의 개인정보는 안전하게 보호되며, 동의 없이
              제3자에게 제공되지 않습니다. 개인정보 보호법 및 관련 법률을
              준수하며, 사용자는 언제든지 자신의 정보 열람 및 삭제를 요청할 수
              있습니다. 본 개인정보 처리방침은 사용자의 개인정보 보호 및 활용
              방안에 대해 설명합니다. 사용자의 개인정보는 안전하게 보호되며,
              동의 없이 제3자에게 제공되지 않습니다. 개인정보 보호법 및 관련
              법률을 준수하며, 사용자는 언제든지 자신의 정보 열람 및 삭제를
              요청할 수 있습니다. 본 개인정보 처리방침은 사용자의 개인정보 보호
              및 활용 방안에 대해 설명합니다. 사용자의 개인정보는 안전하게
              보호되며, 동의 없이 제3자에게 제공되지 않습니다. 개인정보 보호법
              및 관련 법률을 준수하며, 사용자는 언제든지 자신의 정보 열람 및
              삭제를 요청할 수 있습니다. 본 개인정보 처리방침은 사용자의
              개인정보 보호 및 활용 방안에 대해 설명합니다. 사용자의 개인정보는
              안전하게 보호되며, 동의 없이 제3자에게 제공되지 않습니다. 개인정보
              보호법 및 관련 법률을 준수하며, 사용자는 언제든지 자신의 정보 열람
              및 삭제를 요청할 수 있습니다.</p>
          </div>
        </ul>

        {/* ✅ 전체 동의 */}
        <div className="member-terms-all">
          <span>전체 동의</span>
          <div className="member-terms-all-checkbox">
            <input
              type="checkbox"
              name="all"
              id="agreeAll"
              checked={agreements.all}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="agreeAll" className="custom-checkbox-all"></label>
          </div>
        </div>

        <button id="member-terms-next-button" onClick={handleNext}>
          회원가입
        </button>
      </article>
    </main>
  );
};

export default MemberTerms;
