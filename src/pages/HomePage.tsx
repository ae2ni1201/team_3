import { Link } from "react-router-dom";

// 홈 화면 (리더/공통). 데이터가 잘 로드되는지 확인하는 시작점.
export default function HomePage() {
  return (
    <section className="home">
      <h1>의학용어를 카드로 외우자</h1>
      <p className="subtitle">
        의료 관련 학과 학생을 위한 로그인 없는 의학용어 암기 웹입니다.
      </p>
      <div className="home-menu">
        <Link className="card-link" to="/flashcard">
          <span className="emoji">🃏</span>
          <span>플래시카드</span>
          <small>용어를 넘기며 외우기</small>
        </Link>
        <Link className="card-link" to="/search">
          <span className="emoji">🔍</span>
          <span>단어장</span>
          <small>용어 찾아보고 훑어보기</small>
        </Link>
        <Link className="card-link" to="/quiz">
          <span className="emoji">📝</span>
          <span>퀴즈</span>
          <small>4지선다로 점검하기</small>
        </Link>
      </div>
    </section>
  );
}
