# readinggate-study-9th

## 홈페이지와 연결하여 모바일에서 개발하기

1. 이 폴더에서 `npm run dev`를 실행합니다 (HTTP 3030 포트).
2. `../rg8-homepage-wis-7`에서 `npm run dev -- --hostname 0.0.0.0 --port 3000`을 실행합니다.
3. PC와 같은 Wi-Fi의 휴대폰에서 `http://<PC의 LAN IP>:3000`에 접속해 로그인합니다.
4. EB/PB 도서의 Book Info에서 Start를 누릅니다. PK 계열은 이 앱과 연결하지 않습니다.

홈페이지의 개발 서버는 `/study/BookReading/*`를 3030 서버로 프록시합니다.
브라우저 주소는 3000에 유지되어 REF sessionStorage, 로그인 쿠키, `/api`,
학습 종료와 결과 화면을 홈페이지와 공유합니다. 3030 주소를 직접 열면
홈페이지에서 설정한 REF가 없으므로 정상적인 학습 진입이 되지 않습니다.

학습 UI 수정은 Vite HMR로 반영됩니다. 휴대폰에서 PC의 3000과 3030 포트에
접속할 수 있어야 하며, VPN/방화벽과 Wi-Fi의 기기 간 연결 제한을 확인하세요.
HTTP LAN 접속에서는 브라우저 정책상 마이크 녹음이 제한됩니다. 녹음까지
검증하려면 휴대폰이 신뢰하는 HTTPS 환경을 별도로 구성해야 합니다.

홈페이지의 프록시는 개발 모드에만 적용되며 배포 빌드에는 적용되지 않습니다.

# 참고자료

화면 기획 : https://www.figma.com/slides/Ru60tXknS2wwySIYSen4NG/RG-9%EC%B0%A8-%ED%95%99%EC%8A%B5-%EC%8B%9C%EB%82%98%EB%A6%AC%EC%98%A4---%EA%B8%B0%ED%9A%8D-%EC%88%98%EC%A0%95--2025.12.17-?node-id=1-95&t=3kwpUJn7vTyYpXdV-0

학습 방식 : https://app.notion.com/p/37910d0241c080988d0ce58c4bea9247

<br>

# 특이 사항

1. 별점 기능 제거
2. Moview Book 제거

# 학습 플로우

1. Reading(EB)
2. Act1 - PB는 바로 Act1 시작
3. Study
4. Result

# 컨테이너 구조
