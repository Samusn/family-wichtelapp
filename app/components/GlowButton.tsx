'use client'

import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard'

interface GlowButtonProps {
  onClick: () => void
  text: string
}

const GlowButton: React.FC<GlowButtonProps> = ({ onClick, text }) => {
  return (
    <motion.div
      drag
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      dragElastic={0.2}
      style={{ display: 'inline-block' }}
    >
      <StyledWrapper>
        <button onClick={onClick}>
          {text} <CardGiftcardIcon style={{ marginLeft: 8 }} />
        </button>
      </StyledWrapper>
    </motion.div>
  )
}

const StyledWrapper = styled.div`
  button {
    /* Weihnachtsfarben */
    --glow-color: #F1C40F; /* Gold */
    --glow-spread-color: rgba(241, 196, 15, 0.7);
    --btn-color: #C0392B; /* Rot */
    --btn-accent-color: #27AE60; /* Grün */

    border: 0.25em solid var(--glow-color);
    padding: 1em 3em;
    color: var(--glow-color);
    font-size: 15px;
    font-weight: bold;
    background-color: var(--btn-color);
    border-radius: 1em;
    outline: none;
    box-shadow: 0 0 1em 0.25em var(--glow-color),
      0 0 4em 1em var(--glow-spread-color),
      inset 0 0 0.75em 0.25em var(--glow-color);
    text-shadow: 0 0 0.5em var(--glow-color);
    position: relative;
    transition: all 0.3s;
    cursor: grab;
  }

  button::after {
    pointer-events: none;
    content: '';
    position: absolute;
    top: 120%;
    left: 0;
    height: 100%;
    width: 100%;
    background-color: var(--glow-spread-color);
    filter: blur(2em);
    opacity: 0.7;
    transform: perspective(1.5em) rotateX(35deg) scale(1, 0.6);
  }

  button:active {
    box-shadow: 0 0 0.6em 0.25em var(--glow-color),
      0 0 2.5em 2em var(--glow-spread-color),
      inset 0 0 0.5em 0.25em var(--glow-color);
    cursor: grabbing;
  }
`

export default GlowButton
