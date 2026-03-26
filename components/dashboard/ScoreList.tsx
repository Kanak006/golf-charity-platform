"use client";
import { useEffect, useState } from "react";

export default function ScoreList() {
  const [scores, setScores] = useState<any[]>([]);

  const fetchScores = async () => {
    const res = await fetch("/api/scores");
      const data = await res.json();
      console.log("Scores:", data);
    setScores(data);
  };

  useEffect(() => {
    fetchScores();
  }, []);

  return (
    <div>
      {scores.map((s, i) => (
        <div key={i}>{s.score}</div>
      ))}
    </div>
  );
}