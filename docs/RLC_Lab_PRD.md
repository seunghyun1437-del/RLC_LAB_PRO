# RLC Lab Pro — PRD (Product Requirements Document)

## 0) One-liner
브라우저만으로 R, L, C, f를 입력하면 공진주파수·리액턴스·임피던스·품질계수(Q) 등을 계산하고, |Z| vs f 보드 플롯을 시각화하는 **순수 프론트엔드 웹앱**.

---

## 1) Objectives
- **MVP:** 실시간 입력 → \(f_0, X_L, X_C, |Z|\) 계산/표시, |Z| vs f 보드 플롯(로그 x축).
- **목표:** Q, BW, ζ 계산과 한 줄 해석 문구 제공.
- **제출성:** 깔끔한 구조/커밋/다크 UI, 하루 내 완성 가능.

---

## 2) Scope
### In-scope (v1)
- 입력: R(Ω), L(H), C(F), f(Hz) — 양수 실수 검증
- 계산:
  - \( f_0=\frac{1}{2\pi\sqrt{LC}} \)
  - \( X_L=2\pi fL,\quad X_C=\frac{1}{2\pi fC} \)
  - \( |Z|=\sqrt{R^2+(X_L-X_C)^2} \)
  - \( Q=\frac{1}{R}\sqrt{\frac{L}{C}},\quad BW=\frac{f_0}{Q},\quad \zeta=\frac{1}{2Q} \) (Series)
- 시각화: Chart.js 라인차트, x축 로그, |Z| vs f (200~300 포인트)
- UI: 다크 테마 카드, 반응형, 인라인 에러 메시지

### Stretch (v1.1+)
- 위상 플롯 \( \phi=\arctan\!\big(\frac{X_L-X_C}{R}\big) \)
- 역설계: 목표 \(f_0,Q\) + 고정 L → R,C 산출
- 공차 Monte Carlo: R/L/C ±tol% → \(f_0,Q\) 분포
- 시간영역 미니 시뮬(계단 응답 근사)
- PDF/PNG 내보내기 (html2canvas + jsPDF)
- Series/Parallel 토글 탭

### Out-of-scope
- 서버/DB/로그인, 실제 하드웨어 연동

---

## 3) Users
- 전자공학 학부생/TA: 실험·과제용 계산/시각화 도구.

---

## 4) Success Metrics
- 계산 정확도: 수기 테스트 케이스 통과 100%
- 성능: 300 포인트 스윕 < 200ms 렌더(일반 노트북)
- 사용성: 3클릭 내 결과 확인
- 품질: 콘솔 에러 0, 의미 있는 커밋 ≥ 6

---

## 5) UX / Wireframe
```
[ 헤더: RLC Lab Pro ]

[ 카드: 파라미터 ]
R(Ω) [ ]  L(H) [ ]  C(F) [ ]  f(Hz) [ ]
[ 계산하기 ] [ 스윕 업데이트 ] [ 리셋 ]
(인라인 에러 메시지)

[ 카드: 결과 ]
f0: xxxx Hz
XL: xx Ω,  XC: xx Ω
|Z|: xx Ω
Q: x.xx,  BW: xxx Hz,  ζ: 0.xxx
(간단 해석 문: 예 “Q=3.2 → 중간 정도 날카로움”)

[ 카드: 그래프 ]
|Z| vs f (log x-axis)
```

---

## 6) Tech / Conventions
- **Stack:** HTML, CSS, JavaScript(ES6+), Chart.js(CDN)
- **파일 구조(v1 단순형)**
  ```
  RLC_Lab_Pro/
  ├─ index.html
  ├─ style.css
  └─ app.js
  ```
  *(v1.1 모듈화 권장: `js/math-core.js`, `js/charts.js`)*
- **코딩 룰(요약)**
  - 함수형 유틸: `calcCore`, `sweepMag`, `renderResults`
  - DOM 접근 래퍼: `el(id)`  
  - 숫자 포맷: `fmt(x, digits=3)`  
  - 예외: `try/catch` + 사용자 친화 메시지
- **커밋 메시지 예**
  - `feat(core): f0/XL/XC/|Z| 계산`
  - `feat(plot): |Z| vs f 로그 플롯`
  - `feat(metrics): Q/BW/ζ 출력`
  - `ui: 다크 테마/반응형`
  - `fix: NaN/0 분기 처리`
  - `docs: README 수식/가정`

---

## 7) Functional Requirements
1. 입력 검증: 공백/0/음수/NaN 차단, 인라인 에러 표기
2. 계산 정확도: 배정밀도 유지, 표시 2~3자리 고정
3. 결과 카드: \(f_0\), \(X_L/X_C\), \(|Z|\), \(Q/BW/\zeta\)
4. 그래프: 로그 x축, 포인트 200~300, 포인트 마커 없음(성능)
5. 초기 로드 시 기본값으로 그래프 자동 렌더

---

## 8) Non-Functional
- 성능: O(N) 스윕, `Math.hypot` 사용
- 호환: 최신 Chrome/Edge/Safari
- 접근성: label–input 연결, 키보드 탭 이동, 명도 대비
- 보안: 외부 통신 없음(CDN 제외)

---

## 9) Formulas / Units
- 입력 단위: R[Ω], L[H], C[F], f[Hz]
- 표시는 기본 단위(접두사 자동화는 v1.1)
- Series RLC 기준(Parallel은 탭 분리 예정)

---

## 10) Edge Cases
- f=0, L=0, C=0 → 계산 금지 & 안내
- 매우 작은 C 또는 큰 L로 인한 overflow 가드
- 로그축: fMin>0 보장

---

## 11) Test Plan (수기 대조)
- **T1:** R=100, L=10 mH, C=1 µF, f=1 kHz  
  - \( f_0 \approx 1591.55 \) Hz  
  - \( X_L \approx 62.83\,\Omega,\ X_C \approx 159.15\,\Omega \)  
  - \(|Z|\approx \sqrt{100^2+(-96.32)^2}\approx 138.2\,\Omega\)
- **T2:** f=f0에서 \(X_L \approx X_C\) → \(|Z|\approx R\)
- **T3:** 스케일 업/다운(×10) 시 추세 검사
- **T4:** 잘못된 입력 → 인라인 에러 표기

---

## 12) Acceptance Criteria
- A1: 올바른 입력 → 4종 결과 갱신
- A2: |Z| vs f 로그 플롯 정상 표시
- A3: Q, BW, ζ 수식대로 계산 및 표시
- A4: 잘못된 입력에 인라인 경고가 노출
- A5: 콘솔 에러 0

---

## 13) Timeline 
- 0:00–0:30 환경/폴더·Live Server 세팅
- 0:30–2:00 **MVP 계산/표시**
- 2:00–3:00 **보드 플롯(|Z|)**
- 3:00–3:40 **Q/BW/ζ + 해석문**
- 3:40–4:30 **UI 마감 + 에러 처리**
- 4:30–5:00 **수동 테스트 + 스크린샷 + README**

---

## 14) Risks & Mitigations
- 단위 착오 → 입력 단위 라벨/플레이스홀더 명확화
- 성능 저하(N↑) → 스윕 포인트 상한 500, 기본 300
- 로그축 오류 → 0/음수 주파수 차단, 기본값 안전 설정

---
