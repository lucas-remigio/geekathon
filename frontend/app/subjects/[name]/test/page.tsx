'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'

// Define interfaces for data structure
export interface Choice {
  label: string
  text: string
}

export interface MultipleChoiceQuestion {
  id: number
  question: string
  choices: Choice[]
  correctAnswer: string
}

export interface ExtensiveQuestion {
  question: string
}

export interface QuizData {
  multipleChoiceQuestions: MultipleChoiceQuestion[]
  extensiveQuestion: ExtensiveQuestion
}

export interface QuizResponse {
  success: boolean
  data: QuizData
}

export interface EvaluationResponse {
  success: boolean
  grade: string
  feedback: string
  xp: number
}

// Type for feedback returned from the API for each question
export interface QuestionFeedback {
  id: number // The ID of the question
  grade: 'correct' | 'incorrect' // Whether the answer was correct or not
  feedback: string // Feedback message for the question
}

interface SubmitMcqResults {
  success: boolean
  feedback: Feedback
  xp: number
}

interface Feedback {
  results: Result[]
}

interface Result {
  id: number
  grade: string
  feedback: string
}

// Extend MultipleChoiceQuestion to include feedback and grade
export interface ExtendedMultipleChoiceQuestion extends MultipleChoiceQuestion {
  feedback?: string // Feedback for the question
  grade?: 'correct' | 'incorrect' // Grade for the question
}

export default function QuizPage() {
  const [quizData, setQuizData] = useState<QuizData | null>(null) // State to hold fetched data
  const [loading, setLoading] = useState<boolean>(true) // State to handle loading
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}) // State to store user answers
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResponse | null>(null)
  const [mcqResults, setMcqResults] = useState<Result[]>()
  const [xp, setXp] = useState<number>(0)

  useEffect(() => {
    let isMounted = true // Flag to track if the component is still mounted
    let isCalled = false // Flag to track whether the fetch function has been executed

    const fetchQuizData = async (): Promise<void> => {
      if (isCalled) return // Prevent duplicate calls
      isCalled = true

      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/generate-test',
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              pdf_ids: [3] // Replace with appropriate IDs as needed
            })
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json() // Typed response
        setQuizData(data.data) // Set fetched data
      } catch (error) {
        console.error('Error fetching quiz data:', error)
      } finally {
        if (isMounted) {
          setLoading(false) // Only update loading if the component is mounted
        }
      }
    }

    fetchQuizData()

    // Cleanup function to avoid updating state after the component is unmounted
    return () => {
      isMounted = false
    }
  }, []) // Depend on `quizData` to ensure it doesn't re-fetch once data is loaded

  const handleAnswerChange = (questionId: string, answer: string): void => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer
    }))
  }

  const handleSubmitExtensive = async (): Promise<void> => {
    console.log('User Answers:', userAnswers)

    try {
      // Extract the extensive question and its answer
      const extensiveQuestion = quizData?.extensiveQuestion.question || ''
      const extensiveAnswer = userAnswers['extensiveQuestion'] || ''

      // Make the API call
      const response = await fetch('http://127.0.0.1:8000/api/correct-answer', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: extensiveQuestion,
          answer: extensiveAnswer
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: EvaluationResponse = await response.json()
      console.log('Extensive Question Evaluation Response:', data)

      setXp(xp + data.xp)

      setEvaluationResult(data)
    } catch (error) {
      console.error('Error submitting the extensive question:', error)
    }
  }

  const handleSubmit = async (): Promise<void> => {
    try {
      // Execute both submissions concurrently
      await Promise.all([handleSubmitMultipleChoice(), handleSubmitExtensive()])

      console.log('XP Updated:', xp)

      console.log('Test submission completed successfully!')
    } catch (error) {
      console.error('Error submitting the test:', error)
    }
  }

  const handleSubmitMultipleChoice = async (): Promise<void> => {
    if (!quizData) return

    // Map the questions into the required format for the backend
    const multipleChoiceResults = quizData.multipleChoiceQuestions.map(
      question => {
        const selectedOptionLabel = userAnswers[question.id.toString()] || ''

        const selectedOptionText =
          question.choices.find(choice => choice.label === selectedOptionLabel)
            ?.text || ''

        const isCorrect = selectedOptionLabel === question.correctAnswer

        return {
          question: question.question, // The question text
          isCorrect, // Whether the answer is correct
          chosenAnswer: selectedOptionText // The user's selected answer
        }
      }
    )

    console.log('Multiple Choice Results:', multipleChoiceResults)

    try {
      // Make the API call
      const response = await fetch(
        'http://127.0.0.1:8000/api/submit-mcq-results',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            results: multipleChoiceResults // Send the array of results
          })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: SubmitMcqResults = await response.json()
      console.log('MCQ Results Submission Response:', data)

      // get current xp
      setXp(xp + data.xp)

      if (data.success) {
        // Store results in the new state
        setMcqResults(data.feedback.results)
      }
    } catch (error) {
      console.error('Error submitting the multiple-choice results:', error)
    }
  }

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        Loading...
      </div>
    )
  }

  if (!quizData) {
    return <div>Failed to load quiz data.</div>
  }

  return (
    <div className='p-10'>
      <h1 className='mb-4 text-2xl font-bold'>Quiz</h1>
      <div className='mb-6'>
        <h2 className='text-xl font-semibold'>Multiple Choice Questions</h2>
        {quizData.multipleChoiceQuestions.map(question => {
          const result = mcqResults?.find(res => res.id === question.id) // Safely access mcqResults

          return (
            <div key={question.id} className='mb-4 rounded border p-4'>
              <p className='font-medium'>
                {question.id}. {question.question}
              </p>
              <ul className='mt-2'>
                {question.choices.map(choice => (
                  <li key={choice.label} className='mt-1'>
                    <label>
                      <input
                        type='radio'
                        name={`question-${question.id}`}
                        value={choice.label}
                        className='mr-2'
                        onChange={e =>
                          handleAnswerChange(
                            question.id.toString(),
                            e.target.value
                          )
                        }
                      />
                      {choice.label}: {choice.text}
                    </label>
                  </li>
                ))}
              </ul>
              {/* Display feedback warning */}
              {result && (
                <div
                  className={`mt-2 rounded p-2 ${
                    result.grade === 'correct'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  <strong>
                    {result.grade === 'correct' ? 'Correct!' : 'Incorrect!'}
                  </strong>{' '}
                  {result.feedback}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div>
        <h2 className='text-xl font-semibold'>Extensive Question</h2>

        {evaluationResult && (
          <div
            className={`mb-4 rounded border p-4 shadow-md ${
              parseInt(evaluationResult.grade) > 10
                ? 'bg-green-800 text-white'
                : 'bg-red-800 text-white'
            }`}
          >
            <p>
              <strong>Grade:</strong> {evaluationResult.grade}
            </p>
            <p className='mt-2'>
              <strong>Feedback:</strong> {evaluationResult.feedback}
            </p>
          </div>
        )}

        <div className='mt-4 rounded border p-4'>
          <p>{quizData.extensiveQuestion.question}</p>
          <textarea
            className='mt-4 w-full rounded border p-2'
            rows={5}
            placeholder='Write your answer here...'
            onChange={
              e => handleAnswerChange('extensiveQuestion', e.target.value) // Update state for the extensive question
            }
          ></textarea>
        </div>
      </div>

      <div className='mt-6 flex justify-center'>
        {xp > 0 && (
          <Card className='w-full max-w-sm rounded-lg border border-gray-200 bg-gradient-to-r from-green-100 to-green-50 shadow-xl'>
            <CardHeader>
              <CardTitle className='text-center text-3xl font-bold text-green-800'>
                XP Earned 🎉
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-center py-6'>
                <p className='text-5xl font-extrabold text-green-600'>{xp}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className='mt-6 flex justify-end'>
        <Button
          onClick={() => {
            // Replace this logic with your submit function
            handleSubmit()
          }}
          className='rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700'
        >
          Submit Test
        </Button>
      </div>
    </div>
  )
}
