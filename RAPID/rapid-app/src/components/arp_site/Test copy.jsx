import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";

const Test1 = () => {
    const [inputValue, setInputValue] = useState("");
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (file) {
            // Read the existing PDF (your template)
            const existingPdfBytes = await file.arrayBuffer();

            // Load the existing PDF into pdf-lib
            const pdfDoc = await PDFDocument.load(existingPdfBytes);

            // Get the first page
            const page = pdfDoc.getPages()[0];

            // Define the position where you want to add the input text
            const { width, height } = page.getSize();
            page.drawText(inputValue, {
                x: 50, // X-position
                y: height - 165, // Y-position
                size: 12,
            });

            // Save the modified PDF
            const pdfBytes = await pdfDoc.save();

            // Create a Blob from the modified PDF and download it
            const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const link = document.createElement("a");
            link.href = pdfUrl;
            link.download = "modified.pdf";
            link.click();
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                {/* Upload an existing PDF (your template) */}
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                />
                {/* Input field to take text that will be added to the PDF */}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter text to add to PDF"
                />
                <button type="submit">Generate Modified PDF</button>
            </form>
        </div>
    );
};

export default Test1;
