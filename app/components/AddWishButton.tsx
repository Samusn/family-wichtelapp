import React from 'react'
import styled, { keyframes } from 'styled-components'
import AddIcon from '@mui/icons-material/Add'

interface StyledButtonProps {
  onClick: () => void
}

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 10px #ff5555, 0 0 20px #ff5555, 0 0 30px #ff8888;
  }
  50% {
    box-shadow: 0 0 15px #ff6666, 0 0 25px #ff7777, 0 0 35px #ff9999;
  }
`

const Wrapper = styled.div`
  .button {
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 9999px;
    background-color: #ff0000;
    color: white;
    font-weight: 600;
    font-size: 0.95rem;
    border: none;
    transition: all 0.3s ease;
    box-shadow: 0 0 15px #ff5555, 0 0 25px #ff8888;
    animation: ${glow} 2s infinite;
    white-space: nowrap;
    flex: 1;
    min-width: 0;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 0 20px #ff6666, 0 0 30px #ff9999;
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .icon {
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .text_button {
    position: relative;
    z-index: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const StyledButton: React.FC<StyledButtonProps> = ({ onClick }) => {
  return (
    <Wrapper>
      <button className="button" onClick={onClick}>
        <AddIcon className="icon" />
        <span className="text_button">Wunsch hinzufügen</span>
      </button>
    </Wrapper>
  )
}

export default StyledButton
