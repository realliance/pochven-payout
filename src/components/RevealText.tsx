import { useEffect, useMemo, useState } from "react";

interface RevealTextProps {
  text: string;
  interval?: number;
  initialDelay?: number;
  className?: string;
}

export function RevealText({ text, interval, initialDelay, className }: RevealTextProps) {
  const [cachedText] = useState(text);
  const [decodedList, setDecodedList] = useState<boolean[]>(Array(text.length).fill(false))
  const [cachedInverval] = useState(interval ?? 75);

  useEffect(() => {
    if (decodedList.includes(false)) {
      const allFalse = decodedList.find((val) => val) === undefined;
      const delay = allFalse ? (initialDelay ?? 1000) + cachedInverval : cachedInverval;
      const id = setTimeout(() => {
          const newDecodedList = [...decodedList];
          const toDecode = newDecodedList.map((val, index) => [val, index]).filter(([val]) => !val);

          const [_, index] = toDecode[Math.floor(Math.random() * toDecode.length)];
          newDecodedList[index as number] = true;

          setDecodedList(newDecodedList);
      }, delay);

      return () => {
        clearTimeout(id);
      }
    }
  }, [decodedList]);

  const decodingText = useMemo(() => cachedText.split('').map((char, index) => <span key={index} className={`${decodedList[index] ? "mono-one" : "triangle"}`}>{char}</span>), [decodedList, cachedText]);

  return (
    <span>
      <p className="sr-only">{cachedText}</p>
      <p aria-hidden="true" className={className}>
        {decodingText}
      </p>
    </span>
  )
}
