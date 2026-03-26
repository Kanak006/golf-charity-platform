"use client";
import { useState } from "react";

export default function ScoreEntry() {
  const [score, setScore] = useState("");

  const handleSubmit = async () => {
    await fetch("/api/scores", {
      method: "POST",
      body: JSON.stringify({
        user_id: "test-user", // replace later with auth user
        score: Number(score),
      }),
    });

    alert("Score added!");
    setScore("");
  };

  return (
    <div className="p-4">
      <input
        value={score}
        onChange={(e) => setScore(e.target.value)}
        placeholder="Enter score"
        className="border p-2"
      />
      <button onClick={handleSubmit} className="ml-2 bg-green-500 px-4 py-2">
        Add Score
      </button>
    </div>
  );
}