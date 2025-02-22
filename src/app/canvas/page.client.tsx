'use client';

import CanvasBase from './components/canvas';

export default function PageClient({}) {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-200 min-h-screen h-full">
      <CanvasBase />
    </div>
  );
}
