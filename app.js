/**
 * CandidSet - 《黑客帝国》基努·里维斯片场探班生成器
 * Dedicated Keanu Reeves Matrix BTS Cameo Engine
 */

// ==================== STATE MANAGEMENT ====================
let userPreprocessedImageB64 = null;
let generatedRawImageB64 = null;
let currentExportTemplate = 'vip_pass';
let currentExportRenderedUrl = null;

// Filter Settings (Canvas Module B)
let filterSettings = {
  flashIntensity: 0.88,
  vignette: 0.65,
  filmGrain: 0.45,
  chromaticAberration: 2,
  vintageColorGrade: true
};

// Random Keanu on-set resting actions
const KEANU_BTS_ACTIONS = [
  {
    label: '手握冰可乐闲聊',
    enDesc: 'leaning back relaxed holding an aluminum can of Coca-Cola, with black sunglasses pushed up on his forehead and smiling gently',
    props: 'can of Coke, unbuttoned trench coat collar, stunt harness buckle'
  },
  {
    label: '分吃外卖披萨',
    enDesc: 'sharing a slice of takeaway pepperoni pizza from an open pizza box on a plastic soundstage table',
    props: 'takeaway pizza box, red plastic cup, greasy napkins'
  },
  {
    label: '低头看台词剧本',
    enDesc: 'holding a paper movie script binder with yellow highlighter marks, explaining a scene playfully',
    props: 'bound script binder with yellow highlighter, paper coffee cup'
  },
  {
    label: '一起比耶自拍',
    enDesc: 'making a fun candid peace sign gesture towards the camera, laughing in an authentic off-camera break',
    props: 'goofy smiling expression, half-worn trench coat'
  },
  {
    label: '手持场记板打板',
    enDesc: 'holding the wooden Matrix clapperboard in front of both of them with white chalk lettering',
    props: 'wooden film clapperboard, wireless ear piece around neck'
  }
];

let selectedAction = KEANU_BTS_ACTIONS[0];

// Sample test portrait avatars
const SAMPLE_PORTRAITS = [
  {
    name: '亚裔青年 (男)',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: '亚裔女性',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: '欧美青年 (男)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: '欧美女性',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
  }
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initSampleAvatars();
  updateApiKeyStatus();
  setupCompareButton();
});

function initSampleAvatars() {
  const container = document.getElementById('sampleAvatarsContainer');
  if (!container) return;

  container.innerHTML = SAMPLE_PORTRAITS.map(sample => `
    <button onclick="handleSelectSampleAvatar('${sample.url}')" class="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-700 hover:bg-zinc-800/80 active:scale-95 transition-all text-left group">
      <img src="${sample.url}" alt="${sample.name}" class="w-9 h-9 rounded-lg object-cover group-hover:ring-2 ring-emerald-500 transition-all">
      <span class="text-[11px] font-medium text-zinc-300 group-hover:text-white truncate">
        ${sample.name}
      </span>
    </button>
  `).join('');
}

// ==================== STEP ROUTING ====================
function switchStep(step) {
  const stepUpload = document.getElementById('stepUpload');
  const stepGenerating = document.getElementById('stepGenerating');
  const stepResult = document.getElementById('stepResult');

  if (stepUpload) stepUpload.classList.add('hidden');
  if (stepGenerating) stepGenerating.classList.add('hidden');
  if (stepResult) stepResult.classList.add('hidden');

  if (step === 'upload' && stepUpload) stepUpload.classList.remove('hidden');
  if (step === 'generating' && stepGenerating) stepGenerating.classList.remove('hidden');
  if (step === 'result' && stepResult) stepResult.classList.remove('hidden');

  lucide.createIcons();
}

function resetWorkflow() {
  userPreprocessedImageB64 = null;
  generatedRawImageB64 = null;
  hideError();
  document.getElementById('dropzoneContainer').classList.remove('hidden');
  document.getElementById('previewContainer').classList.add('hidden');
  document.getElementById('quickSampleAvatars').classList.remove('hidden');
  switchStep('upload');
}

function showError(msg) {
  const alertEl = document.getElementById('errorAlert');
  const msgEl = document.getElementById('errorMessage');
  if (alertEl && msgEl) {
    msgEl.textContent = msg;
    alertEl.classList.remove('hidden');
  }
}

function hideError() {
  const alertEl = document.getElementById('errorAlert');
  if (alertEl) alertEl.classList.add('hidden');
}

// ==================== CANVAS MODULE A: PREPROCESSING ====================
async function handleFileSelect(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  await preprocessAndDisplay(file);
}

async function handleSelectSampleAvatar(url) {
  await preprocessAndDisplay(url);
}

async function preprocessAndDisplay(fileOrUrl) {
  try {
    const processedB64 = await runCanvasModuleAPreprocess(fileOrUrl);
    userPreprocessedImageB64 = processedB64;

    const previewImg = document.getElementById('userCroppedPreviewImg');
    previewImg.src = processedB64;

    document.getElementById('dropzoneContainer').classList.add('hidden');
    document.getElementById('quickSampleAvatars').classList.add('hidden');
    document.getElementById('previewContainer').classList.remove('hidden');
    lucide.createIcons();
  } catch (err) {
    console.error('Preprocessing failed:', err);
    showError('图片预处理失败，请换一张照片重试。');
  }
}

function runCanvasModuleAPreprocess(fileOrUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // 4:3 Aspect ratio center crop
      let targetW = img.width;
      let targetH = img.height;
      const expectedH = (img.width * 3) / 4;

      if (img.height > expectedH) {
        targetH = expectedH;
      } else {
        targetW = (img.height * 4) / 3;
      }

      const offsetX = (img.width - targetW) / 2;
      const offsetY = (img.height - targetH) / 2;

      let finalW = targetW;
      let finalH = targetH;
      if (finalW > 1024) {
        finalH = Math.round((finalH * 1024) / finalW);
        finalW = 1024;
      }

      const canvas = document.createElement('canvas');
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, offsetX, offsetY, targetW, targetH, 0, 0, finalW, finalH);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = () => reject('Failed to load image');

    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else {
      const reader = new FileReader();
      reader.onload = ev => {
        img.src = ev.target.result;
      };
      reader.onerror = () => reject('Failed to read file');
      reader.readAsDataURL(fileOrUrl);
    }
  });
}

// ==================== STEP 2: GENERATION PIPELINE ====================
const PIPELINE_STAGES = [
  { label: '调取《黑客帝国》1999 悉尼子弹时间机密摄影棚档案...', icon: 'film' },
  { label: '解构基努·里维斯及踝皮风衣、墨镜与安全威亚装造...', icon: 'shield-check' },
  { label: '注入片场穿帮道具：KEANU 导演椅、绿幕边缘与粗线缆...', icon: 'sparkles' },
  { label: '强制施加一人一采同源机顶直闪 (Flash-on) 与硬投影...', icon: 'zap' },
  { label: 'Canvas 端侧注入 ISO 1200 弱光噪点与镜头边缘色散...', icon: 'camera' }
];

async function startMatrixGeneration() {
  if (!userPreprocessedImageB64) return;

  switchStep('generating');
  renderPipelineStages(0);

  // Pick random resting action
  selectedAction = KEANU_BTS_ACTIONS[Math.floor(Math.random() * KEANU_BTS_ACTIONS.length)];

  let currentStage = 0;
  const interval = setInterval(() => {
    currentStage++;
    if (currentStage < PIPELINE_STAGES.length) {
      renderPipelineStages(currentStage);
      document.getElementById('pipelineProgressPct').textContent = `${Math.round(((currentStage + 1) / PIPELINE_STAGES.length) * 100)}%`;
    } else {
      clearInterval(interval);
    }
  }, 1000);

  try {
    const resultImageUrl = await synthesizeKeanuMatrixBTS(userPreprocessedImageB64, selectedAction);
    generatedRawImageB64 = resultImageUrl;

    setTimeout(() => {
      clearInterval(interval);
      displayResult();
    }, 4500);
  } catch (err) {
    console.error('Matrix generation failed:', err);
    clearInterval(interval);
    showError('生成探班照失败，请稍后重试。');
    switchStep('upload');
  }
}

function renderPipelineStages(currentIdx) {
  const container = document.getElementById('pipelineStagesList');
  if (!container) return;

  container.innerHTML = PIPELINE_STAGES.map((stage, idx) => {
    const isDone = idx < currentIdx;
    const isCurrent = idx === currentIdx;

    return `
      <div class="flex items-center gap-3 text-xs transition-all duration-300 ${
        isCurrent
          ? 'text-white font-bold translate-x-1'
          : isDone
          ? 'text-zinc-500 line-through opacity-80'
          : 'text-zinc-600 opacity-40'
      }">
        <div class="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
          isDone
            ? 'bg-emerald-500/20 text-emerald-400'
            : isCurrent
            ? 'bg-emerald-500 text-black font-bold animate-pulse'
            : 'bg-zinc-800 text-zinc-600'
        }">
          <i data-lucide="${stage.icon}" class="w-3 h-3"></i>
        </div>
        <span class="truncate">${stage.label}</span>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

async function synthesizeKeanuMatrixBTS(userB64, action) {
  // If API Key is present, try Cloud Multimodal
  const apiKey = localStorage.getItem('candidset_gemini_api_key');
  if (apiKey) {
    try {
      const prompt = `Raw snapshot photo taken on The Matrix movie soundstage with a smartphone on-camera direct flash at night. Two people having a candid break on the film set: on left a regular visitor, on right a tall lean handsome man with short glossy black hair and light stubble, sunglasses pushed up on forehead, wearing an authentic ankle-length black trench coat unzipped at chest with stunt harness straps visible. They are ${action.enDesc}. Background with messy soundstage equipment: green chroma screen curtain edge, black folding director chair with white stencil tape labeled "KEANU", floor cables with yellow hazard tape, C-stand metal rigs. Harsh direct on-camera flash illumination with strong specular highlights on both foreheads and hard dark cast shadow directly behind both subjects on backdrop wall. Low-light ISO 1200 grain texture, documentary realism.`;
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: prompt }],
          parameters: { sampleCount: 1, aspectRatio: '4:3', personGeneration: 'ALLOW_ADULT' }
        })
      });

      if (res.ok) {
        const resData = await res.json();
        const b64 = resData?.predictions?.[0]?.bytesBase64Encoded;
        if (b64) return `data:image/jpeg;base64,${b64}`;
      }
    } catch (e) {
      console.warn('Imagen API fallback to local compositing:', e);
    }
  }

  // Ultra-Photoreal Matrix Soundstage Compositing
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    const W = 1024;
    const H = 768;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // 1. Dark Matrix Soundstage Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#060807');
    bgGrad.addColorStop(0.7, '#0b140f');
    bgGrad.addColorStop(1, '#050706');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Green Chroma Screen curtain on right-center background
    ctx.save();
    ctx.fillStyle = '#00bb44';
    ctx.beginPath();
    ctx.moveTo(W * 0.52, 0);
    ctx.lineTo(W * 0.96, 0);
    ctx.lineTo(W * 0.92, H * 0.72);
    ctx.lineTo(W * 0.48, H * 0.72);
    ctx.closePath();
    ctx.fill();

    // Wrinkles in curtain
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(W * 0.68, 0);
    ctx.bezierCurveTo(W * 0.65, H * 0.3, W * 0.7, H * 0.5, W * 0.64, H * 0.72);
    ctx.stroke();
    ctx.restore();

    // 3. Overhead Lighting Trusses & C-Stands
    ctx.strokeStyle = '#1e2922';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 45);
    ctx.lineTo(W, 45);
    ctx.moveTo(0, 75);
    ctx.lineTo(W, 75);
    for (let x = 30; x < W; x += 60) {
      ctx.moveTo(x, 45);
      ctx.lineTo(x + 30, 75);
      ctx.lineTo(x + 60, 45);
    }
    ctx.stroke();

    // C-Stand metal rig on left
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(40, 45);
    ctx.lineTo(40, H);
    ctx.moveTo(40, 180);
    ctx.lineTo(130, 110);
    ctx.stroke();

    // Heavy Floor cables
    ctx.strokeStyle = '#050505';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(0, H - 30);
    ctx.bezierCurveTo(W * 0.3, H - 90, W * 0.7, H - 10, W, H - 50);
    ctx.stroke();
    ctx.strokeStyle = '#eab308'; // Yellow safety tape
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 14]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Director Folding Chair in background with "KEANU" stencil
    ctx.fillStyle = '#18181b';
    ctx.fillRect(W * 0.42, H * 0.44, 120, 85);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('KEANU', W * 0.42 + 60, H * 0.44 + 40);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillText('NEO / PROD', W * 0.42 + 60, H * 0.44 + 60);

    // 4. Draw Keanu Reeves (Right)
    const actorW = W * 0.48;
    const actorH = H * 0.85;
    const actorX = W * 0.48;
    const actorY = H * 0.18;

    // Harsh shadow behind Keanu
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.beginPath();
    ctx.ellipse(actorX + actorW * 0.52, actorY + actorH * 0.52, actorW * 0.46, actorH * 0.46, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Keanu Trench Coat
    ctx.save();
    ctx.fillStyle = '#0a0a0c';
    ctx.beginPath();
    ctx.roundRect(actorX, actorY + 115, actorW, actorH - 115, [80, 80, 0, 0]);
    ctx.fill();

    // Leather Coat Texture
    const coatGrad = ctx.createLinearGradient(actorX, actorY, actorX + actorW, actorY + actorH);
    coatGrad.addColorStop(0, '#1c1917');
    coatGrad.addColorStop(0.5, '#0c0a09');
    coatGrad.addColorStop(1, '#050505');
    ctx.fillStyle = coatGrad;
    ctx.fillRect(actorX + 20, actorY + 135, actorW - 40, actorH - 135);

    // Stunt harness belt
    ctx.fillStyle = '#475569';
    ctx.fillRect(actorX + 30, actorY + 340, actorW - 60, 20);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(actorX + actorW * 0.5 - 20, actorY + 335, 40, 30); // Metal buckle

    // Head / Skin
    ctx.fillStyle = '#fed7aa'; // Natural skin
    ctx.beginPath();
    ctx.arc(actorX + actorW * 0.5, actorY + 70, 62, 0, Math.PI * 2);
    ctx.fill();

    // Keanu Signature Black Hair (Slightly long, parted)
    ctx.fillStyle = '#171717';
    ctx.beginPath();
    ctx.arc(actorX + actorW * 0.5, actorY + 50, 68, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();

    // Sunglasses pushed up to forehead
    ctx.fillStyle = '#000000';
    ctx.fillRect(actorX + actorW * 0.5 - 35, actorY + 28, 70, 14);

    // Flash Highlight on Keanu
    const actorFlash = ctx.createRadialGradient(
      actorX + actorW * 0.48, actorY + 65, 5,
      actorX + actorW * 0.48, actorY + 65, 110
    );
    actorFlash.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
    actorFlash.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = actorFlash;
    ctx.fillRect(actorX, actorY, actorW, actorH);

    // Name label
    ctx.fillStyle = '#00ff66';
    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('基努·里维斯 (Keanu)', actorX + actorW * 0.5, actorY + 180);
    ctx.font = '500 13px "JetBrains Mono", monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('饰 尼奥 / Neo • 悉尼片场', actorX + actorW * 0.5, actorY + 205);
    ctx.restore();

    // 5. Draw User (Left) with matching Flash-on
    const userImg = new Image();
    userImg.onload = () => {
      const userW = W * 0.46;
      const userH = H * 0.82;
      const userX = W * 0.08;
      const userY = H * 0.22;

      // Harsh Drop Shadow
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.beginPath();
      ctx.ellipse(userX + userW * 0.55, userY + userH * 0.5, userW * 0.48, userH * 0.48, 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw User
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(userX, userY, userW, userH, [180, 180, 20, 20]);
      ctx.clip();
      ctx.drawImage(userImg, userX, userY, userW, userH);

      // Specular Flash Highlight on user forehead
      const flashSpot = ctx.createRadialGradient(
        userX + userW * 0.5, userY + userH * 0.28, 5,
        userX + userW * 0.5, userY + userH * 0.28, userW * 0.55
      );
      flashSpot.addColorStop(0, 'rgba(255, 255, 250, 0.32)');
      flashSpot.addColorStop(0.5, 'rgba(255, 240, 220, 0.12)');
      flashSpot.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = flashSpot;
      ctx.fillRect(userX, userY, userW, userH);
      ctx.restore();

      // 6. Foreground Clapperboard & Props
      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(W * 0.35, H - 110, 300, 100);
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 2;
      ctx.strokeRect(W * 0.35, H - 110, 300, 100);

      // Clapper stripes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        ctx.moveTo(W * 0.35 + i * 50, H - 110);
        ctx.lineTo(W * 0.35 + i * 50 + 26, H - 110);
        ctx.lineTo(W * 0.35 + i * 50 + 6, H - 85);
        ctx.lineTo(W * 0.35 + i * 50 - 20, H - 85);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = '#00ff66';
      ctx.font = '800 15px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`SCENE: MATRIX-48B  TAKE: 03`, W * 0.35 + 18, H - 55);
      ctx.font = '600 12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`DIR: WACHOWSKIS • ${action.label}`, W * 0.35 + 18, H - 30);
      ctx.restore();

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    userImg.src = userB64;
  });
}

// ==================== STEP 3: RESULT & CANVAS SHADERS ====================
function displayResult() {
  switchStep('result');
  document.getElementById('resultActionText').textContent = selectedAction.label;
  document.getElementById('compareOriginalImg').src = userPreprocessedImageB64;

  applyShaderToMainCanvas();
}

function updateShaderSettings() {
  filterSettings.flashIntensity = parseFloat(document.getElementById('sliderFlash').value);
  filterSettings.vignette = parseFloat(document.getElementById('sliderVignette').value);
  filterSettings.filmGrain = parseFloat(document.getElementById('sliderGrain').value);
  filterSettings.chromaticAberration = parseInt(document.getElementById('sliderAberration').value);
  filterSettings.vintageColorGrade = document.getElementById('chkVintageGrade').checked;

  document.getElementById('valFlashIntensity').textContent = `${Math.round(filterSettings.flashIntensity * 100)}%`;
  document.getElementById('valVignette').textContent = `${Math.round(filterSettings.vignette * 100)}%`;
  document.getElementById('valGrain').textContent = `${Math.round(filterSettings.filmGrain * 100)}%`;
  document.getElementById('valAberration').textContent = `${filterSettings.chromaticAberration}px`;

  applyShaderToMainCanvas();
}

function resetShaderSettings() {
  document.getElementById('sliderFlash').value = '0.88';
  document.getElementById('sliderVignette').value = '0.65';
  document.getElementById('sliderGrain').value = '0.45';
  document.getElementById('sliderAberration').value = '2';
  document.getElementById('chkVintageGrade').checked = true;

  updateShaderSettings();
}

function applyShaderToMainCanvas() {
  const canvas = document.getElementById('mainRenderCanvas');
  if (!canvas || !generatedRawImageB64) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    canvas.width = img.width || 1024;
    canvas.height = img.height || 768;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const W = canvas.width;
    const H = canvas.height;

    // Flash Bloom
    if (filterSettings.flashIntensity > 0.05) {
      const centerX = W * 0.5;
      const centerY = H * 0.45;
      const maxR = Math.sqrt(W * W + H * H) * 0.65;

      const flashGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, maxR * 0.7);
      flashGrad.addColorStop(0, `rgba(255, 252, 245, ${0.35 * filterSettings.flashIntensity})`);
      flashGrad.addColorStop(0.3, `rgba(255, 245, 230, ${0.18 * filterSettings.flashIntensity})`);
      flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = flashGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // Falloff Vignette
    if (filterSettings.vignette > 0.05) {
      const centerX = W * 0.5;
      const centerY = H * 0.45;
      const maxR = Math.sqrt(W * W + H * H) * 0.65;

      const vigGrad = ctx.createRadialGradient(centerX, centerY, W * 0.3, centerX, centerY, maxR);
      vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vigGrad.addColorStop(0.6, `rgba(0, 0, 0, ${0.25 * filterSettings.vignette})`);
      vigGrad.addColorStop(1, `rgba(0, 0, 0, ${0.75 * filterSettings.vignette})`);

      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = vigGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // Pixel Manipulation: ISO Noise + Chromatic Aberration
    if (filterSettings.filmGrain > 0 || filterSettings.chromaticAberration > 0 || filterSettings.vintageColorGrade) {
      const imgData = ctx.getImageData(0, 0, W, H);
      const data = imgData.data;
      const grainAmount = filterSettings.filmGrain * 45;
      const offset = filterSettings.chromaticAberration;

      let origData = null;
      if (offset > 0) origData = new Uint8ClampedArray(data);

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const idx = (y * W + x) * 4;

          // RGB Split
          if (origData && offset > 0) {
            const leftX = Math.max(0, x - offset);
            const rightX = Math.min(W - 1, x + offset);
            data[idx] = origData[(y * W + leftX) * 4];
            data[idx + 2] = origData[(y * W + rightX) * 4 + 2];
          }

          // Matrix Subtle Emerald Grade
          if (filterSettings.vintageColorGrade) {
            data[idx] = Math.min(255, data[idx] * 0.98 + 2); // Red
            data[idx + 1] = Math.min(255, data[idx + 1] * 1.05 + 4); // Green tint
            data[idx + 2] = Math.min(255, data[idx + 2] * 0.96); // Blue
          }

          // ISO 1200 Noise
          if (grainAmount > 0) {
            const noise = (Math.random() - 0.5) * grainAmount;
            data[idx] = Math.min(255, Math.max(0, data[idx] + noise));
            data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noise));
            data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noise));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
    }
  };
  img.src = generatedRawImageB64;
}

function setupCompareButton() {
  const btn = document.getElementById('holdCompareBtn');
  const compImg = document.getElementById('compareOriginalImg');
  const canvas = document.getElementById('mainRenderCanvas');

  if (!btn || !compImg || !canvas) return;

  const showComp = () => {
    canvas.classList.add('hidden');
    compImg.classList.remove('hidden');
  };
  const hideComp = () => {
    canvas.classList.remove('hidden');
    compImg.classList.add('hidden');
  };

  btn.addEventListener('mousedown', showComp);
  btn.addEventListener('mouseup', hideComp);
  btn.addEventListener('mouseleave', hideComp);
  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    showComp();
  });
  btn.addEventListener('touchend', hideComp);
}

function reTriggerGeneration() {
  startMatrixGeneration();
}

// ==================== CANVAS MODULE C: EXPORT PASS & POLAROID ====================
function openExportModal() {
  toggleExportModal(true);
  renderExportAsset();
}

function toggleExportModal(show) {
  const modal = document.getElementById('exportModal');
  if (modal) {
    if (show) modal.classList.remove('hidden');
    else modal.classList.add('hidden');
  }
}

function setExportTemplate(tpl) {
  currentExportTemplate = tpl;

  const btnMap = {
    vip_pass: 'btnTplVip',
    polaroid: 'btnTplPolaroid',
    raw_photo: 'btnTplRaw'
  };

  Object.entries(btnMap).forEach(([k, btnId]) => {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (k === tpl) {
      btn.className = 'p-3 rounded-xl border text-center transition-all bg-emerald-600/20 border-emerald-500 text-white font-bold';
    } else {
      btn.className = 'p-3 rounded-xl border text-center transition-all bg-zinc-800/50 border-zinc-700/60 text-zinc-400 hover:text-white';
    }
  });

  const nameField = document.getElementById('visitorNameField');
  if (nameField) {
    if (tpl === 'vip_pass') nameField.classList.remove('hidden');
    else nameField.classList.add('hidden');
  }

  renderExportAsset();
}

async function renderExportAsset() {
  const sourceCanvas = document.getElementById('mainRenderCanvas');
  if (!sourceCanvas) return;

  const userName = document.getElementById('visitorNameInput').value.trim() || 'VIP GUEST';
  const outCanvas = document.createElement('canvas');
  const ctx = outCanvas.getContext('2d');

  if (currentExportTemplate === 'raw_photo') {
    currentExportRenderedUrl = sourceCanvas.toDataURL('image/jpeg', 0.95);
    document.getElementById('exportPreviewImg').src = currentExportRenderedUrl;
    return;
  }

  if (currentExportTemplate === 'polaroid') {
    const W = 1080;
    const H = 1350;
    outCanvas.width = W;
    outCanvas.height = H;

    ctx.fillStyle = '#f6f5ef';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    for (let i = 0; i < 4000; i++) {
      ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2);
    }

    const padX = 75;
    const padY = 75;
    const photoW = W - padX * 2;
    const photoH = 950;

    ctx.fillStyle = '#101014';
    ctx.fillRect(padX, padY, photoW, photoH);
    ctx.drawImage(sourceCanvas, padX, padY, photoW, photoH);

    ctx.fillStyle = '#1e293b';
    ctx.font = '700 40px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`探班《黑客帝国》片场`, padX + 20, padY + photoH + 90);

    ctx.fillStyle = '#059669';
    ctx.font = '600 26px "JetBrains Mono", monospace';
    ctx.fillText(`with 基努·里维斯 (Keanu / Neo)`, padX + 20, padY + photoH + 150);
    ctx.fillText(`📍 悉尼 Fox Studios • ${selectedAction.label}`, padX + 20, padY + photoH + 195);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`'99. 08. 31 (Matrix BTS)`, W - padX - 20, padY + photoH + 195);

    currentExportRenderedUrl = outCanvas.toDataURL('image/jpeg', 0.95);
    document.getElementById('exportPreviewImg').src = currentExportRenderedUrl;
    return;
  }

  // VIP All Access Pass (1200 x 1850)
  const W = 1200;
  const H = 1850;
  outCanvas.width = W;
  outCanvas.height = H;

  ctx.fillStyle = '#090c0a';
  ctx.fillRect(0, 0, W, H);

  // Subtle Matrix Grid
  ctx.strokeStyle = 'rgba(0, 255, 102, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Lanyard Slot
  ctx.fillStyle = '#030403';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 80, 40, 160, 24, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 255, 102, 0.2)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Green Banner
  ctx.fillStyle = '#059669';
  ctx.fillRect(60, 95, W - 120, 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px "Cinzel", "Impact", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WARNER BROS • THE MATRIX SOUNDSTAGE PASS', W / 2, 134);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 52px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`《THE MATRIX》`, 65, 210);

  ctx.fillStyle = '#00ff66';
  ctx.font = '600 22px "JetBrains Mono", monospace';
  ctx.fillText(`PROD UNIT • BTS VISITATION VERIFIED`, 68, 245);

  // Holographic Foil Seal
  ctx.save();
  const holoGrad = ctx.createLinearGradient(W - 200, 180, W - 80, 260);
  holoGrad.addColorStop(0, '#00ff66');
  holoGrad.addColorStop(0.5, '#00f2fe');
  holoGrad.addColorStop(1, '#10b981');
  ctx.fillStyle = holoGrad;
  ctx.beginPath();
  ctx.arc(W - 130, 215, 45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.font = '900 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ALL ACCESS', W - 130, 215);
  ctx.fillText('VIP GUEST', W - 130, 230);
  ctx.restore();

  // Embed Photo
  const photoW = W - 140;
  const photoH = Math.round((photoW * 3) / 4);
  const photoX = 70;
  const photoY = 275;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(photoX, photoY, photoW, photoH, 16);
  ctx.clip();
  ctx.drawImage(sourceCanvas, photoX, photoY, photoW, photoH);

  // Rec Timecode
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(photoX + 20, photoY + 20, 210, 36);
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(photoX + 38, photoY + 38, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('REC • 01:24:08:15', photoX + 54, photoY + 44);

  // Date
  ctx.fillStyle = 'rgba(0, 255, 102, 0.95)';
  ctx.font = '800 24px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`'99 08 31`, photoX + photoW - 25, photoY + photoH - 25);
  ctx.restore();

  // Bottom Card
  const cardY = photoY + photoH + 35;
  ctx.fillStyle = '#111713';
  ctx.strokeStyle = 'rgba(0, 255, 102, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(70, cardY, photoW, 560, 20);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SPECIAL VISITOR', 110, cardY + 60);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 34px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(userName.toUpperCase(), 110, cardY + 105);

  ctx.fillStyle = '#64748b';
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.fillText('ON-SET CO-STAR', 110, cardY + 170);

  ctx.fillStyle = '#00ff66';
  ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('基努·里维斯 / KEANU REEVES (NEO)', 110, cardY + 215);

  ctx.fillStyle = '#64748b';
  ctx.font = '700 18px "JetBrains Mono", monospace';
  ctx.fillText('INTERACTION NOTE', 110, cardY + 280);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`“${selectedAction.label}”`, 110, cardY + 318);

  // Barcode
  ctx.fillStyle = '#e2e8f0';
  let curX = 110;
  while (curX < 610) {
    const bw = Math.floor(Math.random() * 4) + 1;
    const gap = Math.floor(Math.random() * 4) + 1;
    ctx.fillRect(curX, cardY + 370, bw, 70);
    curX += bw + gap;
  }

  ctx.fillStyle = '#475569';
  ctx.font = '600 16px "JetBrains Mono", monospace';
  ctx.fillText('SECURITY CODE: MATRIX-NEO-STAGE4 • AUTHENTICATED CANDID', 110, cardY + 475);

  // Red Stamp
  ctx.save();
  ctx.translate(W - 270, cardY + 330);
  ctx.rotate(-0.15);
  ctx.strokeStyle = '#00ff66';
  ctx.lineWidth = 4;
  ctx.strokeRect(-120, -45, 240, 90);
  ctx.fillStyle = '#00ff66';
  ctx.font = '900 26px "Impact", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('STAGE ACCESS', 0, -10);
  ctx.fillText('VERIFIED', 0, 25);
  ctx.restore();

  ctx.fillStyle = '#1e2922';
  ctx.font = '500 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('WARNER BROS STUDIOS • POWERED BY CANDIDSET BTS FLASH ENGINE', W / 2, H - 40);

  currentExportRenderedUrl = outCanvas.toDataURL('image/jpeg', 0.95);
  document.getElementById('exportPreviewImg').src = currentExportRenderedUrl;
}

function downloadExportImage() {
  if (!currentExportRenderedUrl) return;
  const a = document.createElement('a');
  a.href = currentExportRenderedUrl;
  a.download = `Matrix_BTS_Keanu_${currentExportTemplate}.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ==================== API KEY MODAL ====================
function toggleApiKeyModal(show) {
  const modal = document.getElementById('apiKeyModal');
  if (!modal) return;
  if (show) {
    document.getElementById('apiKeyInput').value = localStorage.getItem('candidset_gemini_api_key') || '';
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

function saveApiKey() {
  const val = document.getElementById('apiKeyInput').value.trim();
  if (val) {
    localStorage.setItem('candidset_gemini_api_key', val);
  } else {
    localStorage.removeItem('candidset_gemini_api_key');
  }
  updateApiKeyStatus();
  toggleApiKeyModal(false);
}

function updateApiKeyStatus() {
  const key = localStorage.getItem('candidset_gemini_api_key');
  const textEl = document.getElementById('apiKeyBtnText');
  if (textEl) {
    textEl.textContent = key ? 'API 已配置' : '设置 API Key';
  }
}
