export type ReminderStatus = "completed" | "upcoming" | "missed";

export const games = [
  {
    slug: "memory-match",
    icon: "🧩",
    title: "Memory Match",
    description: "Find and match pairs at your own comfortable pace.",
    focus: "Memory & attention",
  },
  {
    slug: "word-search",
    icon: "🔤",
    title: "Word Search",
    description: "Find familiar words hidden in a simple puzzle.",
    focus: "Language & focus",
  },
  {
    slug: "music-memory",
    icon: "🎵",
    title: "Musical Memory",
    description: "Listen carefully and match familiar sounds.",
    focus: "Listening & memory",
  },
  {
    slug: "odd-one-out",
    icon: "🔍",
    title: "Spot the Odd One",
    description: "Look carefully and find which item is different.",
    focus: "Observation & attention",
  },
  {
    slug: "retro-trivia",
    icon: "💭",
    title: "Retro Trivia",
    description: "Enjoy gentle questions about familiar memories and times.",
    focus: "Recall & memory",
  },
];

export const reminders = [
  {
    id: "1",
    icon: "💊",
    title: "Take morning medicine",
    time: "9:00 AM",
    status: "completed" as ReminderStatus,
  },
  {
    id: "2",
    icon: "💧",
    title: "Drink a glass of water",
    time: "11:00 AM",
    status: "upcoming" as ReminderStatus,
  },
  {
    id: "3",
    icon: "🚶",
    title: "Take a short walk",
    time: "5:00 PM",
    status: "upcoming" as ReminderStatus,
  },
  {
    id: "4",
    icon: "📅",
    title: "Doctor's appointment",
    time: "Tomorrow at 10:30 AM",
    status: "upcoming" as ReminderStatus,
  },
];

export const weeklySummary = {
  gamesPlayed: 12,
  timeActive: "2h 45m",
  remindersCompleted: 18,
};

export const engagementAreas = [
  {
    icon: "🧠",
    label: "Memory",
    note: "You have been enjoying memory activities this week.",
  },
  {
    icon: "🎯",
    label: "Attention",
    note: "You have spent time focusing on puzzles and games.",
  },
  {
    icon: "🗣️",
    label: "Communication",
    note: "You have been using the voice assistant regularly.",
  },
  {
    icon: "🌿",
    label: "Daily Routine",
    note: "You have been keeping up with your reminders.",
  },
];

export const voiceExamples = [
  {
    prompt: "What do I have to do today?",
    reply:
      "Today, you have a few gentle reminders. Your next reminder is to drink a glass of water at 11:00 AM.",
  },
  {
    prompt: "What is my next reminder?",
    reply:
      "Your next reminder is to drink a glass of water at 11:00 AM.",
  },
  {
    prompt: "Can we play a game?",
    reply:
      "Of course. You can choose from Memory Match, Word Search, Musical Memory, Spot the Odd One, or Retro Trivia.",
  },
  {
    prompt: "How was my week?",
    reply:
      "You had a lovely week. You played 12 games, stayed active for 2 hours and 45 minutes, and completed 18 reminders.",
  },
];