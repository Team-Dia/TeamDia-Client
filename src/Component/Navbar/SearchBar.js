import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css"; // ✅ 스타일 적용

const recommendedKeywords = ["심플", "커플링", "골드", "실버", "큐빅"];

const SearchBar = () => {
    const navigate = useNavigate();
    const [searchKeyword, setSearchKeyword] = useState("");
  
    const handleSearch = useCallback(() => {
      if (searchKeyword.trim() !== "") {
        sessionStorage.removeItem("searchKeyword");
        setSearchKeyword("");
        navigate(`/search?keyword=${encodeURIComponent(searchKeyword.trim())}`);
      }
    }, [searchKeyword, navigate]);
  
    const handleKeywordClick = (keyword) => {
      setSearchKeyword(keyword);
      navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
    };
  
    return (
      <div className="search-container">
        <div className="search">
          <input
            type="text"
            placeholder="궁금한 주얼리를 검색해보세요!"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <i className="ri-search-line" onClick={handleSearch}></i>
        </div>
  
        {/* ✅ 추천 키워드를 태그 형태로 간단하게 표시 */}
        <div className="search-tags">
          {recommendedKeywords.map((keyword, index) => (
            <span key={index} className="search-tag" onClick={() => handleKeywordClick(keyword)}>
              {keyword}
            </span>
          ))}
        </div>
      </div>
    );
  };
  
  export default SearchBar;