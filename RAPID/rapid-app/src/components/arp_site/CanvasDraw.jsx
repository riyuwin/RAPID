import { useEffect, useRef, useState } from "react";
import { db } from "./firebase"; // Import Firestore config
import { doc, setDoc, getDoc } from "firebase/firestore";

const CanvasDraw = () => {
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [mode, setMode] = useState("draw"); // "draw" or "erase"
    const [drawings, setDrawings] = useState([]); // Store drawing data

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        setCtx(context);

        // Load image onto canvas
        const img = new Image();
        img.src = "/assets/img/character_model.png"; // Adjust your path
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            // Load saved drawings from Firestore
            loadDrawing(context);
        };
    }, []);

    // Start drawing when mouse is pressed
    const handleMouseDown = (e) => {
        if (!ctx) return;
        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    };

    // Draw or erase based on mode
    const handleMouseMove = (e) => {
        if (!ctx || !isDrawing) return;

        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;
        const color = mode === "draw" ? "red" : "white";
        const size = mode === "draw" ? 3 : 20;

        ctx.lineTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.stroke();

        // Store drawing data
        setDrawings((prev) => [...prev, { x, y, color, size }]);
    };

    // Stop drawing when mouse is released
    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    // Switch mode between Draw and Erase
    const toggleMode = () => {
        setMode((prevMode) => (prevMode === "draw" ? "erase" : "draw"));
    };

    // Save drawing data to Firestore
    const saveDrawing = async () => {
        await setDoc(doc(db, "drawings", "user1"), { drawings });
        alert("Drawing saved!");
    };

    // Load drawing data from Firestore
    const loadDrawing = async (context) => {
        const docSnap = await getDoc(doc(db, "drawings", "user1"));
        if (docSnap.exists()) {
            const savedDrawings = docSnap.data().drawings || [];
            savedDrawings.forEach(({ x, y, color, size }) => {
                context.lineTo(x, y);
                context.strokeStyle = color;
                context.lineWidth = size;
                context.stroke();
            });
        }
    };

    return (
        <div>
            <button onClick={toggleMode} style={{ margin: "5px" }}>
                {mode === "draw" ? "Switch to Erase" : "Switch to Draw"}
            </button>
            <button onClick={saveDrawing} style={{ margin: "5px" }}>
                Save to Firestore
            </button>
            <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{ border: "1px solid black", cursor: "crosshair" }}
            />
        </div>
    );
};

export default CanvasDraw;
