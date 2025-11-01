window.UI = (() => {
  'use strict';

  const { fmt } = window.Utils;

  function renderResults(container, { f0, XL, XC, Z, Q, BW, zeta }) {
    document.getElementById('f0Out').innerHTML = fmt(f0);
    document.getElementById('xlOut').innerHTML = fmt(XL);
    document.getElementById('xcOut').innerHTML = fmt(XC);
    document.getElementById('zmagOut').innerHTML = fmt(Z);
    document.getElementById('qOut').innerHTML = fmt(Q);
    document.getElementById('bwOut').innerHTML = fmt(BW);
    document.getElementById('zetaOut').innerHTML = fmt(zeta);
  }

  function renderQBadge(container, Q) {
    const badge = document.getElementById('qBadge');
    const cls = ['badge'];
    let text = '';
    let title = '';
    let pros = [];
    let cons = [];
    if (Q < 0.5) {
      cls.push('overdamped');
      text = '과도 감쇠(Overdamped)';
      title = '공진이 거의 드러나지 않음';
      pros = ['과도 응답이 빠르게 수렴', '링잉(잔진동)이 적음'];
      cons = ['선택성이 매우 낮아 필터 성능 저하', '분해능이 낮아 피크 구분이 어려움'];
    } else if (Q < 2) {
      cls.push('broad');
      text = '광대역(Broad)';
      title = '공진 곡선이 완만';
      pros = ['넓은 대역에서 비교적 일정한 응답', '설계 민감도가 낮아 안정적'];
      cons = ['공진 피크가 약함', '분해능/선택성이 낮음'];
    } else if (Q < 10) {
      cls.push('moderate');
      text = '보통(Moderate)';
      title = '비교적 선명한 공진';
      pros = ['선택성과 안정성의 균형', '다양한 일반 용도에 적합'];
      cons = ['고분해능 필터/정밀 센싱에는 부족할 수 있음'];
    } else {
      cls.push('sharp');
      text = '예리함(Sharp)';
      title = '매우 날카로운 공진';
      pros = ['매우 높은 선택성과 분해능', '정밀 측정/필터링에 유리'];
      cons = ['링잉이 길어 과도 응답이 길어짐', '부품 공차/손실 변화에 민감'];
    }
    badge.className = cls.join(' ');
    badge.textContent = text;
    const note = document.getElementById('quickNote');
    if (note) {
      const qv = Utils.fmt(Q);
      const prosLis = pros.map((t) => `<li>${t}</li>`).join('');
      const consLis = cons.map((t) => `<li>${t}</li>`).join('');
      note.innerHTML = `
        <div class="qnote">
          <div class="qtitle">Q=${qv} · ${title}</div>
          <div class="qcols">
            <div>
              <div class="qsub">장점</div>
              <ul>${prosLis}</ul>
            </div>
            <div>
              <div class="qsub">단점</div>
              <ul>${consLis}</ul>
            </div>
          </div>
        </div>`;
    }
  }

  return { renderResults, renderQBadge };
})();


