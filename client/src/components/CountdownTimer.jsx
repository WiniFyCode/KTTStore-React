import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(targetDate).getTime() - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1">
      <div className="bg-red-600 text-white px-2 py-1 rounded">
        <span className="font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
      </div>
      <span className="text-red-600 font-bold">:</span>
      <div className="bg-red-600 text-white px-2 py-1 rounded">
        <span className="font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
      </div>
      <span className="text-red-600 font-bold">:</span>
      <div className="bg-red-600 text-white px-2 py-1 rounded">
        <span className="font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
