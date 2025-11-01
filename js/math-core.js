window.MathCore = (() => {
  'use strict';

  function assertPositiveNumbers(...vals) {
    for (const v of vals) {
      if (!isFinite(v) || v <= 0) throw new Error('입력이 유효한 양의 실수가 아닙니다.');
    }
  }

  function calcCore(R, L, C, f) {
    assertPositiveNumbers(R, L, C, f);
    const w = 2 * Math.PI * f;
    const XL = w * L;
    const XC = 1 / (w * C);
    const Z = Math.hypot(R, XL - XC);
    const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
    const Q = (1 / R) * Math.sqrt(L / C);
    const BW = f0 / Q;
    const zeta = 1 / (2 * Q);
    if (!isFinite(Z) || !isFinite(f0) || !isFinite(Q) || Q <= 0) throw new Error('계산 실패: 비정상 파라미터.');
    return { XL, XC, Z, f0, Q, BW, zeta };
  }

  function sweepMag(R, L, C, fMin, fMax, N = 400) {
    assertPositiveNumbers(R, L, C, fMin, fMax);
    if (fMax <= fMin) throw new Error('스윕 범위가 잘못되었습니다.');
    const f = new Array(N);
    const mag = new Array(N);
    const logMin = Math.log10(fMin);
    const logMax = Math.log10(fMax);
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const fi = Math.pow(10, logMin + t * (logMax - logMin));
      const w = 2 * Math.PI * fi;
      const XL = w * L;
      const XC = 1 / (w * C);
      const Zi = Math.hypot(R, XL - XC);
      f[i] = fi;
      mag[i] = Zi;
    }
    return { f, mag };
  }

  function sweepI(R, L, C, fMin, fMax, N = 400, Vin = 1.0) {
    const { f, mag } = sweepMag(R, L, C, fMin, fMax, N);
    const cur = mag.map((z) => Vin / z);
    return { f, cur };
  }

  function computeBand(Q, f0) {
    assertPositiveNumbers(Q, f0);
    const w0 = 2 * Math.PI * f0;
    const term = Math.sqrt(1 + 1 / (4 * Q * Q));
    const w1 = w0 * (term - 1 / (2 * Q));
    const w2 = w0 * (term + 1 / (2 * Q));
    const f1 = w1 / (2 * Math.PI);
    const f2 = w2 / (2 * Math.PI);
    if (!isFinite(f1) || !isFinite(f2) || f1 <= 0 || f2 <= f1) throw new Error('대역 계산 실패.');
    return { f1, f2 };
  }

  return { calcCore, sweepMag, sweepI, computeBand };
})();


