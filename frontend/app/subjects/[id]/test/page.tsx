'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
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

// Extend MultipleChoiceQuestion to include feedback and grade
export interface ExtendedMultipleChoiceQuestion extends MultipleChoiceQuestion {
  feedback?: string // Feedback for the question
  grade?: 'correct' | 'incorrect' // Grade for the question
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

export default function QuizPage() {
  const [quizData, setQuizData] = useState<QuizData | null>(null) // State to hold fetched data
  const [loading, setLoading] = useState<boolean>(true) // State to handle loading
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}) // State to store user answers
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResponse | null>(null)
  const [mcqResults, setMcqResults] = useState<Result[]>([])
  const [xp, setXp] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const router = useRouter()

  useEffect(() => {
    let isCalled = false // Add a flag to track whether the effect has already been executed

    const fetchQuizData = async (): Promise<void> => {
      if (isCalled) return // Prevent duplicate calls
      isCalled = true

      try {
        const urlParams = new URLSearchParams(window.location.search)
        const chapterId = urlParams.get('chapterId')

        if (!chapterId) {
          console.error('chapterId is missing in the URL')
          return
        }

        const response = await fetch(
          'http://127.0.0.1:8000/api/generate-test?chapterId=' + chapterId,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            }
          }
        )

        // if quiz data is already fill, ignore the response of the second request
        if (quizData) return

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json() // Typed response

        if (data.success) {
          setQuizData(data.data) // Set fetched data
        }
      } catch (error) {
        console.error('Error fetching quiz data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizData()
  }, [])

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

      // Update the XP state to the current xp + the new xp
      setXp(prevXp => prevXp + data.xp)

      console.log('Extensive Question Evaluation Response:', data)
      setEvaluationResult(data)
    } catch (error) {
      console.error('Error submitting the extensive question:', error)
    }
  }

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true) // Define o estado para verdadeiro ao submeter
    try {
      // Execute both submissions concurrently
      await Promise.all([handleSubmitMultipleChoice(), handleSubmitExtensive()])

      console.log('XP Updated:', xp)

      console.log('Test submission completed successfully!')
    } catch (error) {
      console.error('Error submitting the test:', error)
    } finally {
      setIsSubmitting(false)
      setIsSubmitted(true)
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

      // Update the XP state to the current xp + the new xp
      setXp(prevXp => prevXp + data.xp)

      console.log('MCQ Results Submission Response:', data)

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
          const result = mcqResults.find(res => res.id === question.id) // Find result by ID

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
        {isSubmitted && xp > 0 && (
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
        {isSubmitted ? (
          <Button
            onClick={() => {
              const currentPath = window.location.pathname // '/subjects/1/test'
              const parentPath = currentPath.split('/').slice(0, 3).join('/') // '/subjects/1'
              router.push(parentPath)
            }}
            className='rounded bg-green-600 px-6 py-2 text-white hover:bg-green-700'
          >
            Go Back
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isSubmitted} // Disable the button if submitting or already submitted
            className={`rounded px-6 py-2 text-white ${
              isSubmitting || isSubmitted
                ? 'bg-gray-500'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting
              ? 'Submitting...'
              : isSubmitted
                ? 'Submitted'
                : 'Submit Test'}
          </Button>
        )}
      </div>
    </div>
  )
}
