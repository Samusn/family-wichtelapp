import React from 'react'
import styled, { keyframes } from 'styled-components'

interface BigButtonProps {
  onClick?: () => void
}

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 8px #ffd60f, 0 0 15px #efad21, 0 0 25px #ffd60f;
  }
  50% {
    box-shadow: 0 0 12px #ffe066, 0 0 20px #ffc107, 0 0 30px #ffda6a;
  }
`

const GlowButton = styled.button`
  position: relative;
  outline: 0;
  height: 48px;
  width: 48px;
  min-width: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;
  background: linear-gradient(45deg, #efad21, #ffd60f);
  transition: transform 0.2s;
  animation: ${glow} 2s infinite;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 24px;
    height: 24px;
    color: #ffea50;
  }

  span {
    position: absolute;
    font-weight: 800;
    color: white;
    font-size: 14px;
  }
`

const BigButton: React.FC<BigButtonProps> = ({ onClick }) => {
  return (
    <GlowButton onClick={onClick}>
      <svg
        stroke="none"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z"
        />
      </svg>
    </GlowButton>
  )
}

export default BigButton
