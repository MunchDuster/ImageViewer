const addImageDiv = document.getElementById("addImageDiv");
const originalImage = document.getElementById("originalImage");
const imageDisplay = document.getElementById("imageDisplay");

var brightness = 1;
var contrast = 1;
var blurr = 0;
var saturation = 1;
var sepia = 0;
var dropShadow = 0;
var opacity = 1;
var invert = 0;
var hueRotate = 0;
var sizex = 1;
var oriX = 0;

function setImagePasted() {
	
}
function setImageFile(event) {
	createImageBitmap(event.target.files[0]).then((map) => { oriX = map.width; });
	imageDisplay.src = URL.createObjectURL(event.target.files[0]);
	originalImage.src = imageDisplay.src;  
}
function clearstuff() {
  imageDisplay.src = "noimage.png";
  originalImage.src = "noimage.png";
  document.getElementById("url").value = "";
  document.getElementById("upload").value = "";
}
function Update() {	
	var setTo =
    "brightness(" +
    brightness +
    ")  contrast(" +
    contrast +
		") sepia(" + sepia +
		") hue-rotate(" +
		(hueRotate*360) +
	
	"deg) saturate(" +
    saturation +
    ") invert(" +
    invert +
    ") opacity(" +
    opacity +
    ") blur(" +
    blurr +
    "px)";
	imageDisplay.style.filter = setTo;
	imageDisplay.style.width = originalImage.clientWidth * sizex + "px";
}
function Reset() {
	brightness = 1;
	contrast = 1;
	grayScale = 0;
	blurr = 0;
	grayScale = 0;
	saturation = 1;																																				;
   sepia = 0;
   dropShadow = 0;
   opacity = 1;
	invert = 0;
	sizex = 1;
   hueRotate = 0;
	imageDisplay.style.filter = '';
	imageDisplay.style.width = originalImage.width + "px";
}
function setImageUrl(url) {
	imageDisplay.src = url;
	originalImage.src = imageDisplay.src; 
}