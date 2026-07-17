import { useState } from 'react'
import AiAssistant from './AiAssistant'
import AmbientAiBubble from './AmbientAiBubble'

export default function AssistantDock() {
  const [chatOpen, setChatOpen] = useState(false)
  const [pulseKey, setPulseKey] = useState(0)

  return (
    <>
      <AmbientAiBubble chatOpen={chatOpen} onShow={() => setPulseKey((k) => k + 1)} />
      <AiAssistant onOpenChange={setChatOpen} pulseKey={pulseKey} />
    </>
  )
}
