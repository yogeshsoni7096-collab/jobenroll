import { useState, useEffect } from 'react';

export function useTypingTest(text: string, timeLimit: number) {
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      calculateStats();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const calculateStats = () => {
    const words = userInput.trim().split(/\s+/).length;
    const timeSpent = (timeLimit - timeLeft) / 60;
    setWpm(Math.round(words / (timeSpent || 1)));

    let correctChars = 0;
    const minLen = Math.min(userInput.length, text.length);
    for (let i = 0; i < minLen; i++) {
        if (userInput[i] === text[i]) correctChars++;
    }
    setAccuracy(Math.round((correctChars / (userInput.length || 1)) * 100));
  };

  const startTest = () => {
    setIsActive(true);
    setUserInput('');
    setTimeLeft(timeLimit);
  };

  return { userInput, setUserInput, timeLeft, isActive, startTest, wpm, accuracy };
}
