/* ===================================================
   AI READINESS ASSESSMENT
   =================================================== */

const TOTAL_STEPS = 5;
let currentStep = 1;
const answers = {};

// Industry base scores
const industryScores = {
  hvac: 22, dental: 24, auto: 20, legal: 18,
  spa: 22, roofing: 20, realestate: 19, other: 18
};

const industryLabels = {
  hvac:        'HVAC businesses',
  dental:      'dental practices',
  auto:        'auto repair shops',
  legal:       'law firms',
  spa:         'spa and wellness businesses',
  roofing:     'contractors',
  realestate:  'real estate businesses',
  other:       'businesses like yours'
};

function callVolumeScore(calls) {
  const n = parseInt(calls);
  if (n >= 500) return 22;
  if (n >= 200) return 18;
  if (n >= 100) return 14;
  return 10;
}

function missedCallScore(pct) {
  const n = parseInt(pct);
  if (n >= 50) return 20;
  if (n >= 30) return 17;
  if (n >= 15) return 14;
  return 10;
}

function staffScore(hasStaff) {
  return hasStaff === 'no' ? 18 : 12;
}

function goalScore(goals) {
  if (!goals || !goals.length) return 8;
  return Math.min(goals.length * 4, 20);
}

function computeScore() {
  const iScore = industryScores[answers.q1] || 18;
  const vScore = callVolumeScore(answers.q2 || 200);
  const mScore = missedCallScore(answers.q3 || 25);
  const sScore = staffScore(answers.q4);
  const gScore = goalScore(answers.q5);
  return Math.min(iScore + vScore + mScore + sScore + gScore, 100);
}

function getRecommendation(score) {
  const label = industryLabels[answers.q1] || 'businesses like yours';
  const cap   = label.charAt(0).toUpperCase() + label.slice(1);

  if (score >= 80) {
    return `Excellent fit. ${cap} see an average 3.8x ROI in the first 90 days. You have high call volume, significant missed call exposure, and clear goals — your AI team can start capturing that lost revenue immediately. We recommend starting with Alex (AI Receptionist) + Sam (Follow-up Specialist) as your core pair.`;
  }
  if (score >= 60) {
    return `Strong candidate. Based on your call volume and goals, you'd benefit significantly from at least an AI Receptionist and Follow-up Specialist. Most ${label} in your tier see ROI within 60 days. Book a discovery call — we'll build a custom roadmap showing your exact revenue opportunity.`;
  }
  if (score >= 40) {
    return `Good opportunity. While your current call volume is moderate, AI is ideal for ${label} that want to scale without adding headcount. We'll show you specifically which AI employees deliver the most impact for your situation during a free 30-minute strategy call.`;
  }
  return `We can still help. Your business may be earlier-stage, but AI builds a foundation that scales with you. Let's do a free 30-minute call — zero pressure, just honest advice on whether this is the right fit right now.`;
}

function showStep(n) {
  // Hide all steps and result
  document.querySelectorAll('.assessment-step').forEach(el => el.classList.add('hidden'));
  document.getElementById('assessment-result').classList.add('hidden');

  const navEl = document.getElementById('assessment-nav');
  navEl.classList.remove('hidden');

  if (n > TOTAL_STEPS) {
    const score = computeScore();
    showResults(score);
    return;
  }

  const stepEl = document.getElementById('step-' + n);
  if (stepEl) {
    stepEl.classList.remove('hidden');
    stepEl.classList.add('assessment-step');
  }

  // Progress bar
  const pct = Math.round((n / TOTAL_STEPS) * 100);
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('step-label').textContent = 'Step ' + n + ' of ' + TOTAL_STEPS;
  document.getElementById('step-pct').textContent = pct + '%';

  // Back button visibility
  const prevBtn = document.getElementById('prev-btn');
  if (n === 1) {
    prevBtn.classList.add('invisible');
  } else {
    prevBtn.classList.remove('invisible');
  }

  // Next button text
  document.getElementById('next-btn').textContent = n === TOTAL_STEPS ? 'See My Score →' : 'Continue →';

  currentStep = n;
}

function nextStep() {
  // Validate and collect current answer
  if (currentStep === 1) {
    const val = document.getElementById('q1').value;
    if (!val) { showToast('Please select your industry to continue'); return; }
    answers.q1 = val;
  }
  if (currentStep === 2) {
    answers.q2 = document.getElementById('q2').value;
  }
  if (currentStep === 3) {
    answers.q3 = document.getElementById('q3').value;
  }
  if (currentStep === 4) {
    if (!answers.q4) { showToast('Please make a selection to continue'); return; }
  }
  if (currentStep === 5) {
    const checked = [...document.querySelectorAll('#q5-options input[type="checkbox"]:checked')].map(el => el.value);
    answers.q5 = checked;
  }

  showStep(currentStep + 1);
}

function prevStep() {
  showStep(currentStep - 1);
}

function selectChoice(btn, question) {
  btn.closest('[data-choice-group]').querySelectorAll('button').forEach(b => {
    b.classList.remove('selected');
    b.style.borderColor = '';
    b.style.background  = '';
  });
  btn.classList.add('selected');
  answers[question] = btn.dataset.value;
}

function showResults(score) {
  document.getElementById('assessment-result').classList.remove('hidden');
  document.getElementById('assessment-nav').classList.add('hidden');

  // Set score text immediately
  document.getElementById('score-number').textContent    = '0';
  document.getElementById('result-score-label').textContent = score;
  document.getElementById('result-recommendation').textContent = getRecommendation(score);

  // Animate number count-up and SVG arc together via rAF (Safari-safe)
  const arc      = document.getElementById('score-arc');
  const scoreEl  = document.getElementById('score-number');
  const circumference = 339;
  const targetOffset  = circumference - (circumference * score / 100);

  const duration  = 1400;
  const startTime = performance.now();

  function animateResult(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);

    const currentScore  = Math.round(eased * score);
    const currentOffset = circumference - (circumference * (currentScore / 100));

    scoreEl.textContent          = currentScore;
    arc.style.strokeDashoffset   = currentOffset;

    if (progress < 1) requestAnimationFrame(animateResult);
  }

  // Small delay so result section is rendered before animation starts
  setTimeout(() => requestAnimationFrame(animateResult), 80);
}

function showToast(msg) {
  const existing = document.getElementById('assessment-toast');
  if (existing) existing.remove();

  const toast = document.createElement('p');
  toast.id = 'assessment-toast';
  toast.className = 'text-red-400 text-sm text-center mt-3';
  toast.textContent = msg;

  const nav = document.getElementById('assessment-nav');
  nav.parentNode.insertBefore(toast, nav);
  setTimeout(() => toast.remove(), 2800);
}

function initAssessment() {
  if (!document.getElementById('step-1')) return;

  // Slider live labels
  const q2 = document.getElementById('q2');
  const q3 = document.getElementById('q3');

  if (q2) {
    q2.addEventListener('input', () => {
      document.getElementById('q2-display').textContent =
        parseInt(q2.value).toLocaleString() + ' calls/mo';
    });
  }
  if (q3) {
    q3.addEventListener('input', () => {
      document.getElementById('q3-display').textContent = q3.value + '% missed';
    });
  }

  showStep(1);
}

document.addEventListener('DOMContentLoaded', initAssessment);
