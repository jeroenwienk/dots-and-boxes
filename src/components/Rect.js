import React from 'react';

function Rect(props) {
  const { id, x, y, width, height, tile, config } = props;

  const style = {
    strokeWidth: 1,
    stroke: '#000000',
    fill: '#000000',
    opacity: 0,
  };

  if (tile.occupiedBy) {
    style.stroke = config.colors.players[tile.occupiedBy];
    style.fill = config.colors.players[tile.occupiedBy];
    style.opacity = 1;
  }

  return (
    <rect id={id} width={width} height={height} x={x} y={y} style={style} />
  );
}

export default Rect;
