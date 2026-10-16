'use client';

import { useEffect } from 'react';

/**
 * Sayt xavfsizligi va himoyasi:
 * 1. Sichqonchaning o'ng tugmasi (Context Menu)ni o'chirish (3-rasm talabi)
 * 2. Matnlarni tortib belgilash va nusxalash (Copy)ni o'chirish (1 va 2-rasm talabi)
 * 3. Inspect, F12, Ctrl+U, Ctrl+S tugmalarini bloklash
 */
export default function SecurityProtection() {
  useEffect(() => {
    // 1. Sichqonchaning o'ng tugmasi (Context Menu)ni butunlay o'chirish
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Sahifadan matnlarni ko'chirish (Copy / Cut)ni o'chirish
    const handleCopyOrCut = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return; // Input va textareada foydalanuvchi o'zi yozgan narsasini copy qila oladi
      }
      e.preventDefault();
      return false;
    };

    // 3. Sahifada matn va rasmlarni tortish (Drag)ni o'chirish
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
      return false;
    };

    // 4. Inspect va kodni ochuvchi tugmalar kombinatsiyasi (F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Hodisalarni butun sahifa (document va window) darajasida ulash
    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('copy', handleCopyOrCut, { capture: true });
    document.addEventListener('cut', handleCopyOrCut, { capture: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('copy', handleCopyOrCut, { capture: true });
      document.removeEventListener('cut', handleCopyOrCut, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

  return null;
}
