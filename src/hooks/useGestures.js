import { useState, useRef, useCallback } from 'react';

export const useGestures = ({ onSingleTap, onDoubleTap, onLongPress, onTripleTap }) => {
    const [tapCount, setTapCount] = useState(0);
    const timerRef = useRef(null);
    const longPressTimerRef = useRef(null);
    const startTimeRef = useRef(0);
    const isLongPressRef = useRef(false);

    const handleStart = useCallback((e) => {
        // Prevent default to avoid ghost clicks if needed, but be careful with scrolling
        // e.preventDefault(); 
        startTimeRef.current = Date.now();
        isLongPressRef.current = false;

        longPressTimerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            if (onLongPress) onLongPress();
        }, 600); // 600ms for long press
    }, [onLongPress]);

    const handleEnd = useCallback((e) => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
        }

        if (isLongPressRef.current) {
            // Already handled as long press
            return;
        }

        const duration = Date.now() - startTimeRef.current;
        console.log("Gesture duration:", duration);
        if (duration > 600) return; // Should have been caught by timer, but just in case

        // It's a tap
        setTapCount(prev => {
            const newCount = prev + 1;
            console.log("Tap count:", newCount);

            if (timerRef.current) clearTimeout(timerRef.current);

            if (newCount === 3) {
                // Triple tap
                console.log("Triple tap detected");
                if (onTripleTap) onTripleTap();
                return 0; // Reset
            }

            timerRef.current = setTimeout(() => {
                if (newCount === 1) {
                    console.log("Single tap confirmed");
                    if (onSingleTap) onSingleTap();
                } else if (newCount === 2) {
                    console.log("Double tap confirmed");
                    if (onDoubleTap) onDoubleTap();
                }
                setTapCount(0); // Reset after timeout
            }, 300); // 300ms wait window

            return newCount;
        });
    }, [onSingleTap, onDoubleTap, onTripleTap]);

    return {
        onTouchStart: handleStart,
        onTouchEnd: handleEnd,
        onMouseDown: handleStart,
        onMouseUp: handleEnd
    };
};
