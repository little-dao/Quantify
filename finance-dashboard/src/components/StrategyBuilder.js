import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function StrategyBuilder() {
  const [blocks, setBlocks] = useState([]);
  const [enterLongOperands, setEnterLongOperands] = useState({ left: '', right: '' });
  const [exitLongOperands, setExitLongOperands] = useState({ left: '', right: '' });
  const [enterLongCondition, setEnterLongCondition] = useState('>');
  const [exitLongCondition, setExitLongCondition] = useState('<');
  const [expression, setExpression] = useState('');
  const [expressionBlock, setExpressionBlock] = useState(null);

  const availableBlocks = [
    { id: '1', label: 'Moving Average' },
    { id: '2', label: 'High' },
    { id: '3', label: 'Low' },
    { id: '4', label: 'Std Dev' },
    { id: '5', label: 'Last Price' },
  ];

  const operators = ['+', '-', '*', '/'];
  const conditions = ['>', '<', '>=', '<=', '='];

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const draggedBlock = availableBlocks.find(block => block.id === result.draggableId) ||
      blocks.find(block => block.uniqueId === result.draggableId) ||
      (expressionBlock && expressionBlock.uniqueId === result.draggableId ? expressionBlock : null);

    if (!draggedBlock) return;

    if (result.destination.droppableId === 'enterLongLeft') {
      setEnterLongOperands({ ...enterLongOperands, left: draggedBlock.label });
    } else if (result.destination.droppableId === 'enterLongRight') {
      setEnterLongOperands({ ...enterLongOperands, right: draggedBlock.label });
    } else if (result.destination.droppableId === 'exitLongLeft') {
      setExitLongOperands({ ...exitLongOperands, left: draggedBlock.label });
    } else if (result.destination.droppableId === 'exitLongRight') {
      setExitLongOperands({ ...exitLongOperands, right: draggedBlock.label });
    } else if (result.destination.droppableId === 'strategy') {
      const newBlock = {
        ...draggedBlock,
        uniqueId: Date.now().toString(),
        days: draggedBlock.label === 'Last Price' ? '' : draggedBlock.days || '',
        operator: '+',
        operation: ''
      };
      setBlocks([...blocks, newBlock]);
    }
  };

  const handleDayChange = (uniqueId, days) => {
    setBlocks(blocks.map(block =>
      block.uniqueId === uniqueId ? { ...block, days } : block
    ));
  };

  const handleOperatorChange = (uniqueId, operator) => {
    setBlocks(blocks.map(block =>
      block.uniqueId === uniqueId ? { ...block, operator } : block
    ));
  };

  const handleOperationChange = (uniqueId, operation) => {
    setBlocks(blocks.map(block =>
      block.uniqueId === uniqueId ? { ...block, operation } : block
    ));
  };

  const handleBuildExpression = () => {
    const enterLongExpr = `Enter Long when ${enterLongOperands.left} ${enterLongCondition} ${enterLongOperands.right}`;
    const exitLongExpr = `Exit Long when ${exitLongOperands.left} ${exitLongCondition} ${exitLongOperands.right}`;
    const strategyExpr = blocks.map(block => `${block.label}(${block.days})${block.operation}`).join(' + ');
    const fullExpression = `${enterLongExpr}\n${exitLongExpr}\nStrategy Expression: ${strategyExpr}`;
    setExpression(fullExpression);

    // Create an expression block for reuse
    const newExpressionBlock = {
      uniqueId: Date.now().toString(),
      label: strategyExpr,
      days: '',
    };
    setExpressionBlock(newExpressionBlock);
  };

  const handleSubmit = () => {
    const enterLongExpr = `Enter Long when ${enterLongOperands.left} ${enterLongCondition} ${enterLongOperands.right}`;
    const exitLongExpr = `Exit Long when ${exitLongOperands.left} ${exitLongCondition} ${exitLongOperands.right}`;
    const fullExpression = `${enterLongExpr}\n${exitLongExpr}`;

    fetch('http://localhost:8000/api/submit-expression', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expression: fullExpression }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div>
        <h2>Strategy Builder</h2>

        {/* Enter Long */}
        <h3>Enter Long</h3>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <Droppable droppableId="enterLongLeft">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  minHeight: '50px',
                  width: '150px',
                  backgroundColor: '#e0e0e0',
                  padding: '10px',
                }}
              >
                <strong>Left Operand</strong>
                <div>{enterLongOperands.left}</div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <select
            value={enterLongCondition}
            onChange={(e) => setEnterLongCondition(e.target.value)}
            style={{ marginLeft: '10px' }}
          >
            {conditions.map(cond => (
              <option key={cond} value={cond}>{cond}</option>
            ))}
          </select>

          <Droppable droppableId="enterLongRight">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  minHeight: '50px',
                  width: '150px',
                  backgroundColor: '#e0e0e0',
                  padding: '10px',
                }}
              >
                <strong>Right Operand</strong>
                <div>{enterLongOperands.right}</div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Exit Long */}
        <h3>Exit Long</h3>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <Droppable droppableId="exitLongLeft">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  minHeight: '50px',
                  width: '150px',
                  backgroundColor: '#e0e0e0',
                  padding: '10px',
                }}
              >
                <strong>Left Operand</strong>
                <div>{exitLongOperands.left}</div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <select
            value={exitLongCondition}
            onChange={(e) => setExitLongCondition(e.target.value)}
            style={{ marginLeft: '10px' }}
          >
            {conditions.map(cond => (
              <option key={cond} value={cond}>{cond}</option>
            ))}
          </select>

          <Droppable droppableId="exitLongRight">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  minHeight: '50px',
                  width: '150px',
                  backgroundColor: '#e0e0e0',
                  padding: '10px',
                }}
              >
                <strong>Right Operand</strong>
                <div>{exitLongOperands.right}</div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>

        {/* Available Blocks */}
        <Droppable droppableId="available" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{ display: 'flex', marginBottom: '20px' }}
            >
              {availableBlocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        userSelect: 'none',
                        padding: 16,
                        marginRight: 8,
                        backgroundColor: '#456C86',
                        color: '#fff',
                        ...provided.draggableProps.style,
                      }}
                    >
                      {block.label}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Strategy Blocks */}
        <Droppable droppableId="strategy" direction="vertical">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                minHeight: '100px',
                backgroundColor: '#f0f0f0',
                padding: 10,
              }}
            >
              {blocks.map((block, index) => (
                <Draggable key={block.uniqueId} draggableId={block.uniqueId} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        userSelect: 'none',
                        padding: 16,
                        marginBottom: 8,
                        backgroundColor: '#263B4A',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        ...provided.draggableProps.style,
                      }}
                    >
                      {block.label}
                      {block.label !== "Last Price" && (
                        <>
                          <input
                            type="number"
                            value={block.days || ''}
                            onChange={(e) => handleDayChange(block.uniqueId, e.target.value)}
                            placeholder="Days"
                            style={{ marginLeft: "10px", width: "60px" }}
                          />
                          <input
                            type="text"
                            value={block.operation}
                            onChange={(e) => handleOperationChange(block.uniqueId, e.target.value)}
                            placeholder="Operation"
                            style={{ marginLeft: "10px", width: "50px" }}
                          />
                          {index !== blocks.length - 1 && (
                            <select
                              value={block.operator || "+"}
                              onChange={(e) => handleOperatorChange(block.uniqueId, e.target.value)}
                              style={{ marginLeft: "10px" }}
                            >
                              {operators.map((op) => (
                                <option key={op} value={op}>{op}</option>
                              ))}
                            </select>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Expression Block */}
        {expressionBlock && (
          <Droppable droppableId="expressionBlock">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  minHeight: '50px',
                  width: '150px',
                  backgroundColor: '#e0e0e0',
                  padding: '10px',
                  marginBottom: '20px'
                }}
              >
                <Draggable key={expressionBlock.uniqueId} draggableId={expressionBlock.uniqueId} index={0}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        userSelect: 'none',
                        padding: '16px',
                        backgroundColor: '#456C86',
                        color: 'white',
                        ...provided.draggableProps.style
                      }}
                    >
                      {expressionBlock.label}
                      <button onClick={() => setExpressionBlock(null)}>Delete</button>
                    </div>
                  )}
                </Draggable>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}

        {/* Build Expression */}
        <button onClick={handleBuildExpression}>Build Expression</button>

        {/* Submit Expression */}
        <button onClick={handleSubmit}>Submit Expression</button>

        {/* Display Generated Expression */}
        {expression && (
          <div style={{ marginTop: "20px" }}>
            <h3>Generated Expression:</h3>
            <pre>{expression}</pre>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}

export default StrategyBuilder;