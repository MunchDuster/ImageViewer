var canvas = document.getElementById("canvas");
var img = document.getElementById("myImg");
var ctx = canvas.getContext("2d");
var downloadButton = document.getElementById("button");

var imageData;
var data;
var imageLoaded = false;
var pendingUpdate = false;
var sliders = {
  brightness: 1,
  contrast: 1,
  saturation: 1,
  invert: 0,
  hueRotate: 0,
  opacity: 1,
  blur: 0,
};
const slidersStartValues = sliders;

//get image from user
function setImagePasted() {}
function setImageFile(event) {
  createImageBitmap(event.target.files[0]).then((map) => {
    oriX = map.width;
  });
  img.src = URL.createObjectURL(event.target.files[0]);
}
function setImageUrl(url) {
  img.src = url;
  originalImage.src = img.src;
}

//functions for html elements
async function download() {
  var imageDataStuff = await getImageDownloadData();
  var imageName = imageDataStuff[0].value;
  var imageExtension = imageDataStuff[1].value.toLowerCase();
  let canvasImage = canvas.toDataURL("image/" + imageExtension);

  // this can be used to download any image from webpage to local disk
  let xhr = new XMLHttpRequest();
  xhr.responseType = "blob";
  xhr.onload = function () {
    let a = document.createElement("a");
    a.href = window.URL.createObjectURL(xhr.response);
    a.download = imageName + "." + imageExtension;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  xhr.open("GET", canvasImage); // This is to download the canvas Image
  xhr.send();
}
function clearstuff() {
  img.src = "noimage.png";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("url").value = "";
  document.getElementById("upload").value = "";
}
function onImageLoad() {
  imageLoaded = true;
}
function onImageError() {
  imageLoaded = false;
}
//update called by change in filters
async function Update() {
  console.log(sliders);
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);

  if (!imageLoaded) return;

  imageData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
  data = imageData.data;

  brightness(sliders.brightness);
  contrast(sliders.contrast);
  saturation(sliders.saturation);
  invert(sliders.invert);
  hueRotate(sliders.hueRotate);
  opacity(sliders.opacity);

  ctx.putImageData(imageData, 0, 0);
}
//on canvas load, check if pendingUpdate
async function OnCanvasLoad() {
  if (pendingUpdate) Update();
}

//get image download name and type from user before download
async function getImageDownloadData() {
  var promptSettings = {
    backGroundEffect: "filter: blur(5px);",
    inputs: [
      { type: "Text", title: "Name: ", required: true },
      {
        type: "Dropdown",
        title: "File type",
        required: true,
        options: ["PNG", "JPG"],
      },
    ],
    finishButton: { title: "Download" },
    title: "Download image",
  };
  return new Promise((resolve) => {
    var userResponse = makePrompt(promptSettings);
    console.log("USer responeded: " + userResponse);
    resolve(userResponse);
  });
}
//filter functions
function blur(loops) {
  for (var l = 0; l < loops; l++) {
    for (var o = 0; o < 3; o++) {
      for (var i = o; i < data.length; i += 4) {
        var numbers = [];
        if (
          data[i + 4] != undefined ||
          data[i + 4] != undefined ||
          data[i - img.clientWidth * 4] != undefined ||
          data[i - img.clientWidth * 4] != undefined
        ) {
          if (data[i + 4] != undefined) numbers.push(data[i + 4]);
          if (data[i - 4] != undefined) numbers.push(data[i - 4]);
          if (data[i + img.clientWidth * 4] != undefined)
            numbers.push(data[i + img.clientWidth * 4]);
          if (data[i - img.clientWidth * 4] != undefined)
            numbers.push(data[i - img.clientWidth * 4]);
          if (data[i + img.clientWidth * 4 - 4] != undefined)
            numbers.push(data[i + img.clientWidth * 4 - 4]);
          if (data[i - img.clientWidth * 4 - 4] != undefined)
            numbers.push(data[i - img.clientWidth * 4 - 4]);
          if (data[i + img.clientWidth * 4 + 4] != undefined)
            numbers.push(data[i + img.clientWidth * 4 + 4]);
          if (data[i - img.clientWidth * 4 + 4] != undefined)
            numbers.push(data[i - img.clientWidth * 4 + 4]);
        } else {
          numbers.push(data[i + 4]);
          numbers.push(data[i - 4]);
          numbers.push(data[i + img.clientWidth * 4]);
          numbers.push(data[i - img.clientWidth * 4]);
          numbers.push(data[i + img.clientWidth * 4 - 4]);
          numbers.push(data[i - img.clientWidth * 4 - 4]);
          numbers.push(data[i + img.clientWidth * 4 + 4]);
          numbers.push(data[i - img.clientWidth * 4 + 4]);
        }
        var avg = 0;
        for (var j = 0; j < numbers.length; j++) {
          avg += numbers[j] / numbers.length;
        }
        data[i] = avg;
      }
    }
  }
}
function hueRotate(degrees) {
  for (var i = 0; i < data.length; i += 4) {
    var [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    [data[i], data[i + 1], data[i + 2]] = hslToRgb(h + degrees, s, l);
  }
}
function invert(percent) {
  for (var i = 0; i < data.length; i += 4) {
    data[i] = lerp(data[i], 255 - data[i], percent); // red
    data[i + 1] = lerp(data[i + 1], 255 - data[i + 1], percent); // green
    data[i + 2] = lerp(data[i + 2], 255 - data[i + 2], percent); // blue
  }
}
function grayscale(percent) {
  for (var i = 0; i < data.length; i += 4) {
    var scale =
      (255 *
        Math.sqrt(
          data[i] * data[i] +
            data[i + 1] * data[i + 1] +
            data[i + 2] * data[i + 2]
        )) /
      Math.sqrt(195075);

    data[i] = data[i] + (scale - data[i]) * percent; // red
    data[i + 1] = data[i + 1] + (scale - data[i + 1]) * percent; // green
    data[i + 2] = data[i + 2] + (scale - data[i + 2]) * percent; // blue
  }
}
function opacity(percent) {
  for (var i = 0; i < data.length; i += 4) {
    data[i + 3] *= percent; // blue
  }
}
function brightness(percent) {
  for (var i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] * percent, 255, 0); //(data[i] / 255);
    data[i + 1] = clamp(data[i + 1] * percent, 255, 0);
    data[i + 2] = clamp(data[i + 2] * percent, 255, 0);
  }
}
function saturation(percent) {
  for (var i = 0; i < data.length; i += 4) {
    [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    [data[i], data[i + 1], data[i + 2]] = hslToRgb(h, s * percent, l);
  }
}
function contrast(percent) {
  for (var i = 0; i < data.length; i += 4) {
    [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    [data[i], data[i + 1], data[i + 2]] = hslToRgb(h, s * s * percent, l);
  }
}

//secondary functions, used in main functions
async function makePrompt(settings) {
  var backgroundCover = document.createElement("div");
  backgroundCover.style = settings.backGroundEffect;
  backgroundCover.className = "elementsToOperateOn";
  //put all things in body into div
  while (document.body.childElementCount > 0) {
    backgroundCover.appendChild(document.body.children[0]);
  }

  var outerPrompt = document.createElement("div");
  outerPrompt.className = "promptOuter";

  var promptDiv = document.createElement("div");
  promptDiv.className = "promptInner";

  outerPrompt.appendChild(promptDiv);
  document.body.appendChild(backgroundCover);

  document.body.appendChild(outerPrompt);
  function closePrompt() {
    console.log("Close");
    outerPrompt.parentElement.removeChild(outerPrompt);
    enableInputs(backgroundCover);
    while (backgroundCover.childElementCount > 0) {
      document.body.appendChild(backgroundCover.children[0]);
    }
    backgroundCover.parentElement.removeChild(backgroundCover);
  }
  var exitButton = document.createElement("img");
  exitButton.src = "plus.png";
  exitButton.className = "exitButton";
  exitButton.onclick = closePrompt;
  outerPrompt.insertBefore(exitButton, promptDiv);

  var header = document.createElement("h2");
  header.innerText = settings.title;
  promptDiv.appendChild(header);

  var inputs = [];
  var labels = [];
  settings.inputs.forEach((input) => {
    switch (input.type) {
      case "Text":
        var textdiv = document.createElement("input");
        textdiv.type = "text";
        inputs.push(textdiv);
        break;
      case "Dropdown":
        var dropdown = document.createElement("select");
        input.options.forEach((option) => {
          var optionEle = document.createElement("option");
          optionEle.value = option;
          optionEle.innerText = option;
          dropdown.appendChild(optionEle);
        });
        inputs.push(dropdown);
    }
    var label = document.createElement("label");
    label.for = input[inputs.length - 1];
    label.innerText = input.title;
    labels.push(label);
  });
  inputs.forEach((element, i) => {
    promptDiv.appendChild(labels[i]);
    promptDiv.appendChild(element);
    var linebreak = document.createElement("br");
    promptDiv.appendChild(linebreak);
  });

  var finishButton = document.createElement("button");
  finishButton.className = "finishButton";
  finishButton.innerText = settings.finishButton.title;
  promptDiv.appendChild(finishButton);

  return new Promise((resolve) => {
    finishButton.onclick = (event) => {
      var responses = [];
      inputs.forEach((input, i) => {
        responses.push({ input: settings.inputs[i].title, value: input.value });
      });
      closePrompt();
      resolve(responses);
    };
  });
}
function lerp(a, b, c) {
  return a + (b - a) * c;
}
function hslToRgb(h, s, l) {
  var r, g, b;
  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function rgbToHsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;
  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}
function clamp(number, max, min) {
  number = number > max ? max : number;
  number = number < min ? min : number;
  return number;
}
