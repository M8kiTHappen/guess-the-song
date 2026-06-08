'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { GameProvider, useGame } from '@/context/GameContext'
import { AudioProvider } from '@/context/AudioContext'
import SetupScreen  from '@/components/SetupScreen'
import GameScreen   from '@/components/GameScreen'
import RevealScreen from '@/components/RevealScreen'
import WinnerScreen from '@/components/WinnerScreen'

function ScreenRouter() {
  const { state } = useGame()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.screen}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {state.screen === 'setup'   && <SetupScreen />}
        {state.screen === 'playing' && <GameScreen />}
        {state.screen === 'reveal'  && <RevealScreen />}
        {state.screen === 'winner'  && <WinnerScreen />}
      </motion.div>
    </AnimatePresence>
  )
}

export default function GameApp() {
  return (
    <GameProvider>
      <AudioProvider>
        <ScreenRouter />
      </AudioProvider>
    </GameProvider>
  )
}
