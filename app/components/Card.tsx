import React from 'react';

type CardProps = {
  children: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="border rounded-lg shadow-md p-4 bg-white">
      {children}
    </div>
  );
};

export default Card;
