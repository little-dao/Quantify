import React, { useState } from 'react';

function StrategyBuilder() {
  const [blocks, setBlocks] = useState([]);

  const availableBlocks = [
    { id: '1', label: '_ Days Moving Average' },
    { id: '2', label: '_ Days High' },
    { id: '3', label: '_ Days Low' },
    { id: '4', label: '_ Days Std Dev' },
  ];

  const handleAddBlock = (block) => {
    setBlocks([...blocks, block]);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Strategy Builder</h1>

      {/* Block Selection */}
      <div style={{ marginBottom: '20px' }}>
        {availableBlocks.map((block) => (
          <button key={block.id} onClick={() => handleAddBlock(block)}>
            Add {block.label}
          </button>
        ))}
      </div>

      {/* Display Added Blocks */}
      <div>
        <h3>Added Blocks:</h3>
        {blocks.map((block, index) => (
          <div key={index}>{block.label}</div>
        ))}
      </div>
    </div>
  );
}

export default StrategyBuilder;
