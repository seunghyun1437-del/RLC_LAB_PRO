window.App = (() => {
  'use strict';

  const { fmt, parseAndValidate } = window.Utils;
  const { calcCore, sweepMag, sweepI, computeBand } = window.MathCore;
  const { initChart, updateMagChart, updateICurrentChart, exportPNG } = window.Charts;
  const { renderResults, renderQBadge } = window.UI;

  const el = (id) => document.getElementById(id);

  let chart;
  let mode = 'Z'; // 'Z' or 'I'
  let bwEnabled = true;
  let lastRes = null; // remember last calc results {Q, f0}

  function readInputs() {
    return {
      R: el('rInput').value,
      L: el('lInput').value,
      C: el('cInput').value,
      f: el('fInput').value,
      Vin: el('vinInput').value,
    };
  }

  function setDefaults() {
    el('rInput').value = '100';
    el('lInput').value = '0.01';
    el('cInput').value = '0.000001';
    el('fInput').value = '1000';
    el('vinInput').value = '1.0';
  }

  function recalcAndRender() {
    try {
      const vals = parseAndValidate(readInputs());
      const res = calcCore(vals.R, vals.L, vals.C, vals.f);
      renderResults(null, res);
      renderQBadge(null, res.Q);
      el('inlineError').textContent = '';
      lastRes = { Q: res.Q, f0: res.f0 };

      // Sweep range around f0 (narrowed)
      const fMin = Math.max(1, res.f0 / 20);
      const fMax = res.f0 * 20;
      if (mode === 'Z') {
        const { f, mag } = sweepMag(vals.R, vals.L, vals.C, fMin, fMax, 400);
        updateMagChart(chart, f, mag);
      } else {
        const { f, cur } = sweepI(vals.R, vals.L, vals.C, fMin, fMax, 400, vals.Vin);
        updateICurrentChart(chart, f, cur, vals.Vin);
      }

      // Band markers
      const { f1, f2 } = computeBand(res.Q, res.f0);
      chart.$bw = { f1, f2, enabled: bwEnabled };
      chart.update();

      // Update BW note (only if enabled)
      const note = el('bwNote');
      if (note) {
        if (bwEnabled) {
          note.innerHTML = `대역폭 영역: f1=${fmt(f1)} Hz ~ f2=${fmt(f2)} Hz (Q, f0 기반)`;
        } else {
          note.textContent = '';
        }
      }
    } catch (e) {
      el('inlineError').textContent = e.message || '입력이 잘못되었습니다.';
    }
  }

  function wireEvents() {
    el('btnCalc').addEventListener('click', recalcAndRender);
    el('btnReset').addEventListener('click', () => { setDefaults(); recalcAndRender(); });
    ['rInput','lInput','cInput','fInput','vinInput'].forEach((id) => {
      el(id).addEventListener('input', () => { el('inlineError').textContent = ''; });
    });
    el('toggleZ').addEventListener('click', () => {
      mode = 'Z';
      el('toggleZ').classList.add('active');
      el('toggleZ').classList.remove('ghost');
      el('toggleI').classList.remove('active');
      el('toggleI').classList.add('ghost');
      recalcAndRender();
    });
    el('toggleI').addEventListener('click', () => {
      mode = 'I';
      el('toggleI').classList.add('active');
      el('toggleI').classList.remove('ghost');
      el('toggleZ').classList.remove('active');
      el('toggleZ').classList.add('ghost');
      recalcAndRender();
    });
    const bwChk = el('toggleBW');
    if (bwChk) {
      bwChk.addEventListener('change', (e) => {
        bwEnabled = !!e.target.checked;
        if (!chart) return;
        if (!bwEnabled) {
          // disable and force redraw, clear note
          chart.$bw = { enabled: false };
          chart.update();
          const note = el('bwNote');
          if (note) note.textContent = '';
          return;
        }
        // enable: recompute from last results if available
        try {
          if (lastRes && lastRes.Q && lastRes.f0) {
            const { f1, f2 } = computeBand(lastRes.Q, lastRes.f0);
            chart.$bw = { f1, f2, enabled: true };
            chart.update();
            const note = el('bwNote');
            if (note) note.innerHTML = `대역폭 영역: f1=${fmt(f1)} Hz ~ f2=${fmt(f2)} Hz (Q, f0 기반)`;
          }
        } catch {}
      });
    }
    const saveBtn = el('btnSavePNG');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const viewName = mode === 'Z' ? 'mag' : 'i';
        try {
          const vals = parseAndValidate(readInputs());
          exportPNG(chart, { viewName, scale: 2, background: '#ffffff', meta: { R: vals.R, L: vals.L, C: vals.C, f: vals.f, Vin: vals.Vin } });
        } catch (e) {
          el('inlineError').textContent = e.message || '입력이 잘못되었습니다.';
        }
      });
    }
  }

  function init() {
    chart = initChart('zChart', { logX: true, label: '|Z|(Ω)' });
    setDefaults();
    wireEvents();
    // normalize toggle visual state
    el('toggleZ').classList.add('active');
    el('toggleZ').classList.remove('ghost');
    el('toggleI').classList.remove('active');
    el('toggleI').classList.add('ghost');
    recalcAndRender();
  }

  return { init };
})();


