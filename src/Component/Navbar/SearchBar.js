import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css"; // ✅ 새 스타일 적용

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

  return (
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
  );
};

export default SearchBar;
