# 📈 Stock Portfolio Tracker

개인 포트폴리오의 실시간 수익률을 주요 시장 지수와 비교하고 추적하는 웹 대시보드입니다.

## Version
**Current Version**: v3.0.0 (Standalone HTML + JS)

## 📌 주요 기능 (Features)

- **100% 프론트엔드 (No Backend)**: 별도의 서버 없이 브라우저에서 바로 실행 가능한 순수 HTML/JS 정적 웹 페이지입니다. 
- **동적 자산 구성**: 웹 페이지 우측 상단의 `⚙️ Settings` 메뉴를 통해 나만의 포트폴리오를 동적으로 추가, 수정, 삭제할 수 있습니다.
- **실시간 데이터 조회**: Yahoo Finance API 데이터를 실시간으로 조회하여 매일매일의 수익률을 반영합니다.
- **포트폴리오 비중 설정**: 개별 ETF/주식의 티커(Ticker)와 투자 비중을 자유롭게 입력하여 나만의 포트폴리오 성과를 백테스트 할 수 있습니다. 
- **색상 커스터마이징**: 차트에 표시되는 포트폴리오와 주요 시장 지수(KOSPI, NASDAQ, S&P 500)의 색상을 자유롭게 변경할 수 있습니다. 
- **자동 저장**: 구성한 포트폴리오와 설정 값은 브라우저 공간(`localStorage`)에 저장되어, 새로고침하거나 나중에 다시 접속해도 유지됩니다.
- **모바일/반응형 UI**: 창 크기에 따라 자동으로 100% 맞춰지는 반응형 차트 및 레이아웃을 제공합니다.

## 🚀 시작하기 (Getting Started)

별도의 설치나 복잡한 명령어 없이 바로 실행할 수 있습니다.

1. 프로젝트 폴더를 열고 `index.html` 파일을 브라우저(Chrome, Safari, Edge 등) 로 드래그하여 열거나 더블클릭합니다.
2. 우측 상단의 **⚙️ Settings** 버튼을 클릭하여 포트폴리오를 구성합니다.

## 🔧 기본 프리셋 포트폴리오 

최초 실행 시 2개의 포트폴리오가 기본으로 구성되어 있습니다:

### DK Portfolio (Start: 2025-10-07)
- QQQM: 45% / SMH: 15% / SPYM: 10% / JEPQ: 10% / IAU: 10% / DBMF: 10%

### JS Portfolio (Start: 2025-03-01)
- SCHD: 33% / SPYM: 67%

## ⌨️ 기술 스택 (Tech Stack)
- **Frontend**: HTML5, Vanilla CSS (Material Design), Vanilla JavaScript (ES6+), Plotly.js
- **Data Source**: Yahoo Finance API (Client-side fetch via CORS proxy)


## 📝 License
MIT
