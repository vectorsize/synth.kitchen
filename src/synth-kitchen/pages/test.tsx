import * as React from 'react';

import Graph1 from '../test/graph1.json';
import { audioContext } from '../io/utils/audio-context';
import { IAudioNode, IAudioContext, IAudioDestinationNode, IAudioParam, IOscillatorNode } from 'standardized-audio-context';


enum NodeType {
  OscillatorNode = "OscillatorNode",
  GainNode = "GainNode"
}

type ParameterName = 'frequency' | 'type' | 'detune' | 'gain';

interface IGraphNode {
  id: number,
  type: NodeType,
  parameters?: {
    name: ParameterName,
    value: string | number
  }[]
}

interface IGraphConnection {
  source: {
    id: number
  },
  target: {
    id: number,
    parameter?: ParameterName
  }
}

interface IGraph {
  nodes: IGraphNode[],
  connections: IGraphConnection[]
}

const createNode = (node: IGraphNode) => {
  let result: IAudioNode<IAudioContext>;
  switch (node.type) {
    case NodeType.OscillatorNode:
      const osc = audioContext.createOscillator();
      osc.start()
      result = osc;
      break;
    case NodeType.GainNode:
      result = audioContext.createGain();
      break;
    default:
      throw "aw shit";
  }
  if (node.parameters) {
    node.parameters.forEach(parameter => {
      try {
        if (typeof parameter.value === 'string') {
          (result as any)[parameter.name] = parameter.value;
        } else {
          (result as any)[parameter.name].setValueAtTime(parameter.value as any, audioContext.currentTime);
        }
      } catch (err) {
        console.error(err);
      }
    });
  }
  return result;
}

const connectNodes = (nodes: (IAudioNode<IAudioContext> | IAudioDestinationNode<IAudioContext>)[], connection: IGraphConnection) => {
  try {
    const source = nodes[connection.source.id] as IAudioNode<IAudioContext>; // AudioContext cannot be a source
    const target = nodes[connection.target.id];
    if (connection.target.parameter) {
      console.log('connecting:', source, (target as any)[connection.target.parameter]);
      source.connect((target as any)[connection.target.parameter]);
    } else {
      console.log('connecting:', source, target);
      source.connect(target);
    }
  } catch (err) {
    console.error("couldn't connect", connection.source.id, connection.target.id, connection.target.parameter);
    console.error(err);
  }
}

const testGraph = Graph1 as IGraph;

export const Test = () => {
  const nodes: (IAudioNode<IAudioContext> | IAudioDestinationNode<IAudioContext>)[] = [audioContext.destination];
  const resume = () => {
    audioContext.resume();
    testGraph.nodes.forEach((node) => {
      nodes.push(createNode(node));
    });
    testGraph.connections.forEach((connection) => {
      connectNodes(nodes, connection);
    });
  }
  return <button onClick={resume}>hi</button>;
}