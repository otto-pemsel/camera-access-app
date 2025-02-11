let video;
let img;
let captureButton, resetButton, switchCameraButton, saveButton, fullscreenButton;
let distortionSlider;
let isFrontCamera = true;
let processing = false; // To show black screen while processing
let imageCaptured = false; // Track if an image has been taken

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  
  // Start Camera
  startCamera();

  // Fullscreen Button
  fullscreenButton = createButton("⛶ Fullscreen");
  fullscreenButton.style("font-size", "20px");
  fullscreenButton.position(width - 160, height / 2 + 120);
  fullscreenButton.mousePressed(enableFullscreen);
  
  // Capture Button - Centered
  captureButton = createButton("📸 Capture");
  captureButton.style("font-size", "22px");
  captureButton.style("padding", "15px");
  captureButton.position(width / 2 - 60, height - 100);
  captureButton.mousePressed(takePhoto);

  // Switch Camera Button
  switchCameraButton = createButton("🔄 Switch Camera");
  switchCameraButton.style("font-size", "18px");
  switchCameraButton.position(width - 160, height / 2);
  switchCameraButton.mousePressed(switchCamera);

  // Reset Button
  resetButton = createButton("🔄 Reset");
  resetButton.style("font-size", "18px");
  resetButton.position(width - 160, height / 2 + 60);
  resetButton.mousePressed(resetPhoto);
  resetButton.hide();

  // Save Button
  saveButton = createButton("💾 Save");
  saveButton.style("font-size", "18px");
  saveButton.position(width - 160, height / 2 + 180);
  saveButton.mousePressed(saveImage);
  saveButton.hide();

  // Distortion Slider
  distortionSlider = createSlider(1, 20, 5); // Min: 1, Max: 20, Default: 5
  distortionSlider.position(width / 2 - 50, height - 50);
}

function draw() {
  if (processing) {
    background(0); // Black screen while processing
  } else if (imageCaptured) {
    image(img, 0, 0, width, height);
  } else {
    image(video, 0, 0, width, height);
  }

  // Draw slider labels
  fill(255);
  textSize(16);
  text("100 yrs", distortionSlider.x - 30, distortionSlider.y + 10);
  text("100,000 yrs", distortionSlider.x + distortionSlider.width + 30, distortionSlider.y + 10);
}

// Start Camera
function startCamera() {
  let constraints = {
    video: {
      facingMode: isFrontCamera ? "user" : "environment"
    },
    audio: false
  };

  video = createCapture(constraints);
  video.size(width, height);
  video.hide();
}

// Switch Camera
function switchCamera() {
  isFrontCamera = !isFrontCamera;
  video.remove();
  startCamera();
}

// Take Photo and Apply Distortion
function takePhoto() {
  processing = true;
  setTimeout(() => {
    img = createImage(video.width, video.height);
    img.copy(video, 0, 0, video.width, video.height, 0, 0, img.width, img.height);
    
    // Apply distortion based on slider value
    let distortionAmount = distortionSlider.value();
    for (let i = 0; i < distortionAmount; i++) {
      distortImage(img);
    }

    processing = false;
    imageCaptured = true;

    captureButton.hide();
    switchCameraButton.hide();
    resetButton.show();
    saveButton.show();
  }, 1000);
}

// Reset Photo
function resetPhoto() {
  imageCaptured = false;
  processing = false;

  captureButton.show();
  switchCameraButton.show();
  resetButton.hide();
  saveButton.hide();
}

// Apply Distortion Effect
function distortImage(img) {
  img.loadPixels();
  let distAmount = 5 + random(0, 10);
  
  for (let i = 0; i < distAmount; i++) {
    let x = floor(random(img.width));
    let shiftAmount = floor(random(10, 20));
    
    for (let y = 0; y < img.height; y++) {
      let pixelIndex = (x + y * img.width) * 4;
      let newIndex = pixelIndex + shiftAmount * 4;
      
      if (newIndex < img.pixels.length) {
        img.pixels[pixelIndex] = img.pixels[newIndex];
        img.pixels[pixelIndex + 1] = img.pixels[newIndex + 1];
        img.pixels[pixelIndex + 2] = img.pixels[newIndex + 2];
      }
    }
  }
  
  img.updatePixels();
}

// Save Image with Unique Name
function saveImage() {
  let timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  saveCanvas(`distorted-${timestamp}`, 'png');
}

// Enable Fullscreen
function enableFullscreen() {
  let elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  }
}

// Ensure Layout Updates on Resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  captureButton.position(width / 2 - 60, height - 100);
  distortionSlider.position(width / 2 - 50, height - 50);
}
