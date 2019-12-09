import * as React from 'react';

import { modules } from '../state/module-map';
import { Gain } from './patch-module-gain';
import { Delay } from './patch-module-delay';
import { Filter } from './patch-module-filter';
import { MidiDevice } from './patch-module-midi-device';
import { Oscillator } from './patch-module-oscillator';
import { Sequencer } from './patch-module-sequencer';
import { MidiOscillator } from './patch-module-midi-oscillator';
import { ModuleType } from '../state/patch';

export type ConnectorType = 'CV_IN' | 'SIGNAL_IN' | 'SIGNAL_OUT' | 'MIDI_IN' | 'MIDI_OUT' | 'uninitialized';

export interface IModuleProps {
	moduleKey: string;
	removeModule: (moduleKey: string) => void;
}

export interface IConnector {
	id: string;
	name: string;
	type: ConnectorType;
	getter: () => any;
}

export interface IModule {
	moduleKey: string;
	type: ModuleType;
	initialized?: boolean;
	node?: any;
	connectors?: IConnector[];
}

export interface IModuleState {
	module?: IModule;
}

export class ModuleOld extends React.Component<IModuleProps, IModuleState> {
	constructor(props: IModuleProps) {
		super(props);
		this.state = {
			module: modules.get(this.props.moduleKey)
		};
	}

	handleRemove = () => {
		this.props.removeModule(this.props.moduleKey);
	}

	componentDidUpdate = (oldProps: IModuleProps) => {
		if (oldProps.moduleKey !== this.props.moduleKey) {
			this.setState({
				module: modules.get(this.props.moduleKey)
			});
		}
	}

	render() {
		if (this.state.module) {
			return (
				<li className={this.state.module.type === 'FILTER' ? 'double-wide' : ''}>
					<button className="remove-module" type="button" onClick={this.handleRemove} aria-label="remove this module"></button>
					<article className="module">
						{this.state.module && (() => {
							switch (this.state.module.type) {
								case 'GAIN':
									return <Gain {...this.props} />;
								case 'DELAY':
									return <Delay {...this.props} />;
								case 'FILTER':
									return <Filter {...this.props} />;
								case 'OSCILLATOR':
									return <Oscillator {...this.props} />;
								case 'SEQUENCER':
									return <Sequencer {...this.props} />;
								case 'MIDI_DEVICE':
									return <MidiDevice {...this.props} />;
								case 'MIDI_OSCILLATOR':
									return <MidiOscillator {...this.props} />;
								default:
									this.props.removeModule(this.props.moduleKey);
									return null;
							}
						})()}
					</article>
				</li>
			)
		} else {
			this.props.removeModule(this.props.moduleKey);
			return null;
		}
	}
}

