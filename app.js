// Utility to convert degrees to radians
function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

// Construct path string for circular text. For full circles, we compose two arcs because a single 360° arc is not supported.
function describeCirclePath(cx, cy, radius, startDeg, sweepDeg) {
  if (Math.abs(sweepDeg) >= 360) {
    // use two 180° arcs
    const startRad = degToRad(startDeg);
    const x = cx + radius * Math.cos(startRad);
    const y = cy + radius * Math.sin(startRad);
    const midRad = degToRad(startDeg + (sweepDeg >= 0 ? 180 : -180));
    const midX = cx + radius * Math.cos(midRad);
    const midY = cy + radius * Math.sin(midRad);
    const sweepFlag = sweepDeg >= 0 ? 1 : 0;
    return `M ${x.toFixed(3)} ${y.toFixed(3)} A ${radius} ${radius} 0 0 ${sweepFlag} ${midX.toFixed(3)} ${midY.toFixed(3)} A ${radius} ${radius} 0 0 ${sweepFlag} ${x.toFixed(3)} ${y.toFixed(3)}`;
  }
  const startRad = degToRad(startDeg);
  const endRad = degToRad(startDeg + sweepDeg);
  const x0 = cx + radius * Math.cos(startRad);
  const y0 = cy + radius * Math.sin(startRad);
  const x1 = cx + radius * Math.cos(endRad);
  const y1 = cy + radius * Math.sin(endRad);
  const largeArc = Math.abs(sweepDeg) > 180 ? 1 : 0;
  const sweepFlag = sweepDeg >= 0 ? 1 : 0;
  return `M ${x0.toFixed(3)} ${y0.toFixed(3)} A ${radius} ${radius} 0 ${largeArc} ${sweepFlag} ${x1.toFixed(3)} ${y1.toFixed(3)}`;
}

// Global update function
function update() {
  const indicator = document.getElementById('status-indicator');
  indicator.style.opacity = '1';
  setTimeout(() => { indicator.style.opacity = '0'; }, 200);
  const text1 = document.getElementById('textInput1').value;
  const text2 = document.getElementById('textInput2').value;
  const text3 = document.getElementById('textInput3').value;
  const r1 = parseFloat(document.getElementById('radius1').value);
  const r2 = parseFloat(document.getElementById('radius2').value);
  const r3 = parseFloat(document.getElementById('radius3').value);
  const a1 = parseFloat(document.getElementById('angle1').value);
  const a2 = parseFloat(document.getElementById('angle2').value);
  const a3 = parseFloat(document.getElementById('angle3').value);
  const s1 = parseFloat(document.getElementById('sweep1').value);
  const s2 = parseFloat(document.getElementById('sweep2').value);
  const s3 = parseFloat(document.getElementById('sweep3').value);
  const f1 = parseFloat(document.getElementById('fontSize1').value);
  const f2 = parseFloat(document.getElementById('fontSize2').value);
  const f3 = parseFloat(document.getElementById('fontSize3').value);
  const textColor = document.getElementById('textColor').value;
  const fontFamily = document.getElementById('fontSelect').value;
  const letterSpacing = parseFloat(document.getElementById('letterSpacing').value);
  const outerWidth = parseFloat(document.getElementById('outerRingWidth').value);
  const outerColor = document.getElementById('outerRingColor').value;
  const innerWidth = parseFloat(document.getElementById('innerRingWidth').value);
  const innerColor = document.getElementById('innerRingColor').value;
  const path1 = document.getElementById('path1');
  const path2 = document.getElementById('path2');
  const path3 = document.getElementById('path3');
  path1.setAttribute('d', describeCirclePath(300, 300, r1, a1, s1));
  path2.setAttribute('d', describeCirclePath(300, 300, r2, a2, s2));
  path3.setAttribute('d', describeCirclePath(300, 300, r3, a3, s3));
  const layers = [document.getElementById('textLayer1'), document.getElementById('textLayer2'), document.getElementById('textLayer3')];
  const texts = [text1, text2, text3];
  const sizes = [f1, f2, f3];
  const pathRefs = ['#path1', '#path2', '#path3'];
  for (let i = 0; i < 3; i++) {
    const layer = layers[i];
    const tp = layer.querySelector('textPath');
    layer.setAttribute('fill', textColor);
    layer.setAttribute('font-family', fontFamily);
    layer.setAttribute('font-size', sizes[i]);
    layer.setAttribute('letter-spacing', letterSpacing);
    tp.setAttribute('href', pathRefs[i]);
    tp.setAttribute('startOffset', '0%');
    tp.textContent = texts[i] || '';
    layer.style.display = texts[i] ? 'inherit' : 'none';
  }
  const outerRing = document.getElementById('outerRing');
  const innerRing = document.getElementById('innerRing');
  outerRing.setAttribute('stroke-width', outerWidth);
  outerRing.setAttribute('stroke', outerColor);
  outerRing.setAttribute('r', r1 + outerWidth / 2);
  innerRing.setAttribute('stroke-width', innerWidth);
  innerRing.setAttribute('stroke', innerColor);
  innerRing.setAttribute('r', r3 - innerWidth / 2);
  const centerGroup = document.getElementById('centerImageGroup');
  centerGroup.innerHTML = '';
  if (window.centerImageData) {
    const sizePercent = parseFloat(document.getElementById('centerImageSize').value) / 100;
    const sizePx = 600 * 0.5 * sizePercent;
    const img = document.createElementNS('http://www.w3.org/2000/svg','image');
    img.setAttributeNS('http://www.w3.org/1999/xlink','href', window.centerImageData);
    img.setAttribute('x', (300 - sizePx / 2));
    img.setAttribute('y', (300 - sizePx / 2));
    img.setAttribute('width', sizePx);
    img.setAttribute('height', sizePx);
    centerGroup.appendChild(img);
  }
}

function setupListeners() {
  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', update);
    el.addEventListener('change', update);
  });
  document.getElementById('centerImage').addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        window.centerImageData = evt.target.result;
        update();
      };
      reader.readAsDataURL(file);
    } else {
      window.centerImageData = null;
      update();
    }
  });
  document.getElementById('exportPNG').addEventListener('click', function() {
    exportPNG();
  });
  document.getElementById('exportSVG').addEventListener('click', function() {
    exportSVG();
  });
}

// PNG DPI helper (same as in single file)
function setPNGdpi(buffer, dpi) {
  const PX_PER_METER = Math.round(dpi / 0.0254);
  const data = new Uint8Array(buffer);
  let offset = 8 + 4 + 4 + 13 + 4;
  const chunk = new Uint8Array(4 + 4 + 9 + 4);
  chunk[0] = 0x00; chunk[1] = 0x00; chunk[2] = 0x00; chunk[3] = 0x09;
  chunk[4] = 0x70; chunk[5] = 0x48; chunk[6] = 0x59; chunk[7] = 0x73;
  chunk[8] = (PX_PER_METER >>> 24) & 0xFF;
  chunk[9] = (PX_PER_METER >>> 16) & 0xFF;
  chunk[10] = (PX_PER_METER >>> 8) & 0xFF;
  chunk[11] = PX_PER_METER & 0xFF;
  chunk[12] = (PX_PER_METER >>> 24) & 0xFF;
  chunk[13] = (PX_PER_METER >>> 16) & 0xFF;
  chunk[14] = (PX_PER_METER >>> 8) & 0xFF;
  chunk[15] = PX_PER_METER & 0xFF;
  chunk[16] = 0x01;
  const crcInput = chunk.slice(4, 17);
  let crc = 0xffffffff;
  for (let i = 0; i < crcInput.length; i++) {
    crc ^= crcInput[i] << 24;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x80000000) {
        crc = (crc << 1) ^ 0x04C11DB7;
      } else {
        crc <<= 1;
      }
      crc >>>= 0;
    }
  }
  crc ^= 0xffffffff;
  chunk[17] = (crc >>> 24) & 0xFF;
  chunk[18] = (crc >>> 16) & 0xFF;
  chunk[19] = (crc >>> 8) & 0xFF;
  chunk[20] = crc & 0xFF;
  const out = new Uint8Array(data.length + chunk.length);
  out.set(data.slice(0, offset), 0);
  out.set(chunk, offset);
  out.set(data.slice(offset), offset + chunk.length);
  return out.buffer;
}

function exportSVG() {
  update();
  const svg = document.getElementById('previewSVG');
  const clone = svg.cloneNode(true);
  const serializer = new XMLSerializer();
  const source = '<?xml version="1.0" encoding="UTF-8"?>' + serializer.serializeToString(clone);
  const blob = new Blob([source], {type: 'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kreislogo.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function exportPNG() {
  const exportWidth = parseInt(document.getElementById('exportWidth').value) || 1200;
  const dpi = parseInt(document.getElementById('dpi').value) || 300;
  update();
  const svg = document.getElementById('previewSVG');
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svg);
  const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = function() {
    const aspect = img.height / img.width;
    const width = exportWidth;
    const height = Math.round(exportWidth * aspect);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob(function(blob) {
      const reader = new FileReader();
      reader.onload = function(evt) {
        const buffer = evt.target.result;
        const withDPI = setPNGdpi(buffer, dpi);
        const finalBlob = new Blob([withDPI], {type: 'image/png'});
        const finalURL = URL.createObjectURL(finalBlob);
        const a = document.createElement('a');
        a.href = finalURL;
        a.download = 'kreislogo.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(finalURL), 2000);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      };
      reader.readAsArrayBuffer(blob);
    }, 'image/png');
  };
  img.onerror = function(e) { console.error('Bild konnte nicht geladen werden', e); };
  img.src = url;
}

window.addEventListener('load', () => {
  setupListeners();
  update();
  setInterval(update, 1000);
});