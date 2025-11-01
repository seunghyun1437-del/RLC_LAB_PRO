window.Utils = (() => {
  'use strict';

  function trimZeros(str) {
    if (str.indexOf('.') === -1) return str;
    return str.replace(/\.?(0+)$/g, '');
  }

  function toSuperscript(n) {
    const map = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻','+':'' };
    return String(n).split('').map(ch => map[ch] ?? ch).join('');
  }

  function fmt(x, d = 3) {
    if (!isFinite(x)) return '-';
    const ax = Math.abs(x);
    if (ax === 0) return '0';
    if (ax >= 1000 || (ax > 0 && ax < 0.01)) {
      const exp = Math.floor(Math.log10(ax));
      let mant = x / Math.pow(10, exp);
      const pow10 = Math.pow(10, d);
      mant = Math.round(mant * pow10) / pow10; // round to d digits
      if (Math.abs(mant) >= 10) { // handle 9.999 -> 10.000
        mant = mant / 10;
        return `${trimZeros(mant.toFixed(d))}×10<sup>${exp + 1}</sup>`;
      }
      return `${trimZeros(mant.toFixed(d))}×10<sup>${exp}</sup>`;
    }
    return trimZeros(Number(x).toFixed(d));
  }

  // Plain-text friendly formatter for tooltips (uses unicode superscripts)
  function fmtSup(x, d = 3) {
    if (!isFinite(x)) return '-';
    const ax = Math.abs(x);
    if (ax === 0) return '0';
    if (ax >= 1000 || (ax > 0 && ax < 0.01)) {
      const exp = Math.floor(Math.log10(ax));
      let mant = x / Math.pow(10, exp);
      const pow10 = Math.pow(10, d);
      mant = Math.round(mant * pow10) / pow10;
      if (Math.abs(mant) >= 10) {
        mant = mant / 10;
        return `${trimZeros(mant.toFixed(d))}×10${toSuperscript(exp + 1)}`;
      }
      return `${trimZeros(mant.toFixed(d))}×10${toSuperscript(exp)}`;
    }
    return trimZeros(Number(x).toFixed(d));
  }

  function parseAndValidate({ R, L, C, f, Vin }) {
    const vals = { R: +R, L: +L, C: +C, f: +f, Vin: +Vin };
    for (const [k, v] of Object.entries(vals)) {
      if (!isFinite(v) || isNaN(v)) throw new Error(`${k}: 숫자를 입력하세요.`);
      if (v <= 0) throw new Error(`${k}: 양의 실수여야 합니다.`);
    }
    // 권장 범위 검사는 제거: 비현실적 값도 계산 허용
    return vals;
  }

  function clampSweep({ fMin = 10, fMax = 100000 }) {
    if (!isFinite(fMin) || fMin <= 0) fMin = 1;
    if (!isFinite(fMax) || fMax <= fMin) fMax = fMin * 10;
    return { fMin, fMax };
  }

  return { fmt, fmtSup, parseAndValidate, clampSweep };
})();


