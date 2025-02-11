let video;
let img;
let captureButton, resetButton, switchCameraButton, saveButton;
let distortionSlider;
let isFrontCamera = true;
let processing = false; // To show black screen while processing
let imageCaptured = false; // Track if an image has been taken
let fullscreenButton;
var rotation = 0;
var speed = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // fullscreenButton = createButton("⛶ Fullscreen");
  // fullscreenButton.position(width - 140, height / 2 + 120);
  // fullscreenButton.mousePressed(enableFullscreen);
  
  // // Force landscape mode
  // if (windowWidth < windowHeight) {
  //   alert("Please rotate your phone to landscape mode.");
  // }

  startCamera();

  // Create buttons positioned on the right side
  captureButton = createButton("📸 Capture Photo");
  captureButton.position((width / 2) - 75, height - 80);
  captureButton.size(150, 60); // Increase button size
  captureButton.style("font-size", "24px"); // Increase text size
  captureButton.style("border-radius", "10px"); // Rounded edges
  captureButton.mousePressed(takePhoto);


  switchCameraButton = createButton("🔄 Switch Camera");
  switchCameraButton.position(width - 140, height / 2 + 60);
  switchCameraButton.mousePressed(switchCamera);

  resetButton = createButton("🔄 Reset");
  resetButton.position(width - 140, height / 2 + 60);
  resetButton.mousePressed(resetPhoto);
  resetButton.hide(); // Hide until needed

  saveButton = createButton("💾 Save Image");
  saveButton.position(width - 140, height / 2 + 120);
  saveButton.mousePressed(saveImage);
  saveButton.hide(); // Hide until needed

  // Create a slider to control distortion amount
  distortionSlider = createSlider(1, 50, 5); // Increased the max to 50 for finer control
  distortionSlider.position((width / 2) - 200, height - 120);
  distortionSlider.size(400,20);
}

function draw() {
  if (processing) {
    background(0);
    fill(200);
  noStroke();
  
  push();
  translate(width/2, height/2);
  rotate(rotation);
  scale(20);
  for (var i = 0; i < 5; i++) {
    var angle = i/5 * TWO_PI;
    var x = cos(angle);
    var y = sin(angle);
    circle(x, y, 1);
  }
  pop();
  
  rotation += (sin((frameCount * 0.05) % TWO_PI)) * 0.1;
//^ loading annimation
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
// function takePhoto() {
//   processing = true;
//   setTimeout(() => {
//     img = createImage(video.width, video.height);
//     img.copy(video, 0, 0, video.width, video.height, 0, 0, img.width, img.height);
    
//     // Apply the distortion based on slider value
//     let distortionAmount = distortionSlider.value();
//     for (let i = 0; i < distortionAmount; i++) {
//       distortImage(img);  // Apply a gradual distortion
//     }

//     processing = false;
//     imageCaptured = true;

//     captureButton.hide();
//     switchCameraButton.hide();
//     distortionSlider.hide();
//     resetButton.show(); // Show reset button
//     saveButton.show();  // Show save button
//   }, 10000); // 1-second black screen for processing
//   //,);
// }

// Capture photo and apply distortion
async function takePhoto() {
  processing = true; // Start loading animation
  await processPhoto(); // Process asynchronously
  processing = false; // End loading animation
}

async function processPhoto() {
  img = createImage(video.width, video.height);
  img.copy(video, 0, 0, video.width, video.height, 0, 0, img.width, img.height);

  // Apply the distortion gradually
  let distortionAmount = distortionSlider.value();
  for (let i = 0; i < distortionAmount; i++) {
    await delay(5);  // Tiny delay per step to keep animation running
    distortImage(img);
  }

  imageCaptured = true;
  captureButton.hide();
  switchCameraButton.hide();
  distortionSlider.hide();
  resetButton.show();
  saveButton.show();
}

// Small async delay function (prevents blocking)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Reset to take a new photo
function resetPhoto() {
  imageCaptured = false;
  processing = false;

  captureButton.show();
  switchCameraButton.show();
  distortionSlider.show();
  resetButton.hide();
  saveButton.hide(); // Hide save button when resetting
}

// Gradual distortion effect (simulating digital erosion)
function distortImage(img) {
  img.loadPixels();
  
  // Map the distortion amount to a more controlled value
  let distAmount = map(distortionSlider.value(), 1, 50, 1, 100);  // More subtle at low values

  // Randomly shift columns or rows of pixels to simulate data corruption
  for (let i = 0; i < distAmount; i++) {
    let x = floor(random(img.width)); // Choose a random column
    let shiftAmount = floor(random(10, 20)); // Shift by random amount
    
    for (let y = 0; y < img.height; y++) {
      let pixelIndex = (x + y * img.width) * 4;
      let newIndex = pixelIndex + shiftAmount * 4;  // Shift horizontally by `shiftAmount`
      
      if (newIndex < img.pixels.length) {
        img.pixels[pixelIndex] = img.pixels[newIndex];
        img.pixels[pixelIndex + 1] = img.pixels[newIndex + 1];
        img.pixels[pixelIndex + 2] = img.pixels[newIndex + 2];
      }
    }
  }

  // Apply pixel sorting effect with the distortion amount
  pixelSort(img, distAmount);  // Pass distortion amount to control sorting effect
  
  img.updatePixels();
}

// Pixel sorting effect (with mapping to distortion amount)
function pixelSort(img, distAmount) {
  let rowHeight = distAmount; // Map distortion amount to row height

  for (let y = 0; y < img.height; y += rowHeight) {
    let rowPixels = [];

    // Collect pixels in the row
    for (let x = 0; x < img.width; x++) {
      for (let i = 0; i < rowHeight; i++) {
        let index = (x + (y + i) * img.width) * 4;

        if (index + 3 < img.pixels.length) { // Ensure we don't go out of bounds
          rowPixels.push({
            index,
            r: img.pixels[index],
            g: img.pixels[index + 1],
            b: img.pixels[index + 2]
          });
        }
      }
    }

    // Sort pixels by brightness (sum of r, g, b)
    rowPixels.sort((a, b) => (a.r + a.g + a.b) - (b.r + b.g + b.b));

    // Set the sorted pixels back into the image
    for (let x = 0; x < img.width; x++) {
      for (let i = 0; i < rowHeight; i++) {
        let index = (x + (y + i) * img.width) * 4;
        let pixel = rowPixels[x * rowHeight + i];
        
        if (pixel) {  // Check if pixel exists
          img.pixels[index] = pixel.r;
          img.pixels[index + 1] = pixel.g;
          img.pixels[index + 2] = pixel.b;
        }
      }
    }
  }

  img.updatePixels();

}
//saving the image
function saveImage() {
  let timestamp = int(millis()); // Get a unique timestamp
  saveCanvas('distorted_' + timestamp, 'png'); // Append timestamp to filename
}


// Enable fullscreen mode
function enableFullscreen() {
  let elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  }
}
