import Image from "next/image";
import { getSlot, isReady, type ImageSlot } from "@/lib/images";
import { asset } from "@/lib/site";
import CopyButton from "./CopyButton";

/**
 * Картинка сайту або, поки її немає, заглушка з підписом.
 * `detail`: "full" — показати опис для генерації й кнопку копіювання,
 * "label" — лише назву (для дрібних іконок; повний опис є на /zaglushky).
 */
export default function SlotImage({
  id,
  slot: given,
  alt,
  className = "",
  detail = "label",
  sizes,
  priority,
}: {
  id: string;
  /** Готовий опис картинки, якої немає в загальному реєстрі (напр., обкладинки статей блогу). */
  slot?: ImageSlot;
  alt: string;
  className?: string;
  detail?: "full" | "label" | "none";
  sizes?: string;
  priority?: boolean;
}) {
  const slot = given ?? getSlot(id);
  if (isReady(slot)) {
    return (
      <Image
        src={asset(slot.file)}
        alt={alt}
        width={slot.width}
        height={slot.height}
        className={`slot-img ${className}`}
        sizes={sizes}
        priority={priority}
      />
    );
  }
  return (
    <div
      className={`slot-ph ${className} is-${detail}`}
      style={{ aspectRatio: `${slot.width} / ${slot.height}` }}
      role="img"
      aria-label={alt}
    >
      {detail !== "none" && (
        <div className="slot-ph-body">
          <span className="slot-ph-tag">Заглушка · {slot.file}</span>
          <strong>{slot.title}</strong>
          {detail === "full" && (
            <>
              <p className="slot-ph-prompt">{slot.prompt}</p>
              <CopyButton text={slot.prompt} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
