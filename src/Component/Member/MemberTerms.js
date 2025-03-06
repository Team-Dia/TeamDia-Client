import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/MemberTerms.css';

const MemberTerms = () => {
    const navigate = useNavigate();
    const [agreements, setAgreements] = useState({
        all: false,
        termsOfService: false,
        privacyPolicy: false,
        marketing: false
    });

    // 체크박스 변경 핸들러
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
    
        if (name === "all") {
            // 전체 동의 체크 시 모든 개별 항목을 동일한 상태로 변경
            setAgreements({
                all: checked,
                termsOfService: checked,
                privacyPolicy: checked,
                marketing: checked
            });
        } else {
            // 개별 항목 변경
            const updatedAgreements = { ...agreements, [name]: checked };
    
            // 모든 필수 항목이 체크되었는지 확인하여 전체 동의 체크박스 상태 업데이트
            const allChecked = updatedAgreements.termsOfService && updatedAgreements.privacyPolicy && updatedAgreements.marketing;
            updatedAgreements.all = allChecked;
    
            setAgreements(updatedAgreements);
        }
    };
    
    

    // 회원가입 페이지로 이동 (필수 항목 확인)
    const handleNext = () => {
        if (!agreements.termsOfService || !agreements.privacyPolicy) {
            alert("필수 약관에 동의해야 합니다.");
        } else {
            navigate('/memberRegister'); // 회원가입 페이지로 이동
        }
    };

    return (
        <main id="member-terms-container">
            <article id="member-terms-article">
                <h2 id="member-terms-title">회원 가입 약관 동의</h2>
                <p id="member-terms-description">서비스 이용을 위해 약관에 동의해 주세요.</p>

                <ul id="member-terms-list">
                    {/* <li className="member-terms-item">
                        <label id="member-terms-all">
                            <input 
                                type="checkbox" 
                                name="all" 
                                checked={agreements.all} 
                                onChange={handleCheckboxChange} 
                            />
                            전체 동의
                        </label>
                    </li> */}

                    {/* 이용약관 동의 */}
                    <li className="member-terms-item">
                        <h3>[필수] 이용약관 동의</h3>
                        <input 
                            type="checkbox" 
                            name="termsOfService" 
                            checked={agreements.termsOfService} 
                            onChange={handleCheckboxChange} 
                        />
                    </li>
                    <div className="terms-box">
                        <p>
                            본 이용약관은 회원가입 및 서비스 이용에 관한 내용을 담고 있으며,
                            회원은 본 약관에 따라 서비스를 이용해야 합니다. 서비스 이용과 관련하여
                            회사의 정책을 준수해야 하며, 위반 시 서비스 이용이 제한될 수 있습니다.
                            본 이용약관은 회원가입 및 서비스 이용에 관한 내용을 담고 있으며,
                            회원은 본 약관에 따라 서비스를 이용해야 합니다. 서비스 이용과 관련하여
                            회사의 정책을 준수해야 하며, 위반 시 서비스 이용이 제한될 수 있습니다.
                        </p>
                    </div>

                    <li className="member-terms-item">
                        <h3>[필수] 개인정보 처리방침 동의</h3>
                        <input 
                            type="checkbox" 
                            name="privacyPolicy" 
                            checked={agreements.privacyPolicy} 
                            onChange={handleCheckboxChange} 
                        />
                    </li>
                    <div className="terms-box">
                        <p>
                            본 개인정보 처리방침은 사용자의 개인정보 보호 및 활용 방안에 대해 설명합니다.
                            사용자의 개인정보는 안전하게 보호되며, 동의 없이 제3자에게 제공되지 않습니다.
                            개인정보 보호법 및 관련 법률을 준수하며, 사용자는 언제든지 자신의 정보 열람 및
                            삭제를 요청할 수 있습니다.
                            본 개인정보 처리방침은 사용자의 개인정보 보호 및 활용 방안에 대해 설명합니다.
                            사용자의 개인정보는 안전하게 보호되며, 동의 없이 제3자에게 제공되지 않습니다.
                            개인정보 보호법 및 관련 법률을 준수하며, 사용자는 언제든지 자신의 정보 열람 및
                            삭제를 요청할 수 있습니다.
                            본 개인정보 처리방침은 사용자의 개인정보 보호 및 활용 방안에 대해 설명합니다.
                            사용자의 개인정보는 안전하게 보호되며, 동의 없이 제3자에게 제공되지 않습니다.
                            개인정보 보호법 및 관련 법률을 준수하며, 사용자는 언제든지 자신의 정보 열람 및
                            삭제를 요청할 수 있습니다.
                            본 개인정보 처리방침은 사용자의 개인정보 보호 및 활용 방안에 대해 설명합니다.
                            사용자의 개인정보는 안전하게 보호되며, 동의 없이 제3자에게 제공되지 않습니다.
                            개인정보 보호법 및 관련 법률을 준수하며, 사용자는 언제든지 자신의 정보 열람 및
                            삭제를 요청할 수 있습니다.
                        </p>
                    </div>

                    {/* 마케팅 정보 수신 동의
                    <li className="member-terms-item">
                        <h3>[선택] 마케팅 정보 수신 동의</h3>
                        <div className="terms-box">
                            <p>
                                이벤트, 프로모션 및 할인 정보 제공을 위한 마케팅 정보를 수신하는 것에 동의합니다.
                                동의하지 않더라도 서비스 이용에는 영향을 미치지 않습니다.
                                마케팅 정보 수신 동의를 철회하고 싶을 경우, 언제든지 설정에서 변경할 수 있습니다.
                            </p>
                        </div>
                        <label>
                            <input 
                                type="checkbox" 
                                name="marketing" 
                                checked={agreements.marketing} 
                                onChange={handleCheckboxChange} 
                            />
                            동의합니다
                        </label>
                    </li> */}
                </ul>

                <div className="member-terms-all">
                    <label htmlFor="agreeAll">전체 동의</label>
                    <input 
                        type="checkbox" 
                        name="all"
                        id="agreeAll" 
                        checked={agreements.all} 
                        onChange={handleCheckboxChange} 
                    />
                </div>

                <button 
                    id="member-terms-next-button"
                    onClick={handleNext} 
                >
                    회원가입
                </button>
            </article>
        </main>
    );
};

export default MemberTerms;
