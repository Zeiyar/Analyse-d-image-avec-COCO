let model;

async function loadModel() {
    model = await cocoSsd.load();
    console.log("Model loaded.");
}
loadModel();

async function detect(){
    const img = document.getElementById('image');
    const url = document.getElementById('urlInput').value;

    console.log("Detecting objects in image from URL:", url);
    img.src = url;

    img.onload = async () => {
        const predictions = await model.detect(img);
        document.getElementById('results').textContent =
        JSON.stringify(predictions, null, 2);
    }
}

async function detect() {
  const img = document.getElementById("image");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const url = document.getElementById("urlInput").value;

  img.src = url;

  img.onload = async () => {
    // Adapter la taille du canvas à l’image
    canvas.width = img.width;
    canvas.height = img.height;

    // Dessiner l’image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Détection
    const predictions = await model.detect(img);

    // Filtrer à minimum 80 %
    const filtered = predictions.filter(p => p.score >= 0.8);

    // Dessiner les bounding boxes
    filtered.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;

      // Rectangle
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Label
      const label = `${prediction.class} ${(prediction.score * 100).toFixed(0)}%`;
      ctx.fillStyle = "red";
      ctx.font = "16px Arial";
      ctx.fillText(label, x, y > 20 ? y - 5 : y + 20);
    });
  };
}