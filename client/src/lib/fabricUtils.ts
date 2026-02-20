import { Rect, Shadow, Textbox, Group } from 'fabric';

// Miro-style Sticky Note Colors (Premium Pastels)
export const StickyNoteColors = [
    { name: 'Yellow', bg: '#ffef9e', text: '#3f3a1d' }, // Classic Miro Yellow
    { name: 'Green', bg: '#cbf0c0', text: '#213a1d' },  // Mint Green
    { name: 'Blue', bg: '#b3dffc', text: '#152c3f' },   // Light Blue
    { name: 'Pink', bg: '#fccce3', text: '#421c2f' },   // Soft Pink
    { name: 'Purple', bg: '#dcd6f7', text: '#282342' }, // Lavender
];

export const createStickyNote = (pointer: { x: number; y: number }, colorIndex = 0) => {
    console.log("createStickyNote (Miro-Style) called");
    const id = Math.random().toString(36).substr(2, 9);
    const color = StickyNoteColors[colorIndex];
    const width = 200;
    const height = 200;

    // 1. Background Shape (Simple, Clean, Shadow)
    const rect = new Rect({
        width,
        height,
        fill: color.bg,
        rx: 3,
        ry: 3,
        shadow: new Shadow({
            color: 'rgba(0,0,0,0.15)',
            blur: 10,
            offsetY: 4,
            offsetX: 0
        }),
        originX: 'center',
        originY: 'center',
        // Lock interaction
        selectable: false, // Background not independently selectable
        hoverCursor: 'default',
    });

    // 2. Content
    const text = new Textbox('Type something...', {
        fontFamily: 'Inter, sans-serif',
        fontSize: 18,
        fill: color.text,
        width: width - 40, // Increased padding
        splitByGrapheme: true, // Force wrap anywhere (prevents overflow)
        breakWords: true, // Redundant but safe
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        cursorColor: '#333',
        lineHeight: 1.2,
        // Lock interaction (Can't move independently inside group)
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false, // No handles
        hoverCursor: 'text',
    });

    // Auto-Scaling Logic (Miro-style)
    text.on('changed', () => {
        const maxHeight = height - 40; // Padding
        // Shrink if too big
        while (text.height! > maxHeight && text.fontSize! > 7) {
            text.set('fontSize', text.fontSize! - 1);
            // @ts-ignore
            text.initDimensions(); // Recalculate height
        }
        // Expand if space available (Simplistic approach: reset if empty-ish?)
        // Let's avoiding jitter by only shrinking for now, or resetting when text is short
        if (text.textLines.length < 2 && text.text!.length < 20 && text.fontSize! < 18) {
            text.set('fontSize', 18); // Reset to default if cleared
            // @ts-ignore
            text.initDimensions();
        }
    });

    // Group
    const group = new Group([rect, text], {
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        subTargetCheck: true, // Allow selecting text
        interactive: true,
        // @ts-ignore
        id,
        // @ts-ignore
        type: 'sticky-note',
        // @ts-ignore
        colorIndex,

        // Premium Controls (Miro Style)
        transparentCorners: false,
        cornerColor: '#ffffff',
        cornerStrokeColor: '#3b82f6', // blue-500
        borderColor: '#3b82f6',
        cornerSize: 10,
        padding: 0,
        cornerStyle: 'circle',
        borderDashArray: [4, 4],

        // Interaction
        lockUniScaling: true, // Prevent distortion
        lockRotation: false,
    });

    // Custom Control Handling (Optional: Hide middle controls if desired)
    // fabric.Object.prototype.controls...
    // But per-instance:
    group.setControlsVisibility({
        mt: false, mb: false, ml: false, mr: false, // Hide middle handles
        tl: true, tr: true, bl: true, br: true, // Show corner handles
        mtr: true // Show rotation
    });

    return group;
};
