/* ===================================================
   ROI CALCULATOR
   =================================================== */

const AI_MONTHLY_COST = 297;
const AI_ANNUAL_COST  = AI_MONTHLY_COST * 12; // $3,564
const CALLBACK_RATE   = 0.62;  // 62% of missed callers never call back
const AI_RECOVERY     = 0.80;  // AI recovers 80% of missed calls

function initCalculator() {
  const inputs = {
    monthlyCalls: document.getElementById('monthly-calls'),
    avgValue:     document.getElementById('avg-value'),
    missedPct:    document.getElementById('missed-pct'),
    staffWage:    document.getElementById('staff-wage'),
  };

  if (!inputs.monthlyCalls) return; // calculator not on page

  const displays = {
    calls:  document.getElementById('calls-display'),
    value:  document.getElementById('value-display'),
    missed: document.getElementById('missed-display'),
    wage:   document.getElementById('wage-display'),
  };

  const results = {
    lost:      document.getElementById('result-lost'),
    recovered: document.getElementById('result-recovered'),
    hours:     document.getElementById('result-hours'),
    savings:   document.getElementById('result-savings'),
    roi:       document.getElementById('result-roi'),
  };

  function fmtCurrency(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function fmtHours(n) {
    return Math.round(n).toLocaleString('en-US') + ' hrs';
  }

  let animFrames = {};

  function animateValue(key, el, targetValue, formatter) {
    if (animFrames[key]) cancelAnimationFrame(animFrames[key]);
    const duration  = 500;
    const startTime = performance.now();
    const startVal  = parseFloat(el.dataset.current || '0');

    function step(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = startVal + (targetValue - startVal) * eased;
      el.textContent = formatter(current);
      if (progress < 1) {
        animFrames[key] = requestAnimationFrame(step);
      } else {
        el.dataset.current = targetValue;
      }
    }
    animFrames[key] = requestAnimationFrame(step);
  }

  function updateSliderFill(input, min, max) {
    const pct = ((parseFloat(input.value) - min) / (max - min)) * 100;
    input.style.setProperty('--val', pct.toFixed(1) + '%');
  }

  function calculate() {
    const calls     = parseInt(inputs.monthlyCalls.value);
    const value     = parseInt(inputs.avgValue.value);
    const missedPct = parseInt(inputs.missedPct.value) / 100;
    const wage      = parseInt(inputs.staffWage.value);

    // Revenue calculations
    const missedPerMonth    = calls * missedPct;
    const lostLeadsPerMonth = missedPerMonth * CALLBACK_RATE;
    const lostRevenueYear   = lostLeadsPerMonth * value * 12;
    const recoveredYear     = lostRevenueYear * AI_RECOVERY;

    // Labour calculations — 3 min per call for scheduling/intake
    const hoursPerYear   = (calls * 3 / 60) * 12;
    const staffCostSaved = hoursPerYear * wage;

    const totalBenefit = recoveredYear + staffCostSaved;
    const roiMultiple  = (totalBenefit / AI_ANNUAL_COST);

    // Update label displays
    displays.calls.textContent  = calls.toLocaleString() + ' calls';
    displays.value.textContent  = '$' + value.toLocaleString();
    displays.missed.textContent = parseInt(inputs.missedPct.value) + '%';
    displays.wage.textContent   = '$' + wage + '/hr';

    // Animate result values
    animateValue('lost',      results.lost,      lostRevenueYear,  fmtCurrency);
    animateValue('recovered', results.recovered, recoveredYear,     fmtCurrency);
    animateValue('hours',     results.hours,     hoursPerYear,      fmtHours);
    animateValue('savings',   results.savings,   staffCostSaved,    fmtCurrency);

    // ROI — animate separately as it's a multiplier string
    results.roi.textContent = roiMultiple.toFixed(1) + 'x';

    // Update slider track fills
    updateSliderFill(inputs.monthlyCalls, 20,  1000);
    updateSliderFill(inputs.avgValue,     50,  5000);
    updateSliderFill(inputs.missedPct,    5,   80);
    updateSliderFill(inputs.staffWage,    10,  60);
  }

  // Attach listeners
  Object.values(inputs).forEach(input => {
    input.addEventListener('input', calculate);
  });

  // Initialize fills and run once
  calculate();
}

document.addEventListener('DOMContentLoaded', initCalculator);
