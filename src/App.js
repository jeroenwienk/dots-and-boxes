import React from 'react';
import './App.css';

import Line from './components/Line';
import Rect from './components/Rect';

class App extends React.Component {
  state = {
    config: {
      width: 800,
      height: 800,
      rows: 5,
      columns: 5,
      offset: 6,
      colors: {
        players: {
          1: '#61dafb',
          2: '#B2FF59',
        },
      },
    },
    playerNum: 1,
    occupiedLinesMap: {},
    tilesMatrix: [],
  };

  componentDidMount() {
    this.init();
  }

  init = () => {
    const { config } = this.state;

    const tilesMatrix = [];

    for (let y = 0; y < config.rows; y++) {
      tilesMatrix.push([]);
      for (let x = 0; x < config.columns; x++) {
        tilesMatrix[y].push({ row: y, column: x, count: 0, occupiedBy: null });
      }
    }

    this.setState({
      tilesMatrix,
      occupiedLinesMap: {},
      playerNum: Math.random() > 0.5 ? 1 : 2,
    });
  };

  getNextPlayerNum() {
    return this.state.playerNum === 1 ? 2 : 1;
  }

  getAdjacentTiles(tilesMatrix, id) {
    let [orientation, row, column] = id.split('-');
    row = parseInt(row, 10);
    column = parseInt(column, 10);

    const tiles = [];
    if (orientation === Line.HORIZONTAL) {
      if (row === 0) {
        tiles.push(tilesMatrix[row][column]);
      } else if (row === tilesMatrix.length) {
        tiles.push(tilesMatrix[row - 1][column]);
      } else {
        tiles.push(tilesMatrix[row - 1][column]);
        tiles.push(tilesMatrix[row][column]);
      }
    } else if (orientation === Line.VERTICAL) {
      if (column === 0) {
        tiles.push(tilesMatrix[row][column]);
      } else if (column === tilesMatrix[0].length) {
        tiles.push(tilesMatrix[row][column - 1]);
      } else {
        tiles.push(tilesMatrix[row][column - 1]);
        tiles.push(tilesMatrix[row][column]);
      }
    }
    return tiles;
  }

  getUpdatedTilesMatrix(tilesMatrix, updatedTilesMap) {
    return tilesMatrix.map((row) => {
      return row.map((tile) => {
        const key = `${tile.row}${tile.column}`;
        return updatedTilesMap[key] || tile;
      });
    });
  }

  handleLineClick = (event) => {
    const { tilesMatrix, occupiedLinesMap, playerNum } = this.state;

    const id = event.currentTarget.id;
    const updatedTilesMap = {};
    let extraTurn = false;

    this.getAdjacentTiles(tilesMatrix, id).forEach((tile) => {
      const key = `${tile.row}${tile.column}`;
      const newTile = { ...tile };

      if (newTile.count + 1 < 4) {
        newTile.count++;
      } else {
        newTile.count++;
        newTile.occupiedBy = playerNum;
        extraTurn = true;
      }

      updatedTilesMap[key] = newTile;
    });

    this.setState({
      occupiedLinesMap: {
        ...occupiedLinesMap,
        [id]: { occupiedBy: playerNum },
      },
      tilesMatrix: this.getUpdatedTilesMatrix(tilesMatrix, updatedTilesMap),
      playerNum: extraTurn ? playerNum : this.getNextPlayerNum(),
    });
  };

  getCoordinates(row, column, vertical) {
    const { width, height, rows, columns, offset } = this.state.config;

    const xLength = (width - 2 * offset) / columns;
    const yLength = (height - 2 * offset) / rows;

    return {
      x1: column * xLength + offset,
      y1: row * yLength + offset,
      x2: (column + (vertical ? 0 : 1)) * xLength + offset,
      y2: (row + (vertical ? 1 : 0)) * yLength + offset,
      xLength: xLength,
      yLength: yLength,
    };
  }

  getLineKey(row, column, vertical) {
    return `${vertical ? Line.VERTICAL : Line.HORIZONTAL}-${row}-${column}`;
  }

  getLine(row, column, vertical) {
    const { occupiedLinesMap, config } = this.state;
    const coordinates = this.getCoordinates(row, column, vertical);
    const lineKey = this.getLineKey(row, column, vertical);

    return (
      <Line
        id={lineKey}
        key={lineKey}
        x1={coordinates.x1}
        y1={coordinates.y1}
        x2={coordinates.x2}
        y2={coordinates.y2}
        occupiedLinesMap={occupiedLinesMap}
        config={config}
        onClick={this.handleLineClick}
      />
    );
  }

  renderLines() {
    const { tilesMatrix } = this.state;
    const lines = [];

    tilesMatrix.forEach((row, rowIndex) => {
      return row.forEach((tile, tileIndex) => {
        lines.push(this.getLine(tile.row, tile.column, false));
        lines.push(this.getLine(tile.row, tile.column, true));

        rowIndex === tilesMatrix.length - 1 &&
          lines.push(this.getLine(tile.row + 1, tile.column, false));
        tileIndex === row.length - 1 &&
          lines.push(this.getLine(tile.row, tile.column + 1, true));
      });
    });

    return lines;
  }

  renderRectangles() {
    const { tilesMatrix, config } = this.state;
    const rectangles = [];

    tilesMatrix.forEach((row) => {
      return row.forEach((tile) => {
        const coordinates = this.getCoordinates(tile.row, tile.column, false);

        const xPadding = coordinates.xLength / 12;
        const yPadding = coordinates.xLength / 12;

        const key = `rect-${tile.row}-${tile.column}`;
        rectangles.push(
          <Rect
            id={key}
            key={key}
            x={coordinates.x1 + xPadding}
            y={coordinates.y1 + yPadding}
            width={coordinates.xLength - xPadding * 2}
            height={coordinates.yLength - yPadding * 2}
            tile={tile}
            config={config}
          />
        );
      });
    });

    return rectangles;
  }

  render() {
    const { tilesMatrix, playerNum } = this.state;
    const { width, height, colors } = this.state.config;

    const scores = tilesMatrix.reduce(
      (accumulator, row) => {
        row.forEach((tile) => {
          if (tile.occupiedBy) {
            accumulator[tile.occupiedBy] += 1;
          }
        });
        return accumulator;
      },
      { 1: 0, 2: 0 }
    );

    return (
      <div className="App">
        <header className="App-header">
          <div>
            <span style={{ fontSize: 64, color: colors.players[1] }}>
              {scores[1]}
            </span>
            <span style={{ fontSize: 64 }}>&nbsp;:&nbsp;</span>
            <span style={{ fontSize: 64, color: colors.players[2] }}>
              {scores[2]}
            </span>
          </div>
          <div
            style={{
              width: 256,
              height: 32,
              backgroundColor: colors.players[playerNum],
            }}
          />
          <button className="Button" onClick={this.init}>
            Reset
          </button>
        </header>
        <div className="App-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
          >
            {this.renderLines()}
            {this.renderRectangles()}
          </svg>
        </div>
      </div>
    );
  }
}

export default App;
