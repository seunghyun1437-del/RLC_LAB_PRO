window.Charts = (() => {
  'use strict';

  const { fmt, fmtSup } = window.Utils;

  const bwBandPlugin = {
    id: 'bwBandPlugin',
    beforeDraw(chart) {
      const bw = chart.$bw;
      if (!bw || bw.enabled === false || !isFinite(bw.f1) || !isFinite(bw.f2)) return;
      const { ctx, chartArea, scales } = chart;
      const x = scales.x;
      const f1x = x.getPixelForValue(bw.f1);
      const f2x = x.getPixelForValue(bw.f2);
      const left = Math.min(f1x, f2x);
      const right = Math.max(f1x, f2x);
      ctx.save();
      ctx.fillStyle = 'rgba(94,177,255,0.08)';
      ctx.fillRect(left, chartArea.top, right - left, chartArea.bottom - chartArea.top);
      ctx.strokeStyle = 'rgba(94,177,255,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(f1x, chartArea.top);
      ctx.lineTo(f1x, chartArea.bottom);
      ctx.moveTo(f2x, chartArea.top);
      ctx.lineTo(f2x, chartArea.bottom);
      ctx.stroke();
      ctx.restore();
    }
  };

  function initChart(canvasId, { logX = true, label = '|Z|(Ω)' } = {}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets: [{ label, data: [], borderColor: '#5eb1ff', backgroundColor: 'rgba(94,177,255,0.10)', borderWidth: 2, fill: true, pointRadius: 0, tension: 0.15 }] },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: { mode: 'nearest', intersect: false, axis: 'x' },
        elements: { point: { radius: 0, hitRadius: 8, hoverRadius: 0 } },
        scales: {
          x: {
            type: logX ? 'logarithmic' : 'linear',
            ticks: { color: '#9aa4b2' },
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          y: {
            ticks: { color: '#9aa4b2' },
            grid: { color: 'rgba(255,255,255,0.05)' }
          }
        },
        plugins: {
          legend: { labels: { color: '#e7eaf0' } },
          tooltip: {
            callbacks: {
              title: (items) => items.length ? `f = ${fmtSup(items[0].parsed.x, 3)} Hz` : '',
              label: (item) => `${item.dataset.label}: ${fmtSup(item.parsed.y, 3)}`,
            }
          }
        },
        animation: false
      },
      plugins: [bwBandPlugin]
    });
    return chart;
  }

  function updateMagChart(chart, f, mag) {
    chart.data.labels = [];
    chart.data.datasets[0].label = '|Z|(Ω)';
    chart.data.datasets[0].data = f.map((x, i) => ({ x, y: mag[i] }));
    chart.data.datasets[0].borderColor = '#5eb1ff';
    chart.data.datasets[0].backgroundColor = 'rgba(94,177,255,0.10)';
    chart.update();
  }

  function updateICurrentChart(chart, f, cur, Vin = 1.0) {
    chart.data.labels = [];
    chart.data.datasets[0].label = `|I|(A) @ Vin=${Vin}V`;
    chart.data.datasets[0].data = f.map((x, i) => ({ x, y: cur[i] }));
    chart.data.datasets[0].borderColor = '#5eb1ff';
    chart.data.datasets[0].backgroundColor = 'rgba(94,177,255,0.10)';
    chart.update();
  }

  function timestamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }

  function exportPNG(chart, { viewName = 'mag', scale = 2, background = '#ffffff', meta } = {}) {
    if (!chart || !chart.canvas) return;
    const src = chart.canvas;
    const w = src.width;
    const h = src.height;
    // temporarily switch to export colors (red theme)
    const ds = chart.data && chart.data.datasets && chart.data.datasets[0];
    const prevBorder = ds ? ds.borderColor : null;
    const prevBg = ds ? ds.backgroundColor : null;
    const prevLegendColor = chart.options?.plugins?.legend?.labels?.color || null;
    if (ds) {
      ds.borderColor = '#ff4d4d';
      ds.backgroundColor = 'rgba(255,77,77,0.12)';
      // Change legend label color to black
      if (chart.options?.plugins?.legend?.labels) {
        chart.options.plugins.legend.labels.color = '#000000';
      }
      chart.update(0);
    }
    const off = document.createElement('canvas');
    off.width = Math.max(1, Math.floor(w * scale));
    off.height = Math.max(1, Math.floor(h * scale));
    const ctx = off.getContext('2d');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, off.width, off.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(src, 0, 0, off.width, off.height);

    // Axis annotations + meta panel
    try {
      const xIsLog = (chart.options && chart.options.scales && chart.options.scales.x && chart.options.scales.x.type === 'logarithmic');
      let yLabel = chart.data && chart.data.datasets && chart.data.datasets[0] && chart.data.datasets[0].label ? chart.data.datasets[0].label : 'value';
      if (typeof yLabel === 'string') {
        if (yLabel.startsWith('|Z|')) yLabel = 'Impedance magnitude |Z| (Ω)';
        else if (yLabel.startsWith('|I|')) {
          // Preserve actual Vin value from label (e.g., "|I|(A) @ Vin=2.5V")
          const vinMatch = yLabel.match(/Vin=([\d.]+)V/);
          const vinVal = vinMatch ? vinMatch[1] : '1';
          yLabel = `Current magnitude |I| (A) @ Vin=${vinVal}V`;
        }
      }
      const xLabel = `x: frequency f (Hz)` + (xIsLog ? ' [log]' : '');
      const pad = Math.round(12 * scale);
      ctx.fillStyle = '#000000';
      ctx.globalAlpha = 0.85;
      ctx.font = `${Math.round(12 * scale)}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
      ctx.textBaseline = 'bottom';
      // Draw background strip for readability
      const text1 = xLabel;
      const text2 = `y: ${yLabel}`;
      const maxWidth = Math.max(ctx.measureText(text1).width, ctx.measureText(text2).width);
      const boxW = maxWidth + pad * 2;
      const boxH = Math.round(36 * scale);
      const boxX = pad;
      const boxY = off.height - pad - boxH;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.globalAlpha = 1;
      // Draw x label
      ctx.fillStyle = '#000000';
      ctx.fillText(text1, boxX + pad, boxY + Math.round(16 * scale));
      // Draw y label with |Z| or |I| in black, rest in gray
      const yParts = yLabel.match(/^(.*?)(\|[ZI]\|)(.*)$/);
      if (yParts) {
        const [_, before, symbol, after] = yParts;
        let xPos = boxX + pad;
        if (before) {
          ctx.fillStyle = '#666666';
          ctx.fillText(`y: ${before}`, xPos, boxY + Math.round(32 * scale));
          xPos += ctx.measureText(`y: ${before}`).width;
        }
        ctx.fillStyle = '#000000';
        ctx.fillText(symbol, xPos, boxY + Math.round(32 * scale));
        xPos += ctx.measureText(symbol).width;
        if (after) {
          ctx.fillStyle = '#666666';
          ctx.fillText(after, xPos, boxY + Math.round(32 * scale));
        }
      } else {
        ctx.fillStyle = '#666666';
        ctx.fillText(text2, boxX + pad, boxY + Math.round(32 * scale));
      }

      if (meta) {
        const rightPad = pad;
        const lineH = Math.round(14 * scale);
        const lines = [
          `R = ${fmtSup(meta.R)} Ω`,
          `L = ${fmtSup(meta.L)} H`,
          `C = ${fmtSup(meta.C)} F`,
          `f = ${fmtSup(meta.f)} Hz`,
          meta.Vin ? `Vin = ${fmtSup(meta.Vin)} V` : null,
        ].filter(Boolean);
        const widest = Math.max(...lines.map(t => ctx.measureText(t).width));
        const boxW2 = widest + rightPad * 2;
        const boxH2 = lineH * lines.length + rightPad;
        const boxX2 = off.width - boxW2 - rightPad;
        const boxY2 = rightPad;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillRect(boxX2, boxY2, boxW2, boxH2);
        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'top';
        lines.forEach((t, i) => {
          ctx.fillText(t, boxX2 + rightPad, boxY2 + i * lineH + Math.round(2 * scale));
        });
      }
    } catch (e) {
      // ignore annotation errors
    }
    const url = off.toDataURL('image/png');
    const name = `rlc_${viewName}_${timestamp()}.png`;
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // 모바일 대안: 새 탭 열기
    if (!/download/i.test(a.rel) && /Mobile|Android|iP(hone|ad)/.test(navigator.userAgent)) {
      window.open(url, '_blank');
    }
    // restore original colors
    if (ds) {
      ds.borderColor = prevBorder;
      ds.backgroundColor = prevBg;
      if (prevLegendColor !== null && chart.options?.plugins?.legend?.labels) {
        chart.options.plugins.legend.labels.color = prevLegendColor;
      }
      chart.update(0);
    }
  }

  return { initChart, updateMagChart, updateICurrentChart, exportPNG };
})();


