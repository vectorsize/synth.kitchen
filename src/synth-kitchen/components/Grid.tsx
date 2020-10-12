import * as React from 'react';

import { GridModule, IGridModuleProps } from './GridModule';

interface IGridDotProps {
  x: number;
  y: number;
  addGridModule: (x: number, y: number) => void;
}

const GridDot: React.FunctionComponent<IGridDotProps> = ({ x, y, addGridModule }) => (
  <button tabIndex={-1} className="dot" type="button" onClick={() => addGridModule(x, y)}>
    <span></span>
  </button>
);

const calcGridCells = (viewportDimension: number) => {
  return Math.floor(viewportDimension / 16);
}

const calcGridPadding = (viewportDimension: number) => {
  return ((viewportDimension / 16) % 1) * 8;
}

export const Grid = () => {
  const [gridDimensions, setGridDimensions] = React.useState({
    width: calcGridCells(window.innerWidth),
    height: calcGridCells(window.innerHeight)
  });
  const [gridPadding, setGridPadding] = React.useState({
    x: calcGridPadding(window.innerWidth),
    y: calcGridPadding(window.innerHeight)
  });

  const handleWindowResize = React.useCallback(() => {
    setGridDimensions({
      width: calcGridCells(window.innerWidth),
      height: calcGridCells(window.innerHeight)
    });
    setGridPadding({
      x: calcGridPadding(window.innerWidth),
      y: calcGridPadding(window.innerHeight)
    });
  }, [setGridDimensions]);
  React.useEffect(() => {
    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  const [gridModules, setGridModules] = React.useState<IGridModuleProps[]>([]);
  const addGridModule = React.useCallback((x: number, y: number) => {
    setGridModules([...gridModules, { x, y }]);
  }, [gridModules, setGridModules]);

  const gridCells = React.useMemo(() => {
    const gridCells = [];
    for (let y = 0; y < gridDimensions.height; y++) {
      for (let x = 0; x < gridDimensions.width; x++) {
        gridCells.push(<GridDot key={`${x}_${y}`} x={x} y={y} addGridModule={addGridModule} />);
      }
    }
    return gridCells;
  }, [gridDimensions, gridPadding, addGridModule])

  return (
    <div className="grid-wrapper">
      <div className="grid" style={{
        padding: `${gridPadding.y}px ${gridPadding.x}px`
      }}>
        {gridCells}
      </div>
      {gridModules.map((module, index) => (
        <GridModule {...module} paddingX={gridPadding.x} paddingY={gridPadding.y} key={index} />
      ))}
    </div>
  );
}
