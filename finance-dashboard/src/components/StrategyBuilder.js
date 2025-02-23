import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './StrategyBuilder.css';

function StrategyBuilder() {
  const [blocks, setBlocks] = useState([]);
  const [enterLongOperands, setEnterLongOperands] = useState({ left: '', right: '' });
  const [exitLongOperands, setExitLongOperands] = useState({ left: '', right: '' });
  const [enterLongCondition, setEnterLongCondition] = useState('>');
  const [exitLongCondition, setExitLongCondition] = useState('<');
  const [expression, setExpression] = useState('');
  const [expressionBlock, setExpressionBlock] = useState(null);
  const navigate = useNavigate();

  const availableBlocks = [
    { id: '1', label: 'Moving Average' },
    { id: '2', label: 'High' },
    { id: '3', label: 'Low' },
    { id: '4', label: 'Std Dev' },
    { id: '5', label: 'Last Price' },
  ];

  const operators = ['+', '-', '*', '/'];
  const conditions = ['>', '<', '>=', '<=', '='];

  // Define the Expression class
  class Expression {
    constructor(arithmOperator, indicator, condition, leftOperand, rightOperand) {
      this.arithmOperator = arithmOperator;
      this.indicator = indicator;
      this.condition = condition;
      this.leftOperand = leftOperand;
      this.rightOperand = rightOperand;
    }
  }

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
        operator: draggedBlock.operator || '+',
        operation: draggedBlock.operation || ''
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
    const strategyExpr = blocks.map((block, index) => {
      const days = block.days ? `(${block.days})` : '';
      const operation = block.operation ? block.operation : '';
      const operator = index < blocks.length - 1 ? block.operator || '+' : ''; // Use the selected operator
      return `${block.label}${days}${operation} ${operator}`;
    }).join('');

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
    const enterLongExpr = new Expression(
      enterLongCondition,
      enterLongOperands.left,
      enterLongOperands.right,
      enterLongOperands.left,
      enterLongOperands.right
    );

    const exitLongExpr = new Expression(
      exitLongCondition,
      exitLongOperands.left,
      exitLongOperands.right,
      exitLongOperands.left,
      exitLongOperands.right
    );

    const strategyExpr = blocks.map((block, index) => {
      const days = block.days ? `(${block.days})` : '';
      const operation = block.operation ? block.operation : '';
      const operator = index < blocks.length - 1 ? block.operator || '+' : ''; // Use the selected operator
      return new Expression(
        operator,
        block.label,
        block.operation,
        block.label,
        block.days
      );
    });

    const fullExpression = {
      enterLong: enterLongExpr,
      exitLong: exitLongExpr,
      strategy: strategyExpr,
      expression: expression
    };

    fetch('http://localhost:8000/api/submit-expression', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullExpression),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        navigate('/backtesting'); // Redirect to BackTesting page
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="container">
        {/* Enter Long */}
        <h3>Enter Long</h3>
        <div className="droppable-container">
          <Droppable droppableId="enterLongLeft">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="droppable"
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
            className="select"
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
                className="droppable"
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
        <div className="droppable-container">
          <Droppable droppableId="exitLongLeft">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="droppable"
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
            className="select"
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
                className="droppable"
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
                      className="draggable"
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
                      className="strategy-block"
                    >
                      {block.label}
                      {block.label !== "Last Price" && (
                        <>
                          <input
                            type="number"
                            value={block.days || ''}
                            onChange={(e) => handleDayChange(block.uniqueId, e.target.value)}
                            placeholder="Days"
                          />
                          <input
                            type="text"
                            value={block.operation}
                            onChange={(e) => handleOperationChange(block.uniqueId, e.target.value)}
                            placeholder="Operation"
                          />
                          {index !== blocks.length - 1 && (
                            <select
                              value={block.operator || "+"}
                              onChange={(e) => handleOperatorChange(block.uniqueId, e.target.value)}
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
                className="droppable"
                style={{ marginBottom: '20px' }}
              >
                <Draggable key={expressionBlock.uniqueId} draggableId={expressionBlock.uniqueId} index={0}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="draggable"
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
          <div className="generated-expression">
            <h3>Generated Expression:</h3>
            <pre>{expression}</pre>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}

export default StrategyBuilder;