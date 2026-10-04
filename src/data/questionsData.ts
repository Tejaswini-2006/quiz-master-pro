export interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: "default-1",
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language"
    ],
    correct_answer: 0,
    category: "Web Development",
    difficulty: "Easy"
  },
  {
    id: "default-2",
    question: "Which JavaScript keyword is used to declare a block-scoped constant variable?",
    options: ["var", "let", "const", "static"],
    correct_answer: 2,
    category: "Web Development",
    difficulty: "Easy"
  },
  {
    id: "default-3",
    question: "What is the primary function of the React useEffect hook?",
    options: [
      "To render HTML elements",
      "To perform side effects in functional components",
      "To manage global state",
      "To define component prop types"
    ],
    correct_answer: 1,
    category: "Web Development",
    difficulty: "Medium"
  },
  {
    id: "default-4",
    question: "Which CSS property is used to change the background color of an element?",
    options: ["color", "bg-color", "background-color", "canvas-color"],
    correct_answer: 2,
    category: "Web Development",
    difficulty: "Easy"
  },
  {
    id: "default-5",
    question: "What is the output of `typeof NaN` in JavaScript?",
    options: ["'number'", "'nan'", "'undefined'", "'object'"],
    correct_answer: 0,
    category: "Web Development",
    difficulty: "Medium"
  },
  {
    id: "default-6",
    question: "Which planet in our solar system is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct_answer: 1,
    category: "Science",
    difficulty: "Easy"
  },
  {
    id: "default-7",
    question: "What is the chemical symbol for Gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correct_answer: 2,
    category: "Science",
    difficulty: "Medium"
  },
  {
    id: "default-8",
    question: "What gas do plants absorb during photosynthesis?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correct_answer: 1,
    category: "Science",
    difficulty: "Easy"
  },
  {
    id: "default-9",
    question: "Who developed the theory of general relativity?",
    options: ["Isaac Newton", "Albert Einstein", "Nikola Tesla", "Niels Bohr"],
    correct_answer: 1,
    category: "Science",
    difficulty: "Medium"
  },
  {
    id: "default-10",
    question: "What is the speed of light in vacuum approximately?",
    options: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "500,000 km/s"],
    correct_answer: 0,
    category: "Science",
    difficulty: "Hard"
  },
  {
    id: "default-11",
    question: "What is the capital city of Japan?",
    options: ["Kyoto", "Osaka", "Tokyo", "Hiroshima"],
    correct_answer: 2,
    category: "General Knowledge",
    difficulty: "Easy"
  },
  {
    id: "default-12",
    question: "How many continents are there on Earth?",
    options: ["5", "6", "7", "8"],
    correct_answer: 2,
    category: "General Knowledge",
    difficulty: "Easy"
  },
  {
    id: "default-13",
    question: "Which year did World War II end?",
    options: ["1918", "1939", "1945", "1950"],
    correct_answer: 2,
    category: "History",
    difficulty: "Medium"
  },
  {
    id: "default-14",
    question: "Who was the first President of the United States?",
    options: ["Thomas Jefferson", "George Washington", "Abraham Lincoln", "John Adams"],
    correct_answer: 1,
    category: "History",
    difficulty: "Easy"
  },
  {
    id: "default-15",
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correct_answer: 3,
    category: "General Knowledge",
    difficulty: "Easy"
  }
];
