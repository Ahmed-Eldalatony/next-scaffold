"use client";
import React, { useState, useEffect } from "react";
import { Play, Trophy, Lightbulb, RefreshCw, Check, X, Coins, Gift, Star, Sparkles } from "lucide-react";

const LearningPlatform = () => {
  // Core State
  const [currentGame, setCurrentGame] = useState(0);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(100); // Mock microtransaction currency
  const [streak, setStreak] = useState(0);
  const [gameState, setGameState] = useState('menu');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '', show: false });
  const [powerUps, setPowerUps] = useState({
    doubleCoins: { owned: 1, cost: 50, active: false },
    skip: { owned: 2, cost: 30, active: false },
    hint: { owned: 3, cost: 20, active: false }
  });
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showTimer, setShowTimer] = useState(false);

  // Subjects with dynamic content
  const subjects = {
    math: {
      name: 'Math',
      icon: '➗',
      color: 'from-blue-500 to-indigo-600',
      games: {
        1: { // Emoji Math Problems
          questions: [
            { emoji: "🍎 + 🍎", math: "2 + 2", answer: "4", hint: "Count the apples!" },
            { emoji: "🍕 - 🍕", math: "5 - 3", answer: "2", hint: "Subtract the slices!" },
            { emoji: "🏀 × 2", math: "3 × 2", answer: "6", hint: "Multiply by two!" }
          ]
        },
        2: { // Speed Calculation
          questions: [
            { problem: "8 × 7", answer: "56", time: 10 },
            { problem: "√144", answer: "12", time: 8 },
            { problem: "25% of 200", answer: "50", time: 12 }
          ]
        },
        3: { // Equation Builder
          questions: [
            { parts: ["3", "+", "x", "=", "10"], answer: "x=7" },
            { parts: ["2x", "+", "4", "=", "10"], answer: "x=3" },
            { parts: ["x", "²", "+", "3", "=", "12"], answer: "x=3" }
          ]
        }
      }
    },
    science: {
      name: 'Science',
      icon: '🔬',
      color: 'from-green-500 to-teal-600',
      games: {
        1: { // Element Detective
          questions: [
            { clue: "Atomic number 79", options: ["Gold", "Silver", "Platinum"], answer: "Gold" },
            { clue: "Most abundant gas in atmosphere", options: ["Oxygen", "Nitrogen", "Carbon Dioxide"], answer: "Nitrogen" },
            { clue: "H2O is the formula for...", options: ["Water", "Hydrogen Peroxide", "Ice"], answer: "Water" }
          ]
        },
        2: { // True or False
          questions: [
            { statement: "The Earth is flat", answer: "false" },
            { statement: "Photosynthesis produces oxygen", answer: "true" },
            { statement: "Humans have 206 bones", answer: "true" }
          ]
        },
        3: { // Process Order
          questions: [
            { steps: ["Seed", "Sprout", "Plant", "Flower"], scramble: ["Plant", "Flower", "Seed", "Sprout"] },
            { steps: ["Egg", "Larva", "Pupa", "Adult"], scramble: ["Adult", "Larva", "Egg", "Pupa"] },
            { steps: ["Question", "Hypothesis", "Experiment", "Conclusion"], scramble: ["Conclusion", "Hypothesis", "Question", "Experiment"] }
          ]
        }
      }
    },
    history: {
      name: 'History',
      icon: '📜',
      color: 'from-amber-600 to-red-700',
      games: {
        1: { // Timeline Challenge
          questions: [
            { event: "World War I", years: ["1914", "1939", "1945"], answer: "1914" },
            { event: "Moon Landing", years: ["1959", "1969", "1979"], answer: "1969" },
            { event: "Fall of Berlin Wall", years: ["1985", "1989", "1991"], answer: "1989" }
          ]
        },
        2: { // Fact Detective
          questions: [
            { clue: "President during WWII", options: ["FDR", "Truman", "Eisenhower"], answer: "FDR" },
            { clue: "Year USA declared independence", options: ["1776", "1789", "1812"], answer: "1776" },
            { clue: "Inventor of telephone", options: ["Edison", "Bell", "Tesla"], answer: "Bell" }
          ]
        },
        3: { // Match Events
          questions: [
            { left: ["Renaissance", "Industrial Revolution", "Cold War"], right: ["1947-1991", "14th-17th Century", "18th-19th Century"] }
          ]
        }
      }
    }
  };

  // Game templates
  const games = [
    {
      id: 1,
      title: "Emoji Puzzle",
      description: "Solve problems through playful emojis!",
      icon: "😊",
      rules: "Translate the emoji sequence into the correct answer. Visual learning made fun!",
      difficulty: "Easy"
    },
    {
      id: 2,
      title: "Speed Challenge",
      description: "Beat the clock to solve problems!",
      icon: "⏱️",
      rules: "Answer quickly before time runs out. Speed equals rewards!",
      difficulty: "Medium"
    },
    {
      id: 3,
      title: "Interactive Builder",
      description: "Construct your answers creatively!",
      icon: "🧩",
      rules: "Arrange elements to form the correct answer. Think spatially!",
      difficulty: "Hard"
    }
  ];

  // Timer effect
  useEffect(() => {
    let interval;
    if (showTimer && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowTimer(false);
            handleFeedback("Time's up!", false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showTimer, timeLeft]);

  // Start game
  const startGame = (gameId) => {
    setCurrentGame(gameId);
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setGameState('playing');
    setUserAnswer('');
    setShowHint(false);
  };

  // Next question
  const nextQuestion = () => {
    const totalQuestions = subjects[selectedSubject].games[currentGame][currentQuestion]?.length || 3;
    if (currentQuestion + 1 >= totalQuestions) {
      setGameState('completed');
    } else {
      setCurrentQuestion(prev => prev + 1);
      setUserAnswer('');
      setShowHint(false);
      if (currentGame === 2) {
        const newTime = subjects[selectedSubject].games[currentGame][currentQuestion + 1]?.time || 10;
        setTimeLeft(newTime);
        setShowTimer(true);
      }
    }
  };

  // Handle feedback
  const handleFeedback = (message, isCorrect) => {
    setFeedback({
      message,
      type: isCorrect ? 'correct' : 'incorrect',
      show: true
    });

    setTimeout(() => {
      setFeedback(prev => ({ ...prev, show: false }));
      nextQuestion();
    }, 2000);
  };

  // Check answer
  const checkAnswer = () => {
    const subjectData = subjects[selectedSubject];
    const question = subjectData.games[currentGame][currentQuestion];

    let isCorrect = false;
    let feedbackText = '';

    switch (currentGame) {
      case 1: // Emoji Puzzle
        isCorrect = userAnswer.toLowerCase().trim() === question.answer.toLowerCase();
        feedbackText = isCorrect ?
          `Correct! "${question.answer}" is right! 🎉` :
          `Not quite! The correct answer is: "${question.answer}" 🤔`;
        break;

      case 2: // Speed Challenge
        isCorrect = userAnswer.toLowerCase().trim() === question.answer.toLowerCase();
        feedbackText = isCorrect ?
          `Lightning fast! Perfect answer! ⚡` :
          `Good try, but the correct answer is: "${question.answer}" 🐢`;
        break;

      case 3: // Interactive Builder
        isCorrect = userAnswer.toLowerCase().trim() === question.answer.toLowerCase();
        feedbackText = isCorrect ?
          `Brilliant construction! That's exactly right! 🧠` :
          `Close! The correct answer is: "${question.answer}" 🤔`;
        break;
    }

    if (isCorrect) {
      const basePoints = 10;
      const bonus = powerUps.doubleCoins.active ? basePoints * 2 : basePoints;
      setScore(prev => prev + bonus + (streak * 2));
      setStreak(prev => prev + 1);
      setCoins(prev => prev + (powerUps.doubleCoins.active ? 10 : 5));
    } else {
      setStreak(0);
    }

    handleFeedback(feedbackText, isCorrect);

    // Deactivate powerups after use
    if (powerUps.doubleCoins.active) {
      setPowerUps(prev => ({
        ...prev,
        doubleCoins: { ...prev.doubleCoins, active: false }
      }));
    }
  };

  // Purchase powerup
  const buyPowerUp = (type) => {
    const powerup = powerUps[type];
    if (coins >= powerup.cost && powerup.owned < 5) {
      setCoins(prev => prev - powerup.cost);
      setPowerUps(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          owned: prev[type].owned + 1
        }
      }));
    }
  };

  // Use powerup
  const usePowerUp = (type) => {
    if (powerUps[type].owned > 0) {
      if (type === 'skip') {
        nextQuestion();
      } else if (type === 'hint') {
        setShowHint(true);
      }

      setPowerUps(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          owned: prev[type].owned - 1,
          active: type === 'doubleCoins' ? true : false
        }
      }));
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState('menu');
    setCurrentGame(0);
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setUserAnswer('');
    setShowHint(false);
    setShowTimer(false);
  };

  // Render game content
  const renderGameContent = () => {
    if (gameState === 'menu') {
      return (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center">
              <Sparkles className="mr-3 text-yellow-400" /> Knowledge Quest <Sparkles className="ml-3 text-yellow-400" />
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Learn anything through fun, engaging games and earn real rewards!
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {Object.entries(subjects).map(([key, subj]) => (
                <button
                  key={key}
                  onClick={() => setSelectedSubject(key)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${selectedSubject === key
                    ? 'bg-gradient-to-r ' + subj.color + ' text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                    }`}
                >
                  <span className="text-2xl mr-2">{subj.icon}</span>
                  {subj.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <div
                key={game.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{game.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{game.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{game.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${game.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      game.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {game.difficulty}
                    </span>
                    <button
                      onClick={() => startGame(game.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
                    >
                      Play Now <Play className="ml-2" size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Powerup Store */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Coins className="mr-2" /> Powerup Store
            </h2>
            <div className="flex flex-wrap gap-4">
              {Object.entries(powerUps).map(([type, data]) => (
                <div
                  key={type}
                  className="bg-gray-50 rounded-lg p-4 flex-1 min-w-[200px] hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold capitalize">{type.replace(/([A-Z])/g, ' $1')}</h3>
                  <p className="text-sm text-gray-600 mb-2">{type === 'doubleCoins' ? 'Double points for 1 question' : type === 'skip' ? 'Skip difficult questions' : 'Get helpful hints'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-bold">{data.cost} coins</span>
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-3">Owned: {data.owned}</span>
                      <button
                        onClick={() => buyPowerUp(type)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (gameState === 'completed') {
      return (
        <div className="text-center space-y-8">
          <div className="text-8xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-4xl font-bold text-gray-800">Mission Accomplished!</h2>
          <p className="text-2xl text-gray-600">You've mastered {subjects[selectedSubject].name}!</p>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
            <div className="bg-white rounded-xl p-4 shadow">
              <p className="text-sm text-gray-600">Total Score</p>
              <p className="text-3xl font-bold text-blue-600">{score}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow">
              <p className="text-sm text-gray-600">Coins Earned</p>
              <p className="text-3xl font-bold text-yellow-600">{coins}</p>
            </div>
          </div>

          <div className="space-x-4">
            <button
              onClick={resetGame}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center mx-auto"
            >
              <RefreshCw size={20} className="mr-2" /> Play Again
            </button>
          </div>
        </div>
      );
    }

    const subjectData = subjects[selectedSubject];
    const question = subjectData.games[currentGame][currentQuestion];

    if (!question) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={resetGame}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RefreshCw size={20} className="mr-2" /> Back to Menu
          </button>
          <div className="text-right">
            <div className="text-sm text-gray-600">Score: {score}</div>
            <div className="text-sm text-gray-600">Coins: {coins}</div>
            <div className="text-sm text-gray-600">Streak: {streak}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
              {games[currentGame - 1].icon} {games[currentGame - 1].title}
            </h2>
            <p className="text-gray-600 mb-4">{games[currentGame - 1].description}</p>
            <div className="inline-block bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700">
              Question {currentQuestion + 1} of {Object.values(subjectData.games[currentGame]).length}
            </div>
          </div>

          {/* Powerup Controls */}
          <div className="flex justify-center gap-4 mb-6">
            {Object.entries(powerUps).map(([type, data]) => (
              <button
                key={type}
                onClick={() => usePowerUp(type)}
                disabled={data.owned <= 0}
                className={`p-2 rounded-full hover:scale-105 transition-transform ${data.owned > 0 ? 'bg-blue-100 hover:bg-blue-200' : 'bg-gray-200'
                  }`}
                title={type}
              >
                {type === 'doubleCoins' && <Star size={20} />}
                {type === 'skip' && <Lightbulb size={20} />}
                {type === 'hint' && <Gift size={20} />}
              </button>
            ))}
          </div>

          {showTimer && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 text-white rounded-full text-2xl font-bold animate-pulse">
                {timeLeft}
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              {currentGame === 1 && (
                <div className="text-4xl">{question.emoji}</div>
              )}
              {currentGame === 2 && (
                <div>"{question.problem}"</div>
              )}
              {currentGame === 3 && (
                <div className="flex flex-wrap justify-center gap-2">
                  {question.parts.map((part, i) => (
                    <div key={i} className="p-2 bg-white rounded shadow">
                      {part}
                    </div>
                  ))}
                </div>
              )}
            </h3>

            {currentGame === 1 && (
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && userAnswer && checkAnswer()}
                placeholder="Type your answer..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
              />
            )}

            {currentGame === 2 && (
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && userAnswer && checkAnswer()}
                placeholder="Type your answer..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
              />
            )}

            {currentGame === 3 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setUserAnswer(option)}
                    className={`p-3 rounded-lg border-2 transition-all ${userAnswer === option
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {showHint && question.hint && (
              <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded text-yellow-800">
                <Lightbulb className="inline mr-2" /> {question.hint}
              </div>
            )}
          </div>

          {feedback.show && (
            <div
              className={`text-center mb-6 p-4 rounded transition-opacity duration-500 ${feedback.type === 'correct' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
                }`}
            >
              <p className={feedback.type === 'correct' ? 'text-green-800' : 'text-red-800'}>
                {feedback.message}
              </p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={checkAnswer}
              disabled={!userAnswer}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center mx-auto"
            >
              <Check size={20} className="mr-2" /> Submit Answer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {renderGameContent()}
      </div>
    </div>
  );
};

export default LearningPlatform;
