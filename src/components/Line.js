import React, { useState } from 'react';

function Line(props) {
  const { id, x1, y1, x2, y2, occupiedLinesMap, onClick, config } = props;
  const [isHovered, setIsHovered] = useState(false);

  const color = isHovered ? '#FAFAFA' : '#9E9E9E';
  const lineStyles = { stroke: color, strokeWidth: 4 };
  const occupied = occupiedLinesMap[id];

  if (occupied != null) {
    lineStyles.stroke = config.colors.players[occupied.occupiedBy];
  }

  return (
    <>
      <line
        id={`display-${id}`}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        style={lineStyles}
      />
      <line
        id={id}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        style={{
          ...lineStyles,
          strokeWidth: lineStyles.strokeWidth * 6,
          strokeOpacity: 0,
          cursor: 'pointer',
        }}
        onClick={!occupied ? onClick : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    </>
  );
}

Line.VERTICAL = 'vertical';
Line.HORIZONTAL = 'horizontal';

export default Line;
