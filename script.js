// Elements
const lengthEl = document.getElementById('length');
const lengthLabel = document.getElementById('lengthLabel');
const lowerEl = document.getElementById('lowercase');
const upperEl = document.getElementById('uppercase');
const numEl = document.getElementById('numbers');
const symEl = document.getElementById('symbols');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const outputEl = document.getElementById('passwordOutput');
const clearBtn = document.getElementById('clearBtn');
const strengthBarFill = document.querySelector('#strengthBar .fill');
const strengthText = document.getElementById('strengthText');

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMS  = '0123456789';
const SYMS  = '!@#$%^&*()_+-=[]{}|;:,.<>/?';

// Update length label live
lengthEl.addEventListener('input', () => {
  lengthLabel.textContent = lengthEl.value;
});

// Build character pool and generate password
function generatePassword() {
  const len = Number(lengthEl.value);
  let pool = '';
  if (lowerEl.checked) pool += LOWER;
  if (upperEl.checked) pool += UPPER;
  if (numEl.checked) pool += NUMS;
  if (symEl.checked) pool += SYMS;

  if (!pool) {
    alert('Please select at least one character type.');
    return '';
  }

  // Ensure at least one char from each selected set is present
  const required = [];
  if (lowerEl.checked) required.push(randomChar(LOWER));
  if (upperEl.checked) required.push(randomChar(UPPER));
  if (numEl.checked)    required.push(randomChar(NUMS));
  if (symEl.checked)    required.push(randomChar(SYMS));

  const remainingLen = Math.max(0, len - required.length);
  let result = required.join('');

  for (let i = 0; i < remainingLen; i++) {
    result += randomChar(pool);
  }

  // Shuffle result so required-chars aren't always at start
  result = shuffleString(result);
  return result;
}

function randomChar(str) {
  return str.charAt(Math.floor(Math.random() * str.length));
}

function shuffleString(s) {
  const arr = s.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

// Strength estimation (simple heuristic)
function estimateStrength(pwd) {
  if (!pwd) return {score:0, label:'—'};
  let score = 0;
  const len = pwd.length;
  if (len >= 8) score += 1;
  if (len >= 12) score += 1;
  if (len >= 16) score += 1;

  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNum = /\d/.test(pwd);
  const hasSym = /[^A-Za-z0-9]/.test(pwd);

  const variety = [hasLower, hasUpper, hasNum, hasSym].filter(Boolean).length;
  score += Math.max(0, variety - 1); // reward variety

  // score range roughly 0..5
  const pct = Math.min(100, Math.round((score / 5) * 100));
  let label = 'Weak';
  if (pct >= 80) label = 'Excellent';
  else if (pct >= 60) label = 'Strong';
  else if (pct >= 40) label = 'Medium';
  else label = 'Weak';

  return {score: pct, label};
}

// Apply strength bar visuals
function updateStrengthVisual(pwd) {
  const {score, label} = estimateStrength(pwd);
  strengthBarFill.style.width = `${score}%`;

  if (score >= 80) strengthBarFill.style.background = 'var(--good)';
  else if (score >= 60) strengthBarFill.style.background = 'var(--warning)';
  else strengthBarFill.style.background = 'var(--danger)';

  strengthText.textContent = label;
}

// Event: generate
generateBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const pwd = generatePassword();
  outputEl.value = pwd;
  updateStrengthVisual(pwd);
});

// Event: copy
copyBtn.addEventListener('click', async () => {
  const txt = outputEl.value;
  if (!txt) return;
  try {
    await navigator.clipboard.writeText(txt);
    copyBtn.textContent = 'Copied';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
  } catch (err) {
    // fallback
    outputEl.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
  }
});

// Clear button
clearBtn.addEventListener('click', () => {
  outputEl.value = '';
  updateStrengthVisual('');
});

// Update strength when user types or changes options
outputEl.addEventListener('input', (e) => updateStrengthVisual(e.target.value));
[lowerEl, upperEl, numEl, symEl, lengthEl].forEach(el => el.addEventListener('change', () => {
  const cur = outputEl.value;
  if (cur) updateStrengthVisual(cur);
}));
