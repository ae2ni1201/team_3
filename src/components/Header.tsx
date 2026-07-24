import { NavLink } from "react-router-dom";

// 공통 헤더·이동 메뉴 (F-11, 화면 담당).
export default function Header() {
  return (
    <header className="header">
      <NavLink to="/" className="logo">
        🩺 메디보카
      </NavLink>
      <nav className="nav">
        <NavLink to="/" end>홈</NavLink>
        <NavLink to="/search">단어장</NavLink>
        <NavLink to="/flashcard">플래시카드</NavLink>
        <NavLink to="/quiz">퀴즈</NavLink>
        <NavLink to="/wrong-note">오답노트</NavLink>
      </nav>
    </header>
  );
}
