let model;

window.onload = async () => {
  model = await cocoSsd.load();
  console.log("✅ Modèle chargé");
};

async function detect() {
  const img = document.getElementById("image");
  const canvas = document.getElementById("canvas");

  if (!canvas) {
    console.error("❌ Canvas introuvable");
    return;
  }

  const ctx = canvas.getContext("2d");
  const url = document.getElementById("urlInput").value;

  img.src = url;

  img.onload = async () => {
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const predictions = await model.detect(img);

    const filtered = predictions.filter(p => p.score >= 0.8);

    filtered.forEach(p => {
      const [x, y, w, h] = p.bbox;

      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      const label = `${p.class} ${(p.score * 100).toFixed(0)}%`;
      ctx.fillStyle = "red";
      ctx.font = "16px Arial";
      ctx.fillText(label, x, y > 20 ? y - 5 : y + 20);
    });
  };
}
