'use client'

import { useState, useEffect, useCallback } from 'react'
import { findTour, getTourTopics, GuidedTour, TourStep } from '@/lib/help-system'
import { supabase } from '@/lib/supabase'

interface HelpButtonProps {
  userId: string
  userEmail: string
  currentPage: string
}

export default function HelpButton({ userId, userEmail, currentPage }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeTour, setActiveTour] = useState<GuidedTour | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [aiResponse, setAiResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'search' | 'tour' | 'ai' | 'logged'>('search')

  // Handle search/query
  const handleSearch = async () => {
    if (!query.trim()) return

    // First, try to find a matching tour
    const tour = findTour(query)
    if (tour) {
      setActiveTour(tour)
      setCurrentStep(0)
      setMode('tour')
      return
    }

    // If no tour found, try AI
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: query,
          context: `User is on the ${currentPage} page of an Etsy multi-store management app.`
        }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setAiResponse(data.response)
        setMode('ai')
      } else {
        // AI failed, log the request
        await logHelpRequest(query, null)
        setMode('logged')
      }
    } catch (err) {
      // Log the request for admin review
      await logHelpRequest(query, null)
      setMode('logged')
    }
    setLoading(false)
  }

  // Log help request for admin review
  const logHelpRequest = async (question: string, aiResponse: string | null) => {
    await supabase.from('help_requests').insert({
      user_id: userId,
      user_email: userEmail,
      question,
      page: currentPage,
      ai_response: aiResponse,
      resolved: false,
    })
  }

  // Highlight current tour element
  useEffect(() => {
    if (!activeTour || mode !== 'tour') return

    const step = activeTour.steps[currentStep]
    const element = document.querySelector(step.target)
    
    if (element) {
      element.classList.add('tour-highlight')
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    return () => {
      if (element) {
        element.classList.remove('tour-highlight')
      }
    }
  }, [activeTour, currentStep, mode])

  const nextStep = () => {
    if (activeTour && currentStep < activeTour.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      endTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const endTour = () => {
    setActiveTour(null)
    setCurrentStep(0)
    setMode('search')
    setQuery('')
  }

  const reset = () => {
    setMode('search')
    setQuery('')
    setAiResponse('')
    setActiveTour(null)
    setCurrentStep(0)
  }

  const topics = getTourTopics()

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 flex items-center justify-center help-btn-pulse z-50"
      >
        <i className="fas fa-question text-xl"></i>
      </button>

      {/* Tour Overlay */}
      {mode === 'tour' && <div className="tour-overlay" />}

      {/* Tour Tooltip */}
      {mode === 'tour' && activeTour && (
        <TourTooltip
          step={activeTour.steps[currentStep]}
          stepNumber={currentStep + 1}
          totalSteps={activeTour.steps.length}
          onNext={nextStep}
          onPrev={prevStep}
          onClose={endTour}
        />
      )}

      {/* Help Modal */}
      {isOpen && mode !== 'tour' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between bg-emerald-500 text-white">
              <h3 className="font-semibold flex items-center gap-2">
                <i className="fas fa-life-ring"></i>
                Help Center
              </h3>
              <button onClick={() => { setIsOpen(false); reset(); }} className="hover:bg-emerald-600 rounded p-1">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {mode === 'search' && (
                <>
                  {/* Search */}
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="How do I...?"
                      className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={loading}
                      className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
                    </button>
                  </div>

                  {/* Quick Topics */}
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Popular topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {topics.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => { setQuery(topic); }}
                          className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {mode === 'ai' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <i className="fas fa-robot text-emerald-500"></i>
                    <span className="font-medium">AI Assistant</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                    {aiResponse}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={reset}
                      className="flex-1 border rounded-lg py-2 hover:bg-gray-50"
                    >
                      Ask Another Question
                    </button>
                    <button
                      onClick={async () => {
                        await logHelpRequest(query, aiResponse)
                        setMode('logged')
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Still need help?
                    </button>
                  </div>
                </div>
              )}

              {mode === 'logged' && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-check text-emerald-600 text-2xl"></i>
                  </div>
                  <h4 className="font-semibold mb-2">Request Logged</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Your question has been sent to the admin team. They'll get back to you soon.
                  </p>
                  <button
                    onClick={reset}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600"
                  >
                    Ask Another Question
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Tour tooltip component
function TourTooltip({ 
  step, 
  stepNumber, 
  totalSteps, 
  onNext, 
  onPrev, 
  onClose 
}: { 
  step: TourStep
  stepNumber: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onClose: () => void
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const element = document.querySelector(step.target)
    if (element) {
      const rect = element.getBoundingClientRect()
      let top = 0
      let left = 0

      switch (step.position) {
        case 'top':
          top = rect.top - 120
          left = rect.left + rect.width / 2 - 150
          break
        case 'bottom':
          top = rect.bottom + 20
          left = rect.left + rect.width / 2 - 150
          break
        case 'left':
          top = rect.top + rect.height / 2 - 60
          left = rect.left - 320
          break
        case 'right':
          top = rect.top + rect.height / 2 - 60
          left = rect.right + 20
          break
      }

      // Keep tooltip in viewport
      top = Math.max(20, Math.min(top, window.innerHeight - 200))
      left = Math.max(20, Math.min(left, window.innerWidth - 320))

      setPosition({ top, left })
    }
  }, [step])

  return (
    <div 
      className="tour-tooltip"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">Step {stepNumber} of {totalSteps}</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <i className="fas fa-times"></i>
        </button>
      </div>
      <h4 className="font-semibold text-emerald-600 mb-1">{step.title}</h4>
      <p className="text-sm text-gray-600 mb-4">{step.content}</p>
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          disabled={stepNumber === 1}
          className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30"
        >
          <i className="fas fa-arrow-left mr-1"></i> Back
        </button>
        <button
          onClick={onNext}
          className="bg-emerald-500 text-white px-4 py-1 rounded text-sm hover:bg-emerald-600"
        >
          {stepNumber === totalSteps ? 'Finish' : 'Next'} <i className="fas fa-arrow-right ml-1"></i>
        </button>
      </div>
    </div>
  )
}
