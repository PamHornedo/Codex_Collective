import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Book } from "../types";
import { BookCard } from "./BookCard";

interface SortableBookProps {
  book: Book;
  onClick?: () => void;
}

export function SortableBook({ book, onClick }: SortableBookProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: book.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div onClick={onClick} className="cursor-move touch-none">
        <BookCard book={book} isDraggable />
      </div>
    </div>
  );
}
