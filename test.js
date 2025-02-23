import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function StrategyBuilder() {
  const [blocks, setBlocks] = useState([]);
  const [enterLongOperands, setEnterLongOperands] = useState({ left: '', right: '' });
  const [exitLongOperands, setExitLongOperands] = useState({ left: '', right: '' });
  const [expression, setExpression] = useState('');

  const availableBlocks = [
    { id: '1', label: 'Moving Average' },
    { id: '2', label: 'High' },
    { id: '3', label: 'Low' },
    { id: '4', label: 'Std Dev' },
    { id: '5', label: 'Last Price' },
  ];

  const operators = ['+', '-', '*', '/'];

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const draggedBlock = availableBlocks.find(block => block.id === result.draggableId);

    if (result.destination.droppableId === 'enterLongLeft') {
      setEnterLongOperands({ ...enterLongOperands, left: draggedBlock.label });
    } else if (result.destination.droppableId === 'enterLongRight') {
      setEnterLongOperands({ ...enterLongOperands, right: draggedBlock.label });
    } else if (result.destination.droppableId === 'exitLongLeft') {
      setExitLongOperands({ ...exitLongOperands, left: draggedBlock.label });
    } else if (result.destination.droppableId === 'exitLongRight') {
      setExitLongOperands({ ...exitLongOperands, right: draggedBlock.label });
    } else if (result.destination.droppableId === 'strategy') {
      const newBlock = { ...draggedBlock, uniqueId: Date.now().toString(), days: '' };
      setBlocks([...blocks, newBlock]);
    }
  };

  const handleDayChange = (uniqueId, days) => {
    setBlocks(blocks.map(block =>
      block.uniqueId === uniqueId ? { ...block, days } : block
    ));
  };

  const handleBuildExpression = () => {
    const enterLongExpr = `Enter Long when ${enterLongOperands.left} > ${enterLongOperands.right}`;
    const exitLongExpr = `Exit Long when ${exitLongOperands.left} < ${exitLongOperands.right}`;
    const strategyExpr = blocks.map(block => `${block.label}(${block.days})`).join(' + ');
    setExpression(`${enterLongExpr}\n${exitLongExpr}\nStrategy Expression: ${strategyExpr}`);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div>
        <h2>Strategy Builder</h2>

        {/* Enter Long Operands */}
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

        {/* Exit Long Operands */}
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
                        <input
                          type="number"
                          value={block.days || ''}
                          onChange={(e) => handleDayChange(block.uniqueId, e.target.value)}
                          placeholder="Days"
                          style={{ marginLeft: 10 }}
                        />
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Build Expression */}
        <button onClick={handleBuildExpression}>Build Expression</button>

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
