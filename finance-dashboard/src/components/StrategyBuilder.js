import React, { useState } from 'react';

function StrategyBuilder() {
  const [blocks, setBlocks] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [expression, setExpression] = useState('');

  const availableBlocks = [
    { id: '1', label: 'Days Moving Average' },
    { id: '2', label: 'Days High' },
    { id: '3', label: 'Days Low' },
    { id: '4', label: 'Days Std Dev' },
  ];

  const handleAddBlock = (block) => {
    if (inputValue) {
      const newBlock = { ...block, value: inputValue };
      setBlocks([...blocks, newBlock]);
      setInputValue('');
    }
  };

  const handleBuildExpression = () => {
    const expr = blocks.map(block => `${block.label}(${block.value})`).join(' AND ');
    setExpression(expr);
  };

  return (
    <div style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
      <h2>Strategy Builder</h2>
      <div style={{marginBottom: '20px'}}>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter value"
          style={{marginRight: '10px', padding: '5px'}}
        />
        {availableBlocks.map((block) => (
          <button
            key={block.id}
            onClick={() => handleAddBlock(block)}
            style={{margin: '5px', padding: '5px 10px'}}
          >
            Add {block.label}
          </button>
        ))}
      </div>
      <div style={{marginBottom: '20px'}}>
        <h3>Current Strategy:</h3>
        <ul>
          {blocks.map((block, index) => (
            <li key={index}>{block.label}({block.value})</li>
          ))}
        </ul>
      </div>
      <button
        onClick={handleBuildExpression}
        style={{padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none'}}
      >
        Build Expression
      </button>
      {expression && (
        <div style={{marginTop: '20px'}}>
          <h3>Generated Expression:</h3>
          <p>{expression}</p>
        </div>
      )}
    </div>
  );
}

export default StrategyBuilder;
