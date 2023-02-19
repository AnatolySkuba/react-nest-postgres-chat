import { useEffect, useRef } from "react";

export const useCanvas = (callback: { ([_canvas, ctx]: any): void; (arg0: any[]): void }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas: any = canvasRef.current;
        const ctx = canvas.getContext("2d");
        callback([canvas, ctx]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return canvasRef;
};
