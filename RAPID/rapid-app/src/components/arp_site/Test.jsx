import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";

// Helper function to load image as a byte array
const loadImage = async (imageUrl) => {
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
};

const Test = () => {
    const [firstName, setFirstName] = useState("");
    const [secondName, setSecondName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [suffix, setSuffix] = useState("");
    const [pdfUrl, setPdfUrl] = useState(null);

    const handleFirstNameChange = (e) => setFirstName(e.target.value);
    const handleSecondNameChange = (e) => setSecondName(e.target.value);
    const handleMiddleNameChange = (e) => setMiddleName(e.target.value);
    const handleSuffixChange = (e) => setSuffix(e.target.value);

    const generatePdf = async () => {
        try {
            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();

            // Load the first background image (PCR-Page1.png)
            const imageBytes1 = await loadImage('PCR-Page1.png');
            const image1 = await pdfDoc.embedPng(imageBytes1);

            // Get the dimensions of the first image
            const { width, height } = image1.scale(1); // Original size

            // Define the margin
            const margin = 50;

            // Adjust the image dimensions to leave room for the margin
            const imageWidth = width - 2 * margin;
            const imageHeight = height - 2 * margin;

            // Create the first page with the background image
            const page1 = pdfDoc.addPage([width, height]);
            page1.drawImage(image1, { x: margin, y: margin, width: imageWidth, height: imageHeight });

            // Draw the first name and second name on the first page (only page 1 has this)
            /* page1.drawText(`${firstName}`, { x: 380, y: height - 450, size: 30 }); */
            const maxWidth = 300;  // Define the max width for the text box

            // Function to calculate the text width based on font size
            function getTextWidth(text, fontSize) {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                context.font = `${fontSize}px Arial`;  // Define the font
                return context.measureText(text).width;
            }

            // Initial font size for both firstName and secondName
            let fnameFontSize = 30;
            let lnameFontSize = 30;
            let mnameFontSize = 30;
            let suffixFontSize = 30;

            // Adjust firstName font size to fit within maxWidth
            while (getTextWidth(`${firstName}`, fnameFontSize) > maxWidth) {
                fnameFontSize -= 1;  // Decrease font size until text fits
            }

            // Adjust secondName font size to fit within maxWidth
            while (getTextWidth(`${secondName}`, lnameFontSize) > maxWidth) {
                lnameFontSize -= 1;  // Decrease font size until text fits
            }

            // Adjust secondName font size to fit within maxWidth
            while (getTextWidth(`${middleName}`, mnameFontSize) > maxWidth) {
                mnameFontSize -= 1;  // Decrease font size until text fits
            }

            // Adjust secondName font size to fit within maxWidth
            while (getTextWidth(`${suffix}`, suffixFontSize) > maxWidth) {
                suffixFontSize -= 1;  // Decrease font size until text fits
            }

            page1.drawText(`${secondName}`, { x: 70, y: height - 445, size: fnameFontSize });
            page1.drawText(`${firstName}`, { x: 370, y: height - 445, size: lnameFontSize });
            page1.drawText(`${middleName}`, { x: 665, y: height - 445, size: mnameFontSize });
            page1.drawText(`${suffix}`, { x: 950, y: height - 445, size: suffixFontSize });



            // Load the second background image (PCR-Page2.png)
            const imageBytes2 = await loadImage('PCR-Page2.png');
            const image2 = await pdfDoc.embedPng(imageBytes2);

            // Create the second page with the second background image (no input fields on page 2)
            const page2 = pdfDoc.addPage([width, height]);
            page2.drawImage(image2, { x: margin, y: margin, width: imageWidth, height: imageHeight });

            // Optionally draw the names again or leave it blank
            // page2.drawText(`First Name: ${firstName}`, { x: 50, y: height - 100, size: 18 });
            // page2.drawText(`Second Name: ${secondName}`, { x: 50, y: height - 150, size: 18 });

            // Save the PDF to a byte array
            const pdfBytes = await pdfDoc.save();

            // Convert the byte array to a Blob for download
            const blob = new Blob([pdfBytes], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            // Set the URL to trigger the download
            setPdfUrl(url);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };

    return (
        <div>
            <h1>Generate PDF with Form Data</h1>

            {/* Form inputs for the first page */}
            <div>
                <label>
                    First Name:
                    <input
                        type="text"
                        value={firstName}
                        onChange={handleFirstNameChange}
                        placeholder="Enter First Name"
                    />
                </label>
            </div>

            <div>
                <label>
                    Second Name:
                    <input
                        type="text"
                        value={secondName}
                        onChange={handleSecondNameChange}
                        placeholder="Enter Second Name"
                    />
                </label>
            </div>

            <div>
                <label>
                    Middle Name:
                    <input
                        type="text"
                        value={middleName}
                        onChange={handleMiddleNameChange}
                        placeholder="Enter Middle Name"
                    />
                </label>
            </div>

            <div>
                <label>
                    Suffix:
                    <input
                        type="text"
                        value={suffix}
                        onChange={handleSuffixChange}
                        placeholder="Enter Suffix"
                    />
                </label>
            </div>

            {/* Button to generate PDF */}
            <button onClick={generatePdf} disabled={!firstName || !secondName}>
                Generate PDF
            </button>

            {/* PDF Download link */}
            {pdfUrl && (
                <a href={pdfUrl} download="generated.pdf">
                    Download PDF
                </a>
            )}
        </div>
    );
};

export default Test;
