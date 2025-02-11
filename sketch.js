let video;
let img;
let captureButton, resetButton, switchCameraButton;
let isFrontCamera = true;
let processing = false; // To show black screen while processing
let imageCaptured = false; // Track if an image has been taken
let fullscreenButton;


function setup() {
 createCanvas(windowWidth, windowHeight);

  fullscreenButton = createButton("⛶ Fullscreen");
  fullscreenButton.position(width - 140, height / 2 + 120);
  fullscreenButton.mousePressed(enableFullscreen);
  
  // Force landscape mode
  if (windowWidth < windowHeight) {
    alert("Please rotate your phone to landscape mode.");
  }

  startCamera();

  // Create buttons positioned on the right side
  captureButton = createButton("📸 Capture Photo");
  captureButton.position(width - 140, height / 2 - 60);
  captureButton.mousePressed(takePhoto);

  switchCameraButton = createButton("🔄 Switch Camera");
  switchCameraButton.position(width - 140, height / 2);
  switchCameraButton.mousePressed(switchCamera);

  resetButton = createButton("🔄 Reset");
  resetButton.position(width - 140, height / 2 + 60);
  resetButton.mousePressed(resetPhoto);
  resetButton.hide(); // Hide until needed
}

function draw() {
  if (processing) {
    background(0); // Black screen while processing
  } else if (imageCaptured) {
    image(img, 0, 0, width, height);
  } else {
    image(video, 0, 0, width, height);
  }
}

// Start camera with video-only (no mic)
function startCamera() {
  let constraints = {
    video: {
      facingMode: isFrontCamera ? "user" : "environment"
    },
    audio: false // Disable microphone
  };

  video = createCapture(constraints);
  video.size(width, height);
  video.hide();
}

// Switch between front and back camera
function switchCamera() {
  isFrontCamera = !isFrontCamera;
  video.remove();
  startCamera();
}

// Capture photo and apply distortion
function takePhoto() {
  processing = true;
  setTimeout(() => {
    img = createImage(video.width, video.height);
    img.copy(video, 0, 0, video.width, video.height, 0, 0, img.width, img.height);
    
    // Apply the distortion multiple times for stronger effect
    for (let i = 0; i < 20; i++) {
      sortPixels(img);
    }

    processing = false;
    imageCaptured = true;

    captureButton.hide();
    switchCameraButton.hide();
    resetButton.show(); // Show reset button
  }, 1000); // 1-second black screen for processing
}

// Reset to take a new photo
function resetPhoto() {
  imageCaptured = false;
  processing = false;

  captureButton.show();
  switchCameraButton.show();
  resetButton.hide();
}

// Sort pixels with a stronger distortion effect
function sortPixels(img) {
  img.loadPixels();
  
  for (let i = 0; i < img.pixels.length / 20; i++) { // Increased effect
    let x = floor(random(img.width));
    let y = floor(random(img.height - 1));

    let colorOne = img.get(x, y);
    let colorTwo = img.get(x, y + 1);

    let totalOne = red(colorOne) + green(colorOne) + blue(colorTwo);
    let totalTwo = red(colorTwo) + green(colorTwo) + blue(colorTwo);

    if (totalOne < totalTwo) {
      img.set(x, y, colorTwo);
      img.set(x, y + 1, colorOne);
    }
  }
  
  img.updatePixels();
}

// // Enable fullscreen on user tap
// function touchStarted() {
//   let elem = document.documentElement; // Get the full webpage
//   if (elem.requestFullscreen) {
//     elem.requestFullscreen();
//   } else if (elem.webkitRequestFullscreen) { // For Safari
//     elem.webkitRequestFullscreen();
//   }
// }

function enableFullscreen() {
  let elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  }
}