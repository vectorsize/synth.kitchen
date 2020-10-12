import * as React from 'react';

export interface IGridModuleProps {
  x: number;
  y: number;
}

export interface IGridModuleSpacing {
  paddingX: number;
  paddingY: number;
}

export const GridModule: React.FunctionComponent<IGridModuleProps & IGridModuleSpacing> = ({ x, y, paddingX = 0, paddingY = 0, size }) => (
  <div className={`grid-module ${size}`} style={{
    top: y * 16 + paddingY,
    left: x * 16 + paddingX
  }} />
);

