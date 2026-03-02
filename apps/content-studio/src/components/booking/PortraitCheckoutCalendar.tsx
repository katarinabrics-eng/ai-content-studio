"use client";

import BookingCalendar from "./BookingCalendar";

export default function PortraitCheckoutCalendar() {
  return (
    <BookingCalendar
      theme="light"
      onConfirm={(date) => {
        window.location.href = `/api/checkout?type=portrait&date=${encodeURIComponent(date)}`;
      }}
    />
  );
}
