import * as React from 'react';

interface IGridDotProps {
  x: number;
  y: number;
}

const GridDot: React.FunctionComponent<IGridDotProps> = ({ x, y }) => (
  <button tabIndex={-1} className="dot" type="button" onClick={() => console.log(x, y)}>
    <span></span>
  </button>
);

const calcGridWidth = (vw: number) => {
  return Math.floor(vw / 16);
}

const calcGridHeight = (vh: number) => {
  return Math.floor(vh / 16);
}

export const Grid = () => {
  const [gridWidth, setGridWidth] = React.useState(calcGridWidth(window.innerWidth));
  const [gridHeight, setGridHeight] = React.useState(calcGridHeight(window.innerHeight));

  const handleWindowResize = React.useCallback(() => {
    setGridWidth(calcGridWidth(window.innerWidth));
    setGridHeight(calcGridHeight(window.innerHeight));
  }, []);

  React.useEffect(() => {
    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  const widthArray = new Array(gridWidth).map(() => undefined);
  const heightArray = new Array(gridHeight).map(() => undefined);
  const gridCells = [];

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      gridCells.push(<GridDot key={`${x}_${y}`} x={x} y={y} />);
    }
  }

  return (
    <div className="infinite-grid" style={{

    }}>
      {gridCells.map(cell => cell)}
    </div>
  )
}
