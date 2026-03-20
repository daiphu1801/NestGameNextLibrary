import { useEffect, useRef } from 'react';

// Mặc định map tay cầm sang cấu hình Player 1 của Naruto vs Bleach
// D-Pad / Left Stick -> W, A, S, D
// A -> J (Đánh)
// B -> K (Nhảy)
// X -> U (Chiêu 1)
// Y -> I (Chiêu 2)
// LB -> O (Gọi hỗ trợ)
// RB -> L (Lướt)

const BUTTON_MAPPING: Record<number, string> = {
  0: 'j', // A
  1: 'k', // B
  2: 'u', // X
  3: 'i', // Y
  4: 'o', // LB
  5: 'l', // RB
  12: 'w', // D-Pad Up
  13: 's', // D-Pad Down
  14: 'a', // D-Pad Left
  15: 'd', // D-Pad Right
};

export function useGamepadToKeyboard(enabled: boolean = true) {
  const keysPressed = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    if (!enabled) return;
    
    let animationFrameId: number;
    let prevButtons = new Array(20).fill(false);
    
    // Axis thresholds for left stick
    let prevLeftStick = { up: false, down: false, left: false, right: false };

    const dispatchKeyEvent = (key: string, type: 'keydown' | 'keyup') => {
      // Gửi event tới window để Ruffle có thể bắt được
      const event = new KeyboardEvent(type, {
        key,
        code: `Key${key.toUpperCase()}`,
        bubbles: true,
        cancelable: true,
      });
      window.dispatchEvent(event);
    };

    const updateGamepad = () => {
      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = gamepads[0]; // Hỗ trợ Player 1 cho webgame
      
      if (gp) {
        // Buttons
        gp.buttons.forEach((b, index) => {
          const pressed = b.pressed;
          if (pressed !== prevButtons[index]) {
            const mappedKey = BUTTON_MAPPING[index];
            if (mappedKey) {
              if (pressed) {
                keysPressed.current.add(mappedKey);
                dispatchKeyEvent(mappedKey, 'keydown');
              } else {
                keysPressed.current.delete(mappedKey);
                dispatchKeyEvent(mappedKey, 'keyup');
              }
            }
            prevButtons[index] = pressed;
          }
        });

        // Axes (Left Stick - axes 0 and 1)
        const THRESHOLD = 0.5;
        const currentLeftStick = {
          up: gp.axes[1] < -THRESHOLD,
          down: gp.axes[1] > THRESHOLD,
          left: gp.axes[0] < -THRESHOLD,
          right: gp.axes[0] > THRESHOLD,
        };

        const checkAxis = (prev: boolean, curr: boolean, key: string) => {
          if (curr !== prev) {
            if (curr) {
              keysPressed.current.add(key);
              dispatchKeyEvent(key, 'keydown');
            } else {
              keysPressed.current.delete(key);
              dispatchKeyEvent(key, 'keyup');
            }
          }
        };

        checkAxis(prevLeftStick.up, currentLeftStick.up, 'w');
        checkAxis(prevLeftStick.down, currentLeftStick.down, 's');
        checkAxis(prevLeftStick.left, currentLeftStick.left, 'a');
        checkAxis(prevLeftStick.right, currentLeftStick.right, 'd');
        
        prevLeftStick = currentLeftStick;
      }
      
      animationFrameId = requestAnimationFrame(updateGamepad);
    };

    updateGamepad();

    return () => {
      cancelAnimationFrame(animationFrameId);
      // Release all pressed keys
      keysPressed.current.forEach(key => {
        dispatchKeyEvent(key, 'keyup');
      });
      keysPressed.current.clear();
    };
  }, [enabled]);
}
