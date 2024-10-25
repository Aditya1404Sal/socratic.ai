"use client";
import React, { useState } from 'react';

export default function Page() {
  const dataStructures = [
    'Arrays',
    'Linked Lists',
    'Stacks',
    'Queues',
    'Trees',
    'Graphs',
    'Hash Tables',
    'Heaps',
    'Tries',
    'Binary Search Trees'
  ];

  const algorithms = [
    'Sorting Algorithms',
    'Searching Algorithms',
    'Dynamic Programming',
    'Greedy Algorithms',
    'Backtracking',
    'Divide and Conquer',
    'Graph Algorithms',
    'String Algorithms'
  ];

  const proficiencyLevels = [
    'I understand',
    'Understand but can\'t implement',
    'Can understand and implement'
  ];

  const [showAssessment, setShowAssessment] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDS, setSelectedDS] = useState([]);
  const [selectedAlgo, setSelectedAlgo] = useState([]);
  const [proficiency, setProficiency] = useState({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleDSSelection = (ds) => {
    if (selectedDS.includes(ds)) {
      setSelectedDS(selectedDS.filter(item => item !== ds));
    } else {
      setSelectedDS([...selectedDS, ds]);
    }
  };

  const handleAlgoSelection = (algo) => {
    if (selectedAlgo.includes(algo)) {
      setSelectedAlgo(selectedAlgo.filter(item => item !== algo));
    } else {
      setSelectedAlgo([...selectedAlgo, algo]);
    }
  };

  const handleProficiencySelection = (ds, level) => {
    setProficiency({
      ...proficiency,
      [ds]: level
    });
  };

  const moveToNextStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
      setIsTransitioning(false);
    }, 300);
  };
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {!showAssessment ? (
        // Landing Page Section
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="max-w-4xl text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to Socratic.AI
            </h1>
            <h2 className="text-2xl text-gray-700 mb-8">
              Master Data Structures and Algorithms through Socratic Dialogue
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Experience a revolutionary way to learn DSA through interactive conversations.
              Our AI tutor uses the Socratic method to guide you through concepts,
              helping you discover solutions through thoughtful questioning and discussion.
            </p>
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Personalized Learning Path</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Interactive Problem Solving</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Guided Discovery</span>
                </div>
              </div>
              <button
                onClick={() => setShowAssessment(true)}
                className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all"
              >
                Start Your DSA Journey
              </button>
            </div>
          </div>
        </div>
      )
        : (
          <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 font-sans">
            <div className="w-[90%] max-w-[800px] h-1 bg-gray-200 rounded-full mb-8">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>
            <div className={`
    ${isTransitioning ? 'animate-[fadeOut_1.3s_ease-out]' : 'animate-[fadeIn_0.3s_ease-in]'}
  `}>
              {currentStep === 1 && (
                <div className="bg-white rounded-2xl p-8 shadow-lg w-[90%] max-w-[600px] animate-[fadeIn_0.3s_ease-in]">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Which data structures are you familiar with?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {dataStructures.map(ds => (
                      <label key={ds} className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-all">
                        <input
                          type="checkbox"
                          checked={selectedDS.includes(ds)}
                          onChange={() => handleDSSelection(ds)}
                          className="w-[18px] h-[18px] accent-blue-600"
                        />
                        <span className="text-gray-900">{ds}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={moveToNextStep}
                    disabled={selectedDS.length === 0}
                    className="bg-blue-600 text-white px-6 py-3 rounded-full text-base disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-all"
                  >
                    Next
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="bg-white rounded-2xl p-8 shadow-lg w-[90%] max-w-[600px] animate-[fadeIn_0.3s_ease-in]">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Which algorithms are you familiar with?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {algorithms.map(algo => (
                      <label key={algo} className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-all">
                        <input
                          type="checkbox"
                          checked={selectedAlgo.includes(algo)}
                          onChange={() => handleAlgoSelection(algo)}
                          className="w-[18px] h-[18px] accent-blue-600"
                        />
                        <span className="text-gray-900">{algo}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={moveToNextStep}
                    disabled={selectedAlgo.length === 0}
                    className="bg-blue-600 text-white px-6 py-3 rounded-full text-base disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-all"
                  >
                    Next
                  </button>
                </div>
              )}

              {currentStep === 3 && (
                <div className="bg-white rounded-2xl p-8 shadow-lg w-[90%] max-w-[800px] animate-[fadeIn_0.3s_ease-in]">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Rate your proficiency in selected data structures:</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left p-4 border-b"></th>
                          {proficiencyLevels.map(level => (
                            <th key={level} className="text-left p-4 border-b text-gray-700 font-medium">
                              {level}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDS.map(ds => (
                          <tr key={ds} className="border-b">
                            <td className="p-4 font-medium text-gray-900">{ds}</td>
                            {proficiencyLevels.map(level => (
                              <td key={level} className="p-4">
                                <input
                                  type="radio"
                                  name={ds}
                                  checked={proficiency[ds] === level}
                                  onChange={() => handleProficiencySelection(ds, level)}
                                  className="w-[18px] h-[18px] accent-blue-600"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    onClick={() => {
                      console.log({ selectedDS, selectedAlgo, proficiency });
                      window.location.href = "http://localhost:3000/Chat";
                    }}
                    disabled={Object.keys(proficiency).length !== selectedDS.length}
                    className="bg-blue-600 text-white px-6 py-3 rounded-full text-base disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-all mt-6"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
