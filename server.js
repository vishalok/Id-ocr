const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const sharp = require('sharp');

// Define the path to the input image
const imagePath = './images/image.png';

// Define the types of IDs that we can recognize
const idTypes = ['panCard', 'aadhar', 'drivingLicense'];

// Define a function to recognize the ID type based on the image content
function recognizeIdType(text) {
  if (text.includes('Permanent Account Number')) {
    return 'panCard';
  } else if (text.includes('AADHAAR')) {
    return 'aadhar';
  } else if (text.includes('Driving Licence')) {
    return 'drivingLicense';
  } else {
    return null;
  }
}

// Load the image using Jimp
Jimp.read(imagePath)
  .then((image) => {
    // Resize the image to improve OCR accuracy
    return image.resize(800, Jimp.AUTO);
  })
  .then((image) => {
    // Convert the image to grayscale to improve OCR accuracy
    return image.greyscale();
  })
  .then((image) => {
    // Convert the image to a buffer to pass to Tesseract.js
    return image.getBufferAsync(Jimp.MIME_JPEG);
  })
  .then((buffer) => {
    // Pass the image buffer to Tesseract.js to extract text
    return Tesseract.recognize(buffer);
  })
  .then((result) => {
    // Extract the recognized text from the Tesseract.js result
    const text = result.data.text;
    
    // Recognize the ID type based on the text
    const idType = recognizeIdType(text);
    
    if (idType === null) {
      console.log('Error: unrecognized ID type');
      return;
    }
    
    // Extract the relevant information from the text using regular expressions
    const idNumber = text.match(/([A-Z]{5}[0-9]{4}[A-Z])/)[1];
    const nameMatch = /([A-Z]+\s+){3,}[A-Z]+/;
    const name = text.match(nameMatch)[0];
    
    const fatherNameMatch = text.match(/([A-Z]+\s+){3,}[A-Z]+/);
    const fatherName = fatherNameMatch ? fatherNameMatch[1] : null;
    const dobMatch = text.match(/\b\d{1,2}[/-]\d{1,2}[/-]\d{4}\b/);
    const dob = dobMatch ? dobMatch[0] : null;
    
    // Construct the output JSON
    const output = {
      idType: idType,
      idNumber: idNumber,
      info: {
        name: name,
        fatherName: fatherName,
        dob: dob
      }
    };
    
    console.log(output);
  })
  .catch((err) => {
    console.log('Error :',err);
  });