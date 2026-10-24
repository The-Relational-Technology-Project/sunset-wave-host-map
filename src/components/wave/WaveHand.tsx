import wave from "@/assets/wave-hand-simple.png";

export const WAVE_SRC = wave;

export function WaveHand({ className = "", alt = "" }: { className?: string; alt?: string }) {
  return <img src={wave} alt={alt} width={256} height={256} className={className} draggable={false} />;
}
