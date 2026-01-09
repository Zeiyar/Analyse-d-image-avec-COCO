let model;
let isLoading = false;

// Couleurs pour différentes classes
const colors = {
  person: '#FF6B6B',
  car: '#4ECDC4',
  dog: '#FFE66D',
  cat: '#95E1D3',
  default: '#667EEA'
};

window.onload = async () => {
  try {
    showMessage('Chargement du modèle COCO-SSD...', 'loader');
    model = await cocoSsd.load();
    hideMessage('loader');
    showMessage('✅ Modèle chargé avec succès!', 'success');
    console.log("✅ Modèle COCO-SSD chargé");
  } catch (error) {
    console.error("❌ Erreur lors du chargement:", error);
    showMessage('❌ Erreur: Impossible de charger le modèle', 'error');
  }
};

function updateConfidenceDisplay() {
  const slider = document.getElementById('confidenceSlider');
  const display = document.getElementById('confidenceDisplay');
  display.textContent = slider.value + '%';
}

function showMessage(msg, type) {
  const errorEl = document.getElementById('errorMsg');
  const successEl = document.getElementById('successMsg');
  const loaderEl = document.getElementById('loader');

  if (type === 'error') {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
  } else if (type === 'success') {
    successEl.textContent = msg;
    successEl.style.display = 'block';
  } else if (type === 'loader') {
    loaderEl.style.display = 'block';
  }
}

function hideMessage(type) {
  const errorEl = document.getElementById('errorMsg');
  const successEl = document.getElementById('successMsg');
  const loaderEl = document.getElementById('loader');

  if (type === 'error') errorEl.style.display = 'none';
  if (type === 'success') successEl.style.display = 'none';
  if (type === 'loader') loaderEl.style.display = 'none';
}

async function detect() {
  if (isLoading) return;

  const urlInput = document.getElementById('urlInput');
  const url = urlInput.value.trim();

  if (!url) {
    showMessage('❌ Veuillez entrer une URL d\'image', 'error');
    return;
  }

  if (!model) {
    showMessage('❌ Le modèle n\'est pas encore chargé', 'error');
    return;
  }

  isLoading = true;
  document.getElementById('detectBtn').disabled = true;
  hideMessage('error');
  hideMessage('success');
  showMessage('Analyse en cours...', 'loader');

  try {
    const img = document.getElementById("image");
    const canvas = document.getElementById("canvas");
    const canvasContainer = document.getElementById("canvasContainer");
    const ctx = canvas.getContext("2d");

    img.src = url;

    img.onload = async () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const predictions = await model.detect(img);
        const confidenceThreshold = document.getElementById('confidenceSlider').value / 100;
        const filtered = predictions.filter(p => p.score >= confidenceThreshold);

        // Calculer les statistiques
        const avgConfidence = filtered.length > 0
          ? (filtered.reduce((sum, p) => sum + p.score, 0) / filtered.length * 100).toFixed(1)
          : 0;

        // Dessiner les bounding boxes
        filtered.forEach((p, index) => {
          const [x, y, w, h] = p.bbox;
          const color = colors[p.class.toLowerCase()] || colors.default;
          const score = (p.score * 100).toFixed(1);

          // Bounding box
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, w, h);

          // Label avec fond
          const label = `${p.class} ${score}%`;
          ctx.font = 'bold 14px Arial';
          const textMetrics = ctx.measureText(label);
          const textWidth = textMetrics.width + 10;
          const textHeight = 20;

          const labelY = y > 25 ? y - 5 : y + h + 15;
          ctx.fillStyle = color;
          ctx.fillRect(x, labelY - textHeight + 5, textWidth, textHeight);

          ctx.fillStyle = 'white';
          ctx.fillText(label, x + 5, labelY);
        });

        // Afficher le canvas et les stats
        canvasContainer.style.display = 'block';
        document.getElementById('objectCount').textContent = filtered.length;
        document.getElementById('avgConfidence').textContent = avgConfidence + '%';

        hideMessage('loader');
        if (filtered.length > 0) {
          showMessage(`✅ ${filtered.length} objet(s) détecté(s)!`, 'success');
        } else {
          showMessage('ℹ️ Aucun objet détecté avec ce niveau de confiance', 'success');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la détection:', error);
        hideMessage('loader');
        showMessage('❌ Erreur lors de l\'analyse de l\'image', 'error');
      }
    };

    img.onerror = () => {
      hideMessage('loader');
      showMessage('❌ Impossible de charger l\'image. Vérifiez l\'URL', 'error');
    };
  } catch (error) {
    console.error('❌ Erreur:', error);
    hideMessage('loader');
    showMessage('❌ Une erreur est survenue', 'error');
  } finally {
    isLoading = false;
    document.getElementById('detectBtn').disabled = false;
  }
}
