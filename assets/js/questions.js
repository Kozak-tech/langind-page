const questions = [
  // A1 - Beginner (Q1-5)
  {
    id: 1,
    level: "A1",
    text: "Choose the correct sentence:",
    options: ["I am happy.", "I is happy.", "I are happy.", "I be happy."],
    correct: 0
  },
  {
    id: 2,
    level: "A1",
    text: "What is the plural of 'child'?",
    options: ["childs", "childes", "children", "childrens"],
    correct: 2
  },
  {
    id: 3,
    level: "A1",
    text: "_____ your name?",
    options: ["What is", "What are", "How is", "Who are"],
    correct: 0
  },
  {
    id: 4,
    level: "A1",
    text: "I _____ a cup of tea every morning.",
    options: ["drinks", "drinking", "drink", "drinked"],
    correct: 2
  },
  {
    id: 5,
    level: "A1",
    text: "She has _____ apple in her bag.",
    options: ["a", "an", "the", "—"],
    correct: 1
  },

  // A2 - Elementary (Q6-10)
  {
    id: 6,
    level: "A2",
    text: "They _____ watching TV when I called.",
    options: ["was", "were", "are", "is"],
    correct: 1
  },
  {
    id: 7,
    level: "A2",
    text: "I _____ to Paris three times.",
    options: ["have been", "have went", "was", "had went"],
    correct: 0
  },
  {
    id: 8,
    level: "A2",
    text: "How _____ milk do you need?",
    options: ["many", "much", "few", "little"],
    correct: 1
  },
  {
    id: 9,
    level: "A2",
    text: "This is _____ book I told you about.",
    options: ["a", "an", "the", "—"],
    correct: 2
  },
  {
    id: 10,
    level: "A2",
    text: "She is _____ than her sister.",
    options: ["more tall", "tallest", "taller", "most tall"],
    correct: 2
  },

  // B1 - Intermediate (Q11-16)
  {
    id: 11,
    level: "B1",
    text: "If it _____ tomorrow, we'll stay at home.",
    options: ["rains", "will rain", "rained", "would rain"],
    correct: 0
  },
  {
    id: 12,
    level: "B1",
    text: "The report _____ by the manager yesterday.",
    options: ["wrote", "was written", "has written", "is writing"],
    correct: 1
  },
  {
    id: 13,
    level: "B1",
    text: "I wish I _____ more time to relax.",
    options: ["have", "had", "will have", "would have"],
    correct: 1
  },
  {
    id: 14,
    level: "B1",
    text: "She suggested _____ a different approach.",
    options: ["to try", "try", "trying", "tried"],
    correct: 2
  },
  {
    id: 15,
    level: "B1",
    text: "By the time he arrived, we _____ dinner.",
    options: ["have finished", "had finished", "finished", "were finishing"],
    correct: 1
  },
  {
    id: 16,
    level: "B1",
    text: "Despite _____ hard, he failed the exam.",
    options: ["studied", "to study", "studying", "having to study"],
    correct: 2
  },

  // B2 - Upper-Intermediate (Q17-22)
  {
    id: 17,
    level: "B2",
    text: "If he _____ the truth earlier, the situation would have been different.",
    options: ["told", "had told", "would tell", "tells"],
    correct: 1
  },
  {
    id: 18,
    level: "B2",
    text: "The new policy _____ significant changes to the system.",
    options: ["brought about", "brought up", "brought off", "brought in for"],
    correct: 0
  },
  {
    id: 19,
    level: "B2",
    text: "_____ he may be clever, he still makes mistakes.",
    options: ["Despite", "Even though", "However", "Although"],
    correct: 1
  },
  {
    id: 20,
    level: "B2",
    text: "She is _____ to have been the first person to climb that mountain.",
    options: ["said", "told", "spoken", "mentioned"],
    correct: 0
  },
  {
    id: 21,
    level: "B2",
    text: "The contract _____ by the time negotiations began.",
    options: ["had already drawn up", "had already been drawn up", "was already drawing up", "already drew up"],
    correct: 1
  },
  {
    id: 22,
    level: "B2",
    text: "I'd rather you _____ smoke in the office.",
    options: ["don't", "won't", "didn't", "wouldn't"],
    correct: 2
  },

  // C1 - Advanced (Q23-27)
  {
    id: 23,
    level: "C1",
    text: "The professor's lecture, _____ lasted three hours, was incredibly insightful.",
    options: ["which", "that", "who", "whose"],
    correct: 0
  },
  {
    id: 24,
    level: "C1",
    text: "Scarcely _____ the building when the alarm went off.",
    options: ["I had entered", "had I entered", "I entered", "did I enter"],
    correct: 1
  },
  {
    id: 25,
    level: "C1",
    text: "The CEO was _____ with embezzling company funds.",
    options: ["charged", "accused", "blamed", "convicted"],
    correct: 0
  },
  {
    id: 26,
    level: "C1",
    text: "His argument was so _____ that even his opponents were impressed.",
    options: ["cogent", "congruent", "salient", "pungent"],
    correct: 0
  },
  {
    id: 27,
    level: "C1",
    text: "The report was _____ in its conclusions, leaving little room for debate.",
    options: ["ambiguous", "equivocal", "categorical", "tentative"],
    correct: 2
  },

  // C2 - Proficiency (Q28-30)
  {
    id: 28,
    level: "C2",
    text: "_____ the merger been approved earlier, the company might have survived the crisis.",
    options: ["If", "Had", "Should", "Were"],
    correct: 1
  },
  {
    id: 29,
    level: "C2",
    text: "The novelist's prose is notable for its _____ — a blend of irony and pathos that defies easy categorisation.",
    options: ["perspicacity", "equanimity", "ineffability", "ambivalence"],
    correct: 3
  },
  {
    id: 30,
    level: "C2",
    text: "Which sentence is grammatically CORRECT?",
    options: [
      "Not until did I read the report I realise the extent of the problem.",
      "Not until I had read the report did I realise the extent of the problem.",
      "Not until I read the report I did realise the extent of the problem.",
      "Not until had I read the report I realised the extent of the problem."
    ],
    correct: 1
  }
];

function calculateLevel(score) {
  if (score <= 4)       return { code: "A1", name: "Beginner",           emoji: "🌱" };
  if (score <= 9)       return { code: "A2", name: "Elementary",         emoji: "🌿" };
  if (score <= 14)      return { code: "B1", name: "Pre-Intermediate",   emoji: "🌟" };
  if (score <= 19)      return { code: "B1+", name: "Intermediate",      emoji: "⭐" };
  if (score <= 23)      return { code: "B2", name: "Upper-Intermediate", emoji: "🔥" };
  if (score <= 27)      return { code: "C1", name: "Advanced",           emoji: "💫" };
  return                       { code: "C2", name: "Proficiency",        emoji: "🏆" };
}
