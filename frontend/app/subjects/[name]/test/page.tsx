'use client'

import { Button } from '@/components/ui/button'
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
}

export default function QuizPage() {
  const [quizData, setQuizData] = useState<QuizData | null>(null) // State to hold fetched data
  const [loading, setLoading] = useState<boolean>(true) // State to handle loading
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}) // State to store user answers
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResponse | null>(null)

  useEffect(() => {
    const fetchQuizData = async (): Promise<void> => {
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
              pdf_ids: [4] // Replace with appropriate IDs as needed
            })
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: QuizResponse = await response.json() // Typed response

        if (!data.success) {
          console.error('Failed to fetch quiz data')
          return
        }

        setQuizData(data.data) // Set fetched data
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

      const data = await response.json()
      console.log('Extensive Question Evaluation Response:', data)
      setEvaluationResult(data)
    } catch (error) {
      console.error('Error submitting the extensive question:', error)
    }
  }

  const handleSubmit = async (): Promise<void> => {
    try {
      // Call the multiple-choice submission function
      await handleSubmitMultipleChoice()

      // Call the extensive question submission function
      await handleSubmitExtensive()

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

      const data = await response.json()
      console.log('MCQ Results Submission Response:', data)

      // Handle the feedback from the API (if needed)
      if (data.success) {
        console.log('Feedback:', data.feedback)
        // Display feedback to the user, handle grading, or store the feedback
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
        {quizData.multipleChoiceQuestions.map(question => (
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
                      onChange={
                        e =>
                          handleAnswerChange(
                            question.id.toString(),
                            e.target.value
                          ) // Update state with selected answer
                      }
                    />
                    {choice.label}: {choice.text}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
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
